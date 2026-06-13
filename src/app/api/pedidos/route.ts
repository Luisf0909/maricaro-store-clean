import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { extractIVA, getShippingCost } from '@/lib/utils'
import { normalizeRUT } from '@/lib/rut'
import type { CartItem } from '@/types'

interface CreateOrderBody {
  items: CartItem[]
  shipping: {
    full_name: string
    phone: string
    address: string
    apartment?: string
    city: string
    region: string
    zip_code?: string
  }
  payment_method: 'mercadopago' | 'flow_webpay'
  customer_notes?: string
  is_guest?: boolean
  customer_email?: string
  customer_rut?: string
  coupon_code?: string
  coupon_id?: string
  coupon_discount?: number
  accepts_marketing?: boolean
}

export async function POST(req: Request) {
  const body: CreateOrderBody = await req.json()
  const { items, shipping, payment_method, customer_notes,
          is_guest, customer_email, customer_rut,
          coupon_code, coupon_id, coupon_discount,
          accepts_marketing } = body

  const admin = createAdminClient()
  let userId: string | null = null

  if (!is_guest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    userId = user.id
  } else {
    if (!customer_email || !customer_rut) {
      return NextResponse.json({ error: 'Correo y RUT son requeridos para compra sin registro' }, { status: 400 })
    }
  }

  if (!items?.length) return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })

  // Verify stock and fetch authoritative prices + digital flag
  const verifiedItems: Array<{ item: CartItem; unitPrice: number; isDigital: boolean; digitalFilePath?: string | null }> = []
  let hasPhysical = false

  for (const item of items) {
    if (item.variantId) {
      const { data: variant } = await admin
        .from('product_variants')
        .select('stock, is_active, price')
        .eq('id', item.variantId)
        .single()
      if (!variant?.is_active || variant.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente para ${item.name}` }, { status: 409 })
      }
      verifiedItems.push({ item, unitPrice: variant.price, isDigital: false })
      hasPhysical = true
    } else {
      const { data: product } = await admin
        .from('products')
        .select('stock, is_active, price, sale_price, made_to_order, is_digital, digital_file_path')
        .eq('id', item.productId)
        .single()
      if (!product?.is_active) {
        return NextResponse.json({ error: `${item.name} no está disponible` }, { status: 409 })
      }
      if (product.is_digital) {
        if (!product.digital_file_path) {
          return NextResponse.json({ error: `${item.name} no tiene archivo disponible` }, { status: 409 })
        }
      } else {
        if (!product.made_to_order && product.stock < item.quantity) {
          return NextResponse.json({ error: `Stock insuficiente para ${item.name}` }, { status: 409 })
        }
        hasPhysical = true
      }
      verifiedItems.push({
        item,
        unitPrice: product.sale_price ?? product.price,
        isDigital: product.is_digital ?? false,
        digitalFilePath: product.digital_file_path,
      })
    }
  }

  const subtotal    = verifiedItems.reduce((sum, { item, unitPrice }) => sum + unitPrice * item.quantity, 0)
  const shippingCost = hasPhysical ? getShippingCost(subtotal) : 0
  const discount    = coupon_discount ?? 0
  const total       = subtotal + shippingCost - discount
  const { iva }     = extractIVA(subtotal)

  const { data: orderNumber } = await admin.rpc('generate_order_number')

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      order_number:        orderNumber,
      user_id:             userId,
      is_guest:            is_guest ?? false,
      customer_email:      customer_email?.toLowerCase() ?? null,
      customer_rut:        customer_rut ? normalizeRUT(customer_rut) : null,
      shipping_full_name:  shipping.full_name,
      shipping_phone:      shipping.phone,
      shipping_address:    shipping.address,
      shipping_apartment:  shipping.apartment ?? null,
      shipping_city:       shipping.city,
      shipping_region:     shipping.region,
      shipping_zip:        shipping.zip_code ?? null,
      subtotal,
      shipping_cost:       shippingCost,
      discount,
      coupon_id:           coupon_id ?? null,
      coupon_code:         coupon_code ?? null,
      coupon_discount:     discount,
      tax_amount:          iva,
      total,
      payment_method,
      payment_status:      'pending',
      status:              'pending',
      customer_notes:      customer_notes ?? null,
      accepts_marketing:   accepts_marketing ?? false,
    })
    .select()
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 })
  }

  // Insert order items
  const orderItems = verifiedItems.map(({ item, unitPrice }) => ({
    order_id:          order.id,
    product_id:        item.productId,
    variant_id:        item.variantId ?? null,
    product_name:      item.name,
    variant_name:      item.variantName ?? null,
    product_image_url: item.imageUrl ?? null,
    quantity:          item.quantity,
    unit_price:        unitPrice,
    subtotal:          unitPrice * item.quantity,
  }))

  await admin.from('order_items').insert(orderItems)

  // Decrement stock for physical products only
  for (const { item, isDigital } of verifiedItems) {
    if (isDigital) continue
    if (item.variantId) {
      await admin.rpc('decrement_variant_stock', { variant_id: item.variantId, qty: item.quantity }).throwOnError()
    } else {
      const { data: p } = await admin.from('products').select('stock, made_to_order').eq('id', item.productId).single()
      if (p && (p.stock > 0 || !p.made_to_order)) {
        await admin.rpc('decrement_product_stock', { product_id: item.productId, qty: item.quantity }).throwOnError()
      }
    }
  }

  // Create download tokens for digital products
  const digitalTokens = verifiedItems
    .filter(({ isDigital, digitalFilePath }) => isDigital && digitalFilePath)
    .map(({ item }) => ({
      order_id:      order.id,
      product_id:    item.productId,
      max_downloads: 5,
      expires_at:    new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    }))

  if (digitalTokens.length) {
    await admin.from('order_download_tokens').insert(digitalTokens)
  }

  // Register coupon use
  if (coupon_id && customer_email && customer_rut) {
    await admin.from('coupon_uses').insert({
      coupon_id,
      order_id:       order.id,
      user_id:        userId,
      customer_email: customer_email.toLowerCase(),
      customer_rut:   normalizeRUT(customer_rut),
    })
    const { data: c } = await admin.from('coupons').select('uses_count').eq('id', coupon_id).single()
    if (c) await admin.from('coupons').update({ uses_count: c.uses_count + 1 }).eq('id', coupon_id)
  }

  return NextResponse.json({ orderId: order.id, orderNumber: order.order_number })
}
