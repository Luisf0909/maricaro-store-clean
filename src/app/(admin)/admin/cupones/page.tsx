import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Plus, Pencil, CheckCircle, XCircle } from 'lucide-react'
import { formatCLP } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin — Cupones' }

export default async function AdminCuponesPage() {
  const admin = createAdminClient()
  const { data: coupons } = await admin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Cupones de descuento</h1>
        <Link
          href="/admin/cupones/nuevo"
          className="inline-flex items-center gap-2 bg-warm-700 hover:bg-warm-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo cupón
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              {['Código', 'Descuento', 'Usos', 'Límite', '1 por cliente', 'Vence', 'Estado', ''].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons?.map((c) => {
              const expired = c.expires_at && new Date(c.expires_at) < new Date()
              const maxed = c.max_uses !== null && c.uses_count >= c.max_uses
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono font-semibold text-warm-800">{c.code}</td>
                  <td className="px-5 py-3">
                    {c.discount_type === 'percentage'
                      ? `${c.discount_value}%`
                      : formatCLP(c.discount_value)}
                    {c.min_order_amount > 0 && (
                      <span className="ml-1 text-xs text-gray-400">(mín. {formatCLP(c.min_order_amount)})</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{c.uses_count}</td>
                  <td className="px-5 py-3 text-gray-600">{c.max_uses ?? '∞'}</td>
                  <td className="px-5 py-3">
                    {c.one_per_customer
                      ? <CheckCircle className="h-4 w-4 text-green-500" />
                      : <XCircle className="h-4 w-4 text-gray-300" />}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {c.expires_at
                      ? <span className={expired ? 'text-red-500' : ''}>{new Date(c.expires_at).toLocaleDateString('es-CL')}</span>
                      : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      !c.is_active || expired || maxed
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {!c.is_active ? 'Inactivo' : expired ? 'Vencido' : maxed ? 'Agotado' : 'Activo'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/cupones/${c.id}`} className="inline-flex items-center gap-1 text-warm-700 hover:underline text-xs">
                      <Pencil className="h-3 w-3" /> Editar
                    </Link>
                  </td>
                </tr>
              )
            })}
            {!coupons?.length && (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No hay cupones aún</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
