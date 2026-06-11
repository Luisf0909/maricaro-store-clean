import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { createFlowPayment } from '@/lib/payments/flow'

export async function POST(req: Request) {
  const { orderId } = await req.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = createAdminClient()

  // Verify ownership: only the order's owner can initiate payment
  const { data: order } = await admin
    .from('orders')
    .select('id, total, shipping_full_name, user_id')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const { url, token } = await createFlowPayment({
    orderId,
    amount: order.total,
    subject: `Pedido MariaCaroStore`,
    email: user.email!,
    urlReturn: `${appUrl}/confirmacion/${orderId}`,
    urlConfirmation: `${appUrl}/api/webhooks/flow`,
  })

  await admin.from('orders').update({ payment_id: token }).eq('id', orderId)

  return NextResponse.json({ redirectUrl: url })
}
