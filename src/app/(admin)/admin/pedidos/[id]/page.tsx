import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCLP } from '@/lib/utils'
import { UpdateOrderStatusFull } from '@/components/admin/UpdateOrderStatusFull'
import {
  User, MapPin, CreditCard, Package, Clock,
  ExternalLink, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Props { params: { id: string } }

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:    { label: 'Pendiente de pago', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  confirmed:  { label: 'Pago confirmado',   className: 'bg-blue-50 text-blue-700 border-blue-200' },
  processing: { label: 'En preparación',    className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  shipped:    { label: 'Enviado',           className: 'bg-purple-50 text-purple-700 border-purple-200' },
  delivered:  { label: 'Entregado',         className: 'bg-green-50 text-green-700 border-green-200' },
  cancelled:  { label: 'Cancelado',         className: 'bg-red-50 text-red-700 border-red-200' },
  refunded:   { label: 'Reembolsado',       className: 'bg-orange-50 text-orange-700 border-orange-200' },
}

export default async function AdminPedidoDetailPage({ params }: Props) {
  const admin = createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: order } = await admin
    .from('orders')
    .select(`
      *,
      order_items(*),
      order_status_history(*)
    `)
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  const history = (order.order_status_history ?? [])
    .sort((a: { created_at: string }, b: { created_at: string }) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  const sc = statusConfig[order.status] ?? { label: order.status, className: 'bg-gray-100 text-gray-600 border-gray-200' }

  const paymentLabel: Record<string, string> = {
    pending:  'Pendiente',
    paid:     'Pagado',
    failed:   'Fallido',
    refunded: 'Reembolsado',
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link href="/admin/pedidos" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-warm-700 mb-3 transition-colors">
          <ArrowLeft className="h-3 w-3" /> Volver a pedidos
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-mono">{order.order_number}</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {new Date(order.created_at).toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' })}
              {order.is_guest && <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Invitado</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${sc.className}`}>
              {sc.label}
            </span>
            <Link
              href={`/seguimiento/${order.order_number}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-warm-600 hover:text-warm-800"
            >
              <ExternalLink className="h-3 w-3" /> Ver tracking público
            </Link>
          </div>
        </div>
      </div>

      {/* Update status */}
      <UpdateOrderStatusFull
        orderId={order.id}
        currentStatus={order.status}
        currentTracking={{ code: order.tracking_code, url: order.tracking_url, carrier: order.carrier }}
        adminUserId={user?.id ?? null}
        adminName={user?.email ?? null}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-sm text-gray-900">Cliente</h2>
          </div>
          <p className="text-sm text-gray-700 font-medium">{order.shipping_full_name}</p>
          {order.customer_email && <p className="text-xs text-gray-500 mt-0.5">{order.customer_email}</p>}
          {order.shipping_phone && <p className="text-xs text-gray-500">{order.shipping_phone}</p>}
          {order.customer_rut && <p className="text-xs text-gray-400 font-mono">RUT: {order.customer_rut}</p>}
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-sm text-gray-900">Envío</h2>
          </div>
          <p className="text-xs text-gray-600">{order.shipping_address}{order.shipping_apartment ? `, ${order.shipping_apartment}` : ''}</p>
          <p className="text-xs text-gray-600">{order.shipping_city}</p>
          <p className="text-xs text-gray-600">{order.shipping_region}</p>
          {order.tracking_code && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Código seguimiento</p>
              <p className="font-mono text-xs text-blue-600 font-bold">{order.tracking_code}</p>
              {order.carrier && <p className="text-[10px] text-gray-400">{order.carrier}</p>}
            </div>
          )}
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-sm text-gray-900">Pago</h2>
          </div>
          <p className="text-xs text-gray-600">
            Método: <strong>{order.payment_method === 'flow_webpay' ? 'WebPay Plus' : order.payment_method === 'mercadopago' ? 'Mercado Pago' : '—'}</strong>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Estado:{' '}
            <strong className={order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
              {paymentLabel[order.payment_status] ?? order.payment_status}
            </strong>
          </p>
          {order.payment_id && (
            <p className="text-[10px] text-gray-400 font-mono mt-1 break-all">{order.payment_id}</p>
          )}
          {order.paid_at && (
            <p className="text-[10px] text-gray-400 mt-1">
              Pagado: {new Date(order.paid_at).toLocaleString('es-CL')}
            </p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
          <Package className="h-4 w-4 text-gray-400" />
          <h2 className="font-semibold text-sm text-gray-900">Productos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
              <tr>
                {['Producto', 'SKU', 'Cant.', 'P. unit.', 'Subtotal'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {order.order_items?.map((item: {
                id: string; product_name: string; variant_name?: string
                product_sku?: string; quantity: number; unit_price: number; subtotal: number
              }) => (
                <tr key={item.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{item.product_name}</p>
                    {item.variant_name && <p className="text-xs text-gray-400">{item.variant_name}</p>}
                  </td>
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs">{item.product_sku ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{item.quantity}</td>
                  <td className="px-5 py-3">{formatCLP(item.unit_price)}</td>
                  <td className="px-5 py-3 font-semibold">{formatCLP(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-50 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span>{formatCLP(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Envío</span>
            <span>{order.shipping_cost === 0 ? 'Gratis' : formatCLP(order.shipping_cost)}</span>
          </div>
          {order.coupon_discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Cupón {order.coupon_code}</span>
              <span>-{formatCLP(order.coupon_discount)}</span>
            </div>
          )}
          {(order.gift_card_discount ?? 0) > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>GiftCard {order.gift_card_code}</span>
              <span>-{formatCLP(order.gift_card_discount)}</span>
            </div>
          )}
          {(order.loyalty_discount ?? 0) > 0 && (
            <div className="flex justify-between text-amber-600">
              <span>Puntos canjeados</span>
              <span>-{formatCLP(order.loyalty_discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-50">
            <span>Total</span>
            <span className="text-warm-800">{formatCLP(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Admin notes */}
      {order.customer_notes && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 mb-1">Nota del cliente</p>
          <p className="text-sm text-amber-800">{order.customer_notes}</p>
        </div>
      )}

      {/* Status history */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
            <Clock className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-sm text-gray-900">Historial de estados</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {history.map((h: {
              id: string; new_status: string; previous_status?: string
              comment?: string; changed_by_name?: string
              customer_notified: boolean; tracking_code?: string; created_at: string
            }) => (
              <div key={h.id} className="px-5 py-3.5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig[h.new_status]?.className ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {statusConfig[h.new_status]?.label ?? h.new_status}
                    </span>
                    {h.previous_status && (
                      <span className="text-[10px] text-gray-400">
                        ← {statusConfig[h.previous_status]?.label ?? h.previous_status}
                      </span>
                    )}
                  </div>
                  {h.comment && <p className="text-xs text-gray-500 mt-1">{h.comment}</p>}
                  {h.tracking_code && (
                    <p className="text-xs text-blue-600 mt-0.5 font-mono">{h.tracking_code}</p>
                  )}
                  <p className="text-[10px] text-gray-300 mt-1">
                    {h.changed_by_name ?? 'Sistema'} · {h.customer_notified ? '📧 Cliente notificado' : 'Sin notificación'}
                  </p>
                </div>
                <time className="text-[10px] text-gray-400 flex-shrink-0">
                  {new Date(h.created_at).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}
                </time>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
