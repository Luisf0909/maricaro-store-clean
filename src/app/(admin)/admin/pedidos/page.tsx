import { createAdminClient } from '@/lib/supabase/admin'
import { formatCLP } from '@/lib/utils'
import { PedidosTable } from '@/components/admin/PedidosTable'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin — Pedidos' }

interface Props {
  searchParams: { estado?: string; pago?: string; q?: string }
}

export default async function AdminPedidosPage({ searchParams }: Props) {
  const admin = createAdminClient()

  let query = admin
    .from('orders')
    .select('id, order_number, status, payment_status, total, created_at, shipping_full_name, payment_method, customer_email, is_guest')
    .order('created_at', { ascending: false })
    .limit(200)

  if (searchParams.estado) query = query.eq('status', searchParams.estado)
  if (searchParams.pago)   query = query.eq('payment_status', searchParams.pago)

  const { data: orders } = await query

  // Stats
  const { data: allOrders } = await admin
    .from('orders')
    .select('status, payment_status, total')

  const stats = {
    total:      allOrders?.length ?? 0,
    pendiente:  allOrders?.filter(o => o.status === 'pending').length ?? 0,
    confirmado: allOrders?.filter(o => o.status === 'confirmed').length ?? 0,
    proceso:    allOrders?.filter(o => o.status === 'processing').length ?? 0,
    enviado:    allOrders?.filter(o => o.status === 'shipped').length ?? 0,
    entregado:  allOrders?.filter(o => o.status === 'delivered').length ?? 0,
    cancelado:  allOrders?.filter(o => o.status === 'cancelled').length ?? 0,
    ingresos:   allOrders?.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0) ?? 0,
  }

  // Apply text search client-side (only feasible for small sets)
  const q = searchParams.q?.toLowerCase()
  const filtered = q
    ? (orders ?? []).filter(o =>
        o.order_number.toLowerCase().includes(q) ||
        o.shipping_full_name?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q)
      )
    : (orders ?? [])

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Pedidos</h1>
        <p className="text-sm text-gray-400 mt-0.5">{stats.total} pedidos totales</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total',      value: stats.total,      color: 'text-gray-700' },
          { label: 'Pendiente',  value: stats.pendiente,  color: 'text-yellow-600' },
          { label: 'Confirmado', value: stats.confirmado, color: 'text-blue-600' },
          { label: 'En proceso', value: stats.proceso,    color: 'text-indigo-600' },
          { label: 'Enviado',    value: stats.enviado,    color: 'text-purple-600' },
          { label: 'Entregado',  value: stats.entregado,  color: 'text-emerald-600' },
          { label: 'Cancelado',  value: stats.cancelado,  color: 'text-red-500' },
          { label: 'Ingresos',   value: formatCLP(stats.ingresos), color: 'text-warm-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Interactive table with bulk actions */}
      <PedidosTable orders={filtered} searchParams={searchParams} />
    </div>
  )
}
