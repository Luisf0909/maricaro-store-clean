import { createAdminClient } from '@/lib/supabase/admin'
import { formatCLP } from '@/lib/utils'
import {
  TrendingUp, ShoppingBag, Users, Package,
  BarChart3, Star, Gift, Heart
} from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Analítica | Admin' }

export default async function AnaliticaPage() {
  const admin = createAdminClient()

  const now   = new Date()
  const day1  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const day7  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const day30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Parallel data fetching
  const [
    { data: allOrders },
    { data: monthOrders },
    { data: weekOrders },
    { data: products },
    { data: customers },
    { data: topProducts },
    { data: couponsUsed },
    { count: wishlistCount },
    { data: loyaltyStats },
  ] = await Promise.all([
    admin.from('orders').select('total, payment_status, status, created_at, is_guest').eq('payment_status', 'paid'),
    admin.from('orders').select('total, payment_status, status, created_at').eq('payment_status', 'paid').gte('created_at', day1),
    admin.from('orders').select('total, payment_status').eq('payment_status', 'paid').gte('created_at', day7),
    admin.from('products').select('id, name, stock, price, is_active, is_digital').eq('is_active', true),
    admin.from('profiles').select('id, created_at, accepts_marketing').eq('role', 'customer'),
    admin.from('order_items')
      .select('product_name, quantity, subtotal')
      .gte('created_at', day30),
    admin.from('coupon_uses').select('coupon_id').gte('used_at', day30),
    admin.from('wishlists').select('*', { count: 'exact', head: true }),
    admin.from('loyalty_accounts').select('points_balance, points_earned, points_redeemed'),
  ])

  // Compute stats
  const totalRevenue   = allOrders?.reduce((s, o) => s + o.total, 0) ?? 0
  const monthRevenue   = monthOrders?.reduce((s, o) => s + o.total, 0) ?? 0
  const weekRevenue    = weekOrders?.reduce((s, o) => s + o.total, 0) ?? 0
  const totalOrders    = allOrders?.length ?? 0
  const monthOrdersCount = monthOrders?.length ?? 0
  const avgTicket      = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
  const avgTicketMonth = monthOrdersCount > 0 ? Math.round(monthRevenue / monthOrdersCount) : 0

  const lowStockProducts  = (products ?? []).filter(p => !p.is_digital && p.stock > 0 && p.stock <= 5)
  const outOfStockProducts = (products ?? []).filter(p => !p.is_digital && p.stock === 0)
  const digitalProducts   = (products ?? []).filter(p => p.is_digital)

  const totalCustomers    = customers?.length ?? 0
  const marketingOptIn    = (customers ?? []).filter(c => c.accepts_marketing).length
  const newThisMonth      = (customers ?? []).filter(c => c.created_at >= day1).length

  // Top products by quantity sold (last 30 days)
  const productSales = new Map<string, { name: string; units: number; revenue: number }>()
  for (const item of (topProducts ?? [])) {
    const existing = productSales.get(item.product_name) ?? { name: item.product_name, units: 0, revenue: 0 }
    productSales.set(item.product_name, {
      name:    item.product_name,
      units:   existing.units  + item.quantity,
      revenue: existing.revenue + item.subtotal,
    })
  }
  const topProductsList = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const totalPointsBalance  = (loyaltyStats ?? []).reduce((s, a) => s + (a.points_balance ?? 0), 0)
  const totalPointsRedeemed = (loyaltyStats ?? []).reduce((s, a) => s + (a.points_redeemed ?? 0), 0)

  const guestOrders     = (allOrders ?? []).filter(o => o.is_guest).length
  const pendingOrders   = (allOrders ?? []).filter(o => ['pending','confirmed','processing'].includes(o.status ?? '')).length

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analítica comercial</h1>
        <p className="text-sm text-gray-400 mt-0.5">Datos en tiempo real de tu tienda</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Ingresos totales', value: formatCLP(totalRevenue), sub: `Este mes: ${formatCLP(monthRevenue)}`, icon: TrendingUp, color: 'emerald' },
          { label: 'Esta semana',      value: formatCLP(weekRevenue),  sub: `${weekOrders?.length ?? 0} pedidos`, icon: BarChart3, color: 'blue' },
          { label: 'Ticket promedio',  value: formatCLP(avgTicket),    sub: `Este mes: ${formatCLP(avgTicketMonth)}`, icon: ShoppingBag, color: 'warm' },
          { label: 'Clientes',         value: String(totalCustomers),  sub: `+${newThisMonth} este mes`, icon: Users, color: 'violet' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <div className={`p-1.5 rounded-lg bg-${stat.color}-50`}>
                <stat.icon className={`h-3.5 w-3.5 text-${stat.color}-600`} />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pedidos pendientes', value: String(pendingOrders),      icon: Package, desc: 'Requieren atención' },
          { label: 'Cupones usados',     value: String(couponsUsed?.length ?? 0), icon: Gift, desc: 'Últimos 30 días' },
          { label: 'Favoritos',          value: String(wishlistCount ?? 0), icon: Heart, desc: 'Total wishlist' },
          { label: 'Opt-in marketing',   value: `${totalCustomers > 0 ? Math.round(marketingOptIn / totalCustomers * 100) : 0}%`, icon: Star, desc: `${marketingOptIn} clientes` },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="h-4 w-4 text-gray-400" />
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-900">Productos más vendidos</h2>
            <span className="text-xs text-gray-400">Últimos 30 días</span>
          </div>
          {topProductsList.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">Sin datos aún</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {topProductsList.map((p, idx) => (
                <div key={p.name} className="px-5 py-3 flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-5">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.units} unidades</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 flex-shrink-0">{formatCLP(p.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory alerts */}
        <div className="space-y-4">
          {/* Low stock */}
          <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-amber-50 bg-amber-50/50 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-amber-700">Stock crítico (≤5 unidades)</h2>
              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                {lowStockProducts.length}
              </span>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="px-5 py-4 text-xs text-gray-400">Todos los productos tienen stock suficiente ✓</p>
            ) : (
              <div className="divide-y divide-amber-50/50">
                {lowStockProducts.slice(0, 5).map(p => (
                  <div key={p.id} className="px-5 py-2.5 flex justify-between">
                    <p className="text-sm text-gray-700 truncate">{p.name}</p>
                    <span className="text-xs font-bold text-amber-600">{p.stock} uds.</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Out of stock */}
          <div className="bg-white rounded-xl border border-red-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-red-50 bg-red-50/50 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-red-600">Sin stock</h2>
              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                {outOfStockProducts.length}
              </span>
            </div>
            {outOfStockProducts.length === 0 ? (
              <p className="px-5 py-4 text-xs text-gray-400">No hay productos sin stock ✓</p>
            ) : (
              <div className="divide-y divide-red-50/50">
                {outOfStockProducts.slice(0, 5).map(p => (
                  <div key={p.id} className="px-5 py-2.5 flex justify-between">
                    <p className="text-sm text-gray-700 truncate">{p.name}</p>
                    <span className="text-xs font-bold text-red-500">Agotado</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loyalty + Marketing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-amber-500 fill-current" />
            <h3 className="font-semibold text-sm text-gray-900">Puntos de fidelización</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Saldo activo total</span>
              <span className="font-bold text-gray-900">{totalPointsBalance.toLocaleString('es-CL')} pts</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Puntos canjeados</span>
              <span className="font-semibold text-gray-700">{totalPointsRedeemed.toLocaleString('es-CL')} pts</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Cuentas activas</span>
              <span className="font-semibold text-gray-700">{loyaltyStats?.length ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-violet-500" />
            <h3 className="font-semibold text-sm text-gray-900">Clientes</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total registrados</span>
              <span className="font-bold text-gray-900">{totalCustomers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Invitados</span>
              <span className="font-semibold text-gray-700">{guestOrders}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Con opt-in marketing</span>
              <span className="font-semibold text-gray-700">{marketingOptIn}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-blue-500" />
            <h3 className="font-semibold text-sm text-gray-900">Catálogo</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Productos activos</span>
              <span className="font-bold text-gray-900">{products?.length ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Digitales</span>
              <span className="font-semibold text-gray-700">{digitalProducts.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Stock crítico</span>
              <span className={`font-semibold ${lowStockProducts.length > 0 ? 'text-amber-600' : 'text-gray-700'}`}>
                {lowStockProducts.length + outOfStockProducts.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
