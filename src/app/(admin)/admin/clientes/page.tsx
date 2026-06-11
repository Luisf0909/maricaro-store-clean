import { createAdminClient } from '@/lib/supabase/admin'
import { formatCLP } from '@/lib/utils'
import Link from 'next/link'
import { Users, UserCheck, UserX, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin — Clientes' }

interface Props {
  searchParams: { q?: string; tipo?: string }
}

export default async function AdminClientesPage({ searchParams }: Props) {
  const admin = createAdminClient()

  // Registered customers (profiles with role=customer)
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, phone, role, created_at, accepts_marketing')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  // Auth users to get emails
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const emailMap = new Map(authData?.users?.map(u => [u.id, u.email]) ?? [])

  // Get addresses for registered customers
  const { data: addresses } = await admin
    .from('customer_addresses')
    .select('user_id, address, city, region, is_default')
    .eq('is_default', true)
  const addressMap = new Map(addresses?.map(a => [a.user_id, a]) ?? [])

  // Order stats per customer
  const { data: orderStats } = await admin
    .from('orders')
    .select('user_id, total, payment_status')
    .eq('payment_status', 'paid')
    .not('user_id', 'is', null)

  const customerStats = new Map<string, { count: number; total: number }>()
  for (const o of orderStats ?? []) {
    if (!o.user_id) continue
    const existing = customerStats.get(o.user_id) ?? { count: 0, total: 0 }
    customerStats.set(o.user_id, { count: existing.count + 1, total: existing.total + o.total })
  }

  // Guest orders
  const { data: guestOrders } = await admin
    .from('orders')
    .select('customer_email, customer_rut, shipping_full_name, shipping_phone, shipping_city, shipping_region, total, created_at, payment_status')
    .eq('is_guest', true)
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false })
    .limit(200)

  type GuestOrder = { customer_email: string | null; customer_rut?: string | null; shipping_full_name: string | null; shipping_phone: string | null; shipping_city: string | null; shipping_region: string | null; total: number; created_at: string; payment_status: string; orderCount: number; totalSpent: number }
  // Merge guests deduped by email
  const guestMap = new Map<string, GuestOrder>()
  for (const o of guestOrders ?? []) {
    const key = (o.customer_email ?? (o as { customer_rut?: string }).customer_rut ?? 'unknown') as string
    const existing = guestMap.get(key)
    if (existing) {
      existing.orderCount++
      existing.totalSpent += o.total
    } else {
      guestMap.set(key, {
        customer_email:   o.customer_email,
        customer_rut:     (o as { customer_rut?: string }).customer_rut,
        shipping_full_name: o.shipping_full_name,
        shipping_phone:   o.shipping_phone,
        shipping_city:    o.shipping_city,
        shipping_region:  o.shipping_region,
        total:            o.total,
        created_at:       o.created_at,
        payment_status:   o.payment_status,
        orderCount: 1,
        totalSpent: o.total,
      })
    }
  }
  const guests = Array.from(guestMap.values())

  const { q, tipo } = searchParams

  // Filter registered
  const filteredProfiles = (profiles ?? []).filter(p => {
    if (tipo === 'invitado') return false
    if (!q) return true
    const email = emailMap.get(p.id) ?? ''
    const term = q.toLowerCase()
    return (
      p.full_name?.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      p.phone?.includes(term)
    )
  })

  // Filter guests
  const filteredGuests = tipo === 'registrado' ? [] : guests.filter(g => {
    if (!q) return true
    const term = q.toLowerCase()
    return (
      g.shipping_full_name?.toLowerCase().includes(term) ||
      g.customer_email?.toLowerCase().includes(term) ||
      g.customer_rut?.includes(term) ||
      g.shipping_phone?.includes(term)
    )
  })

  const totalRegistered = (profiles ?? []).length
  const totalGuests = guests.length

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {totalRegistered} registrados · {totalGuests} invitados
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Registrados',  value: totalRegistered, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Invitados',    value: totalGuests,     icon: UserX,     color: 'text-sky-600',     bg: 'bg-sky-50 border-sky-100' },
          { label: 'Total',        value: totalRegistered + totalGuests, icon: Users, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Buscar por nombre, email, RUT o teléfono…"
            className="w-full text-sm border border-gray-200 rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-300 bg-white"
          />
        </form>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {[
            { val: '',           label: 'Todos' },
            { val: 'registrado', label: 'Registrados' },
            { val: 'invitado',   label: 'Invitados' },
          ].map(t => (
            <Link
              key={t.val}
              href={`/admin/clientes?${q ? `q=${q}&` : ''}tipo=${t.val}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                (tipo ?? '') === t.val ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Registered customers */}
      {tipo !== 'invitado' && filteredProfiles.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-500" />
            <h2 className="font-semibold text-sm text-gray-900">Clientes registrados</h2>
            <span className="text-xs text-gray-400">({filteredProfiles.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                <tr>
                  {['Nombre', 'Email', 'Teléfono', 'Ciudad', 'Pedidos', 'Total gastado', 'Marketing', 'Desde', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProfiles.map(p => {
                  const email   = emailMap.get(p.id) ?? '—'
                  const address = addressMap.get(p.id)
                  const stats   = customerStats.get(p.id) ?? { count: 0, total: 0 }
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {p.full_name || <span className="text-gray-400 italic">Sin nombre</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{email}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.phone || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {address ? `${address.city}, ${address.region}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-gray-700">{stats.count}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-700">
                        {stats.total > 0 ? formatCLP(stats.total) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.accepts_marketing
                          ? <span className="text-emerald-500 text-xs font-semibold">✓ Sí</span>
                          : <span className="text-gray-300 text-xs">No</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(p.created_at).toLocaleDateString('es-CL')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/clientes/${p.id}`} className="text-xs text-warm-700 hover:underline font-medium">
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guest customers */}
      {tipo !== 'registrado' && filteredGuests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
            <UserX className="h-4 w-4 text-sky-500" />
            <h2 className="font-semibold text-sm text-gray-900">Clientes invitados</h2>
            <span className="text-xs text-gray-400">({filteredGuests.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                <tr>
                  {['Nombre', 'Email', 'RUT', 'Teléfono', 'Ciudad', 'Pedidos', 'Total'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredGuests.map((g, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-medium text-gray-900">{g.shipping_full_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{g.customer_email || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{(g as { customer_rut?: string }).customer_rut || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{g.shipping_phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{g.shipping_city ? `${g.shipping_city}, ${g.shipping_region}` : '—'}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">{g.orderCount}</td>
                    <td className="px-4 py-3 font-semibold text-gray-700">{formatCLP(g.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredProfiles.length === 0 && filteredGuests.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No se encontraron clientes</p>
        </div>
      )}
    </div>
  )
}
