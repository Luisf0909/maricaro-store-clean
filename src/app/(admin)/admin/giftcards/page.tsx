import { createAdminClient } from '@/lib/supabase/admin'
import { formatCLP } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Gift } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'GiftCards | Admin' }

export default async function AdminGiftCardsPage() {
  const admin = createAdminClient()
  const { data: giftcards } = await admin
    .from('gift_cards')
    .select('*')
    .order('created_at', { ascending: false })

  const statusConfig: Record<string, { label: string; className: string }> = {
    active:    { label: 'Activa',    className: 'bg-green-50 text-green-700 border-green-200' },
    used:      { label: 'Usada',     className: 'bg-gray-50 text-gray-500 border-gray-200' },
    expired:   { label: 'Vencida',   className: 'bg-red-50 text-red-600 border-red-200' },
    cancelled: { label: 'Cancelada', className: 'bg-red-50 text-red-600 border-red-200' },
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">GiftCards</h1>
          <p className="text-sm text-gray-400 mt-0.5">{giftcards?.length ?? 0} tarjetas de regalo</p>
        </div>
        <Link
          href="/admin/giftcards/nueva"
          className="inline-flex items-center gap-2 px-4 py-2 bg-warm-700 text-white text-sm font-medium rounded-lg hover:bg-warm-800 transition-colors"
        >
          <Plus className="h-4 w-4" /> Nueva GiftCard
        </Link>
      </div>

      {!giftcards?.length ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
          <Gift className="h-10 w-10 text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm mb-4">No hay giftcards creadas</p>
          <Link href="/admin/giftcards/nueva" className="text-warm-600 underline text-sm">
            Crear primera giftcard
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                <tr>
                  {['Código', 'Monto inicial', 'Saldo', 'Email destinatario', 'Vence', 'Estado', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {giftcards.map(gc => {
                  const sc = statusConfig[gc.status] ?? { label: gc.status, className: 'bg-gray-100 text-gray-600 border-gray-200' }
                  return (
                    <tr key={gc.id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-warm-700 text-sm">{gc.code}</span>
                      </td>
                      <td className="px-5 py-3.5">{formatCLP(gc.initial_amount)}</td>
                      <td className="px-5 py-3.5">
                        <span className={gc.balance === 0 ? 'text-gray-400' : 'font-semibold text-gray-800'}>
                          {formatCLP(gc.balance)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{gc.issued_to_email ?? '—'}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {gc.expires_at ? new Date(gc.expires_at).toLocaleDateString('es-CL') : 'Sin vencimiento'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sc.className}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/admin/giftcards/${gc.id}`} className="text-xs text-warm-600 hover:underline">
                          Ver
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
    </div>
  )
}
