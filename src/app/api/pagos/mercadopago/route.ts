import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { orderId } = await req.json()
  const admin = createAdminClient()

  // Verify ownership: only the order's owner can initiate payment
  const { data: order } = await admin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  const preference = new Preference(mp)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const { id: preferenceId, init_point } = await preference.create({
    body: {
      external_reference: orderId,
      items: order.order_items.map((item: { product_name: string; quantity: number; unit_price: number; product_image_url?: string }) => ({
        title: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'CLP',
        picture_url: item.product_image_url ?? undefined,
      })),
      payer: {
        name: order.shipping_full_name,
        phone: { number: order.shipping_phone ?? '' },
      },
      back_urls: {
        success: `${appUrl}/confirmacion/${orderId}?status=success`,
        failure: `${appUrl}/confirmacion/${orderId}?status=failure`,
        pending: `${appUrl}/confirmacion/${orderId}?status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      statement_descriptor: 'MARICAROSTORE',
    },
  })

  await admin
    .from('orders')
    .update({ payment_id: preferenceId })
    .eq('id', orderId)

  return NextResponse.json({ redirectUrl: init_point })
}
