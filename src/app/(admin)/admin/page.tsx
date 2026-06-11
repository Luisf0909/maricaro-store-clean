import { createAdminClient } from '@/lib/supabase/admin'
import { formatCLP } from '@/lib/utils'
import { ShoppingBag, Users, Package, TrendingUp, ArrowRight, Pencil } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin — Dashboard' }

export default async function AdminDashboard() {
  const admin = createAdminClient()

  const [
    { count: totalOrders },
    { count: totalProducts },
    { count: totalCustomers },
    { data: recentOrders },
  ] = await Promise.all([
    admin.from('orders').select('*', { count: 'exact', head: true }),
    admin.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    admin
      .from('orders')
      .select('id, order_number, status, payment_status, total, created_at, shipping_full_name')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const { data: revenueData } = await admin
    .from('orders')
    .select('total')
    .eq('payment_status', 'paid')

  const totalRevenue = revenueData?.reduce((s, o) => s + o.total, 0) ?? 0

  const stats = [
    {
      label: 'Ingresos totales',
      value: formatCLP(totalRevenue),
      icon: TrendingUp,
      gradient: 'from-emerald-50 to-emerald-100/80',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    {
      label: 'Pedidos',
      value: String(totalOrders ?? 0),
      icon: ShoppingBag,
      gradient: 'from-blue-50 to-blue-100/80',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
      border: 'border-blue-100',
    },
    {
      label: 'Productos activos',
      value: String(totalProducts ?? 0),
      icon: Package,
      gradient: 'from-warm-50 to-warm-100/80',
      iconBg: 'bg-warm-500/10',
      iconColor: 'text-warm-600',
      border: 'border-warm-100',
    },
    {
      label: 'Clientes',
      value: String(totalCustomers ?? 0),
      icon: Users,
      gradient: 'from-violet-50 to-violet-100/80',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-600',
      border: 'border-violet-100',
    },
  ]

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending:    { label: 'Pendiente',   className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
    confirmed:  { label: 'Confirmado',  className: 'bg-blue-50 text-blue-700 border border-blue-200' },
    processing: { label: 'En proceso',  className: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
    shipped:    { label: 'Enviado',     className: 'bg-purple-50 text-purple-700 border border-purple-200' },
    delivered:  { label: 'Entregado',   className: 'bg-green-50 text-green-700 border border-green-200' },
    cancelled:  { label: 'Cancelado',   className: 'bg-red-50 text-red-700 border border-red-200' },
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Resumen de tu tienda</p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.gradient} rounded-xl border ${stat.border} p-5 transition-shadow hover:shadow-md`}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <div className={`${stat.iconBg} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Recent orders ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div>
            <h2 className="font-semibold text-gray-900">Pedidos recientes</h2>
            <p className="text-xs text-gray-400 mt-0.5">Últimos 5 pedidos</p>
          </div>
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-warm-700 hover:text-warm-900 transition-colors"
          >
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 text-gray-400 uppercase text-[10px] tracking-widest">
              <tr>
                {['Pedido', 'Cliente', 'Estado', 'Pago', 'Total', ''].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders?.length ? recentOrders.map((order) => {
                const sc = statusConfig[order.status] ?? { label: order.status, className: 'bg-gray-100 text-gray-600' }
                return (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <Link href={`/admin/pedidos/${order.id}`} className="font-mono text-xs text-warm-700 hover:underline font-medium">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 text-gray-600">{order.shipping_full_name}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.className}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        order.payment_status === 'paid'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : order.payment_status === 'failed'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {order.payment_status === 'paid' ? 'Pagado' : order.payment_status === 'failed' ? 'Fallido' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-gray-800">{formatCLP(order.total)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <Link href={`/admin/pedidos/${order.id}`} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-warm-700 transition-colors">
                        <Pencil className="h-3 w-3" /> Ver
                      </Link>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                    Aún no hay pedidos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/admin/productos/nuevo',   label: 'Agregar producto',  desc: 'Crea un nuevo producto en el catálogo' },
          { href: '/admin/productos/importar', label: 'Importar CSV/XLSX', desc: 'Carga masiva de productos con imágenes' },
          { href: '/admin/cupones/nuevo',      label: 'Crear cupón',       desc: 'Genera un código de descuento' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group p-5 bg-white rounded-xl border border-gray-100 hover:border-warm-200 hover:shadow-md transition-all duration-200"
          >
            <p className="font-medium text-gray-800 group-hover:text-warm-700 transition-colors text-sm mb-1">
              {action.label}
            </p>
            <p className="text-xs text-gray-400">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
