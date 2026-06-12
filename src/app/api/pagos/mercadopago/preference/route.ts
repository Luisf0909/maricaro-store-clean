import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

interface CartItem {
  product_id?: string
  id?: string
  product_name?: string
  name?: string
  variant_name?: string
  quantity: number
  unit_price?: number
  price?: number
}

interface PreferenceBody {
  items: CartItem[]
  orderId: string
  userEmail: string
  userName?: string
  userPhone?: string
  userRut?: string
}

export async function POST(req: Request) {
  try {
    // Verificar autenticación del usuario
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await req.json() as PreferenceBody
    const { items, orderId, userEmail, userName, userPhone, userRut } = body

    if (!items?.length || !orderId || !userEmail) {
      return NextResponse.json(
        { error: 'Falta información requerida (items, orderId, userEmail)' },
        { status: 400 }
      )
    }

    // Obtener método de pago Mercado Pago activo
    const admin = createAdminClient()
    const { data: paymentMethod } = await admin
      .from('payment_methods')
      .select('*')
      .eq('provider', 'mercadopago')
      .eq('is_active', true)
      .single()

    if (!paymentMethod?.config?.access_token) {
      return NextResponse.json(
        { error: 'Mercado Pago no está configurado' },
        { status: 400 }
      )
    }

    // Construir preferencia de pago
    const preferenceData = {
      items: items.map((item: CartItem) => ({
        id: item.product_id || item.id,
        title: item.product_name || item.name,
        description: item.variant_name ? `Variante: ${item.variant_name}` : undefined,
        category_id: 'art',
        quantity: item.quantity,
        currency_id: 'CLP',
        unit_price: item.unit_price || item.price,
      })),

      payer: {
        email: userEmail,
        ...(userName && { name: userName }),
        ...(userPhone && { phone: { area_code: '56', number: userPhone.replace(/^56/, '') } }),
        ...(userRut && {
          identification: {
            type: 'DNI',
            number: userRut,
          },
        }),
      },

      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmacion/${orderId}?payment_status=approved`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?payment_status=rejected`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmacion/${orderId}?payment_status=pending`,
      },

      auto_return: 'approved' as const,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      external_reference: orderId,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
    }

    // Crear preferencia via API REST
    const accessToken = paymentMethod.config.access_token as string
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData),
    })

    if (!mpResponse.ok) {
      const error = await mpResponse.json()
      throw new Error(`Mercado Pago API error: ${error.message || 'Unknown error'}`)
    }

    const preference = await mpResponse.json()

    return NextResponse.json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    })
  } catch (err: unknown) {
    console.error('Error creando preferencia MP:', err)
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
