import { Resend } from 'resend'
import { render } from '@react-email/render'
import { OrderConfirmEmail } from '@/emails/OrderConfirmEmail'
import { OrderShippedEmail } from '@/emails/OrderShippedEmail'
import { DigitalDeliveryEmail } from '@/emails/DigitalDeliveryEmail'
import { WelcomeEmail } from '@/emails/WelcomeEmail'
import { createAdminClient } from '@/lib/supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.EMAIL_FROM ?? 'no-reply@mariacarostore.cl'
const SITE   = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Maria Caro Store'

async function logEmail(params: {
  to: string; subject: string; template: string
  orderId?: string; userId?: string
  providerId?: string | null; error?: string
  status: 'sent' | 'failed'
}) {
  try {
    const admin = createAdminClient()
    await admin.from('email_notifications').insert({
      to_email:    params.to,
      subject:     params.subject,
      template:    params.template,
      order_id:    params.orderId    ?? null,
      user_id:     params.userId     ?? null,
      provider_id: params.providerId ?? null,
      error:       params.error      ?? null,
      status:      params.status,
    })
  } catch { /* non-critical */ }
}

// ── Order confirmation ────────────────────────────────────────────────────

export async function sendOrderConfirmEmail(params: {
  to: string; customerName: string; orderId: string
  orderNumber: string; items: Parameters<typeof OrderConfirmEmail>[0]['items']
  shippingCost: number; discount: number; total: number
  shippingAddress?: Parameters<typeof OrderConfirmEmail>[0]['shippingAddress']
  isDigitalOnly?: boolean
}) {
  const html = render(OrderConfirmEmail({
    orderNumber:     params.orderNumber,
    customerName:    params.customerName,
    items:           params.items,
    shippingCost:    params.shippingCost,
    discount:        params.discount,
    total:           params.total,
    shippingAddress: params.shippingAddress,
    isDigitalOnly:   params.isDigitalOnly,
  }))

  const subject = `✅ Pedido ${params.orderNumber} confirmado — ${SITE}`

  try {
    const { data } = await resend.emails.send({
      from:    FROM,
      to:      params.to,
      subject,
      html:    await html,
    })
    await logEmail({ to: params.to, subject, template: 'order_confirm', orderId: params.orderId, status: 'sent', providerId: data?.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await logEmail({ to: params.to, subject, template: 'order_confirm', orderId: params.orderId, status: 'failed', error: msg })
    console.error('[email] order_confirm failed:', msg)
  }
}

// ── Order shipped ─────────────────────────────────────────────────────────

export async function sendOrderShippedEmail(params: {
  to: string; customerName: string; orderId: string; orderNumber: string
  trackingCode?: string | null; trackingUrl?: string | null; carrier?: string | null
}) {
  const html = render(OrderShippedEmail({
    orderNumber:  params.orderNumber,
    customerName: params.customerName,
    trackingCode: params.trackingCode,
    trackingUrl:  params.trackingUrl,
    carrier:      params.carrier,
  }))

  const subject = `🚚 Tu pedido ${params.orderNumber} fue despachado — ${SITE}`

  try {
    const { data } = await resend.emails.send({ from: FROM, to: params.to, subject, html: await html })
    await logEmail({ to: params.to, subject, template: 'order_shipped', orderId: params.orderId, status: 'sent', providerId: data?.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await logEmail({ to: params.to, subject, template: 'order_shipped', orderId: params.orderId, status: 'failed', error: msg })
    console.error('[email] order_shipped failed:', msg)
  }
}

// ── Digital delivery ──────────────────────────────────────────────────────

export async function sendDigitalDeliveryEmail(params: {
  to: string; customerName: string; orderId: string; orderNumber: string
  downloads: Parameters<typeof DigitalDeliveryEmail>[0]['downloads']
}) {
  const html = render(DigitalDeliveryEmail({
    orderNumber:  params.orderNumber,
    customerName: params.customerName,
    downloads:    params.downloads,
  }))

  const subject = `📥 Tus archivos digitales están listos — ${params.orderNumber}`

  try {
    const { data } = await resend.emails.send({ from: FROM, to: params.to, subject, html: await html })
    await logEmail({ to: params.to, subject, template: 'digital_delivery', orderId: params.orderId, status: 'sent', providerId: data?.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await logEmail({ to: params.to, subject, template: 'digital_delivery', orderId: params.orderId, status: 'failed', error: msg })
    console.error('[email] digital_delivery failed:', msg)
  }
}

// ── Welcome ───────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(params: {
  to: string; customerName: string; userId: string
}) {
  const html = render(WelcomeEmail({ customerName: params.customerName, email: params.to }))
  const subject = `¡Bienvenida a ${SITE}, ${params.customerName}! 🙏`

  try {
    const { data } = await resend.emails.send({ from: FROM, to: params.to, subject, html: await html })
    await logEmail({ to: params.to, subject, template: 'welcome', userId: params.userId, status: 'sent', providerId: data?.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await logEmail({ to: params.to, subject, template: 'welcome', userId: params.userId, status: 'failed', error: msg })
    console.error('[email] welcome failed:', msg)
  }
}
