import { createAdminClient } from '@/lib/supabase/admin'
import { LoyaltyConfigEditor } from '@/components/admin/LoyaltyConfigEditor'
import { formatCLP } from '@/lib/utils'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Puntos de fidelización | Admin' }

export default async function AdminPuntosPage() {
  const admin = createAdminClient()

  const [{ data: config }, { data: accounts }, { data: transactions }] = await Promise.all([
    admin.from('loyalty_config').select('*').single(),
    admin.from('loyalty_accounts').select('*, profiles(full_name)').order('points_balance', { ascending: false }).limit(20),
    admin.from('loyalty_transactions').select('*').order('created_at', { ascending: false }).limit(30),
  ])

  const totalBalance  = (accounts ?? []).reduce((s, a) => s + (a.points_balance ?? 0), 0)
  const totalEarned   = (accounts ?? []).reduce((s, a) => s + (a.points_earned ?? 0), 0)
  const totalRedeemed = (accounts ?? []).reduce((s, a) => s + (a.points_redeemed ?? 0), 0)

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Programa de puntos</h1>
        <p className="text-sm text-gray-400 mt-0.5">Configura y administra el sistema de fidelización</p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Puntos activos',   value: totalBalance.toLocaleString('es-CL') + ' pts' },
          { label: 'Total ganados',    value: totalEarned.toLocaleString('es-CL') + ' pts' },
          { label: 'Total canjeados',  value: `${formatCLP(totalRedeemed * (config?.clp_per_point ?? 1))} (${totalRedeemed.toLocaleString('es-CL')} pts)` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-lg font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Config editor */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-4">Reglas del programa</h2>
        <LoyaltyConfigEditor initialConfig={config} />
      </section>

      {/* Top accounts */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-4">Clientes con más puntos</h2>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
              <tr>
                {['Cliente', 'Saldo', 'Ganados', 'Canjeados'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(accounts ?? []).map((acc) => (
                <tr key={acc.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3 text-gray-700">
                    {(acc.profiles as { full_name: string | null } | null)?.full_name ?? 'Usuario'}
                  </td>
                  <td className="px-5 py-3 font-semibold text-amber-600">
                    {acc.points_balance?.toLocaleString('es-CL')} pts
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {acc.points_earned?.toLocaleString('es-CL')} pts
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {acc.points_redeemed?.toLocaleString('es-CL')} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent transactions */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-4">Movimientos recientes</h2>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {(transactions ?? []).map((tx) => (
              <div key={tx.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-700">{tx.description}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(tx.created_at).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
                <span className={`font-bold text-sm ${tx.points > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString('es-CL')} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
