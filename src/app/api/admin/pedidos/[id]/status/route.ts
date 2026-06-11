export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
// sendOrderShippedEmail is dynamically imported below to avoid build-time issues
import { z } from 'zod'

const schema = z.object({
  status:         z.string(),
  comment:        z.string().nullable().optional(),
  notifyCustomer: z.boolean().default(false),
  trackingCode:   z.string().nullable().optional(),
  trackingUrl:    z.string().nullable().optional(),
  carrier:        z.string().nullable().optional(),
  adminUserId:    z.string().nullable().optional(),
  adminName:      z.string().nullable().optional(),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const admin = createAdminClient()

  // Check admin role
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || !['admin', 'operator'].includes(profile.role)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { status, comment, notifyCustomer, trackingCode, trackingUrl, carrier, adminUserId, adminName } = parsed.data

  // Get current order status
  const { data: order } = await admin
    .from('orders')
    .select('status, payment_status, customer_email, shipping_full_name, order_number, is_guest, shipped_at, delivered_at, tracking_code, tracking_url, carrier')
    .eq('id', params.id)
    .single()

  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  // Build update
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (trackingCode !== undefined) updateData.tracking_code = trackingCode
  if (trackingUrl  !== undefined) updateData.tracking_url  = trackingUrl
  if (carrier      !== undefined) updateData.carrier       = carrier
  if (status === 'shipped' && !order.shipped_at) updateData.shipped_at = new Date().toISOString()
  if (status === 'delivered' && !order.delivered_at) updateData.delivered_at = new Date().toISOString()

  // Update order
  const { error: updateError } = await admin
    .from('orders')
    .update(updateData)
    .eq('id', params.id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Insert manual history entry with comment/tracking/notify info
  await admin.from('order_status_history').insert({
    order_id:               params.id,
    previous_status:        order.status,
    new_status:             status,
    changed_by_user_id:     adminUserId || user.id,
    changed_by_name:        adminName || user.email,
    comment:                comment || null,
    customer_notified:      notifyCustomer,
    tracking_code:          trackingCode || null,
    tracking_url:           trackingUrl  || null,
    carrier:                carrier      || null,
  })

  // ── Auto-send email when status = 'shipped' and notifyCustomer is true ──
  let emailSent = false
  let emailError: string | null = null

  if (
    status === 'shipped' &&
    order.status !== 'shipped' &&  // only if this is a NEW 'shipped' transition
    notifyCustomer &&
    order.customer_email
  ) {
    try {
      const { sendOrderShippedEmail } = await import('@/lib/email')
      await sendOrderShippedEmail({
        to:           order.customer_email,
        customerName: order.shipping_full_name ?? 'Cliente',
        orderId:      params.id,
        orderNumber:  order.order_number,
        trackingCode: (trackingCode || order.tracking_code) ?? null,
        trackingUrl:  (trackingUrl  || order.tracking_url)  ?? null,
        carrier:      (carrier      || order.carrier)       ?? null,
      })
      emailSent = true
    } catch (err) {
      emailError = err instanceof Error ? err.message : String(err)
      console.error('[status] email send failed:', emailError)
      // DO NOT revert status — just log the error
    }
  }

  // Audit log
  await admin.from('audit_logs').insert({
    user_id:     user.id,
    user_email:  user.email,
    action:      'update_order_status',
    entity_type: 'order',
    entity_id:   params.id,
    old_data:    { status: order.status },
    new_data:    { status, trackingCode, carrier, emailSent, emailError },
  })

  return NextResponse.json({ success: true, emailSent, emailError })
}
