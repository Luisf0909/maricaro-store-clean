import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHmac, timingSafeEqual } from 'crypto'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

function verifyMPSignature(request: Request, dataId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return false

  const xSignature = request.headers.get('x-signature') ?? ''
  const xRequestId = request.headers.get('x-request-id') ?? ''

  const parts: Record<string, string> = {}
  xSignature.split(',').forEach((part) => {
    const [k, v] = part.split('=')
    if (k && v) parts[k.trim()] = v.trim()
  })

  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  // MP signature format: HMAC-SHA256("id:<id>;request-id:<req-id>;ts:<ts>;")
  const toSign = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = createHmac('sha256', secret).update(toSign).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'))
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const body = await req.json()

  if (body.type !== 'payment' || !body.data?.id) {
    return NextResponse.json({ received: true })
  }

  if (!verifyMPSignature(req, String(body.data.id))) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
  }

  const paymentClient = new Payment(mp)
  const payment = await paymentClient.get({ id: body.data.id })

  const orderId = payment.external_reference
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

  const updates: Record<string, unknown> = {
    payment_id: String(payment.id),
    payment_data: payment,
  }

  if (payment.status === 'approved') {
    updates.payment_status = 'paid'
    updates.status = 'confirmed'
    updates.paid_at = new Date().toISOString()
  } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
    updates.payment_status = 'failed'
  }

  await admin.from('orders').update(updates).eq('id', orderId)

  return NextResponse.json({ received: true })
}
