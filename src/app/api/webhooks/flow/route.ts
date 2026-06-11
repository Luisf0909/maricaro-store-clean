import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getFlowPaymentStatus } from '@/lib/payments/flow'

export async function POST(req: Request) {
  const formData = await req.formData()
  const token = formData.get('token') as string

  if (!token) return NextResponse.json({ received: true })

  // Flow security model: verify token by calling back to Flow's API with our signed credentials.
  // If the token is invalid or forged, Flow returns an error.
  let payment: Awaited<ReturnType<typeof getFlowPaymentStatus>>
  try {
    payment = await getFlowPaymentStatus(token)
  } catch {
    return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
  }

  if (!payment || payment.status === undefined) {
    return NextResponse.json({ error: 'Respuesta de Flow inválida' }, { status: 400 })
  }

  // commerceOrder es el orderId que pasamos al crear el pago
  const orderId = payment.commerceOrder
  if (!orderId) return NextResponse.json({ received: true })

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('orders')
    .select('id, payment_status')
    .eq('id', orderId)
    .single()

  if (!order || order.payment_status === 'paid') {
    return NextResponse.json({ received: true })
  }

  const updates: Record<string, unknown> = { payment_data: payment }

  // Flow status 2 = pagado
  if (payment.status === 2) {
    updates.payment_status = 'paid'
    updates.status = 'confirmed'
    updates.paid_at = new Date().toISOString()
  } else if (payment.status === 3 || payment.status === 4) {
    updates.payment_status = 'failed'
  }

  await admin.from('orders').update(updates).eq('id', orderId)

  return NextResponse.json({ received: true })
}
