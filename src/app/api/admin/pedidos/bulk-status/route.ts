export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  orderIds:       z.array(z.string().uuid()).min(1).max(100),
  status:         z.enum(['pending','confirmed','processing','shipped','delivered','cancelled','refunded']),
  comment:        z.string().nullable().optional(),
  notifyOnShipped: z.boolean().default(true),
})

export async function POST(req: Request) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'operator'].includes(profile.role)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { orderIds, status, comment, notifyOnShipped } = parsed.data

  // Fetch current orders to get previous status, emails, names, etc.
  const { data: orders, error: fetchErr } = await admin
    .from('orders')
    .select('id, order_number, status, payment_status, customer_email, shipping_full_name, is_guest, tracking_code, tracking_url, carrier, shipped_at, delivered_at')
    .in('id', orderIds)

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  if (!orders?.length) return NextResponse.json({ error: 'No se encontraron pedidos' }, { status: 404 })

  const now = new Date().toISOString()
  let updated     = 0
  let emails      = 0
  let emailsFailed = 0

  // Track already-shipped orders to avoid duplicates
  const alreadyShipped = new Set(
    orders.filter(o => o.status === 'shipped').map(o => o.id)
  )

  for (const order of orders) {
    // Skip if already at this status
    if (order.status === status) continue

    const updateData: Record<string, unknown> = {
      status,
      updated_at: now,
    }
    if (status === 'shipped' && !order.shipped_at)   updateData.shipped_at   = now
    if (status === 'delivered' && !order.delivered_at) updateData.delivered_at = now

    // Update order
    const { error: updateErr } = await admin
      .from('orders')
      .update(updateData)
      .eq('id', order.id)

    if (updateErr) {
      console.error(`[bulk-status] Error updating order ${order.id}:`, updateErr.message)
      continue
    }

    updated++

    // Insert status history entry
    await admin.from('order_status_history').insert({
      order_id:           order.id,
      previous_status:    order.status,
      new_status:         status,
      changed_by_user_id: user.id,
      changed_by_name:    user.email,
      comment:            comment ?? null,
      customer_notified:  status === 'shipped' && notifyOnShipped && !alreadyShipped.has(order.id),
    })

    // Send email if status = shipped, notifyOnShipped, not already sent, and there's an email
    if (
      status === 'shipped' &&
      notifyOnShipped &&
      !alreadyShipped.has(order.id) &&
      order.customer_email
    ) {
      try {
        const { sendOrderShippedEmail } = await import('@/lib/email')
        await sendOrderShippedEmail({
          to:          order.customer_email,
          customerName: order.shipping_full_name ?? 'Cliente',
          orderId:     order.id,
          orderNumber: order.order_number,
          trackingCode: order.tracking_code ?? null,
          trackingUrl:  order.tracking_url  ?? null,
          carrier:      order.carrier       ?? null,
        })
        emails++
      } catch (emailErr) {
        console.error(`[bulk-status] Email failed for order ${order.id}:`, emailErr)
        emailsFailed++
        // DO NOT revert the status change — log and continue
      }
    }
  }

  // Audit log
  await admin.from('audit_logs').insert({
    user_id:     user.id,
    user_email:  user.email,
    action:      'bulk_update_order_status',
    entity_type: 'order',
    entity_id:   orderIds.join(','),
    old_data:    { orderIds },
    new_data:    { status, updated, emails, emailsFailed },
  })

  return NextResponse.json({ success: true, updated, emails, emailsFailed })
}
