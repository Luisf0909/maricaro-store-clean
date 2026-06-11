import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Star, TrendingUp, Gift, Clock } from 'lucide-react'
import { formatCLP } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mis puntos | Maria Caro Store' }

export default async function PuntosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cuenta/login?redirect=/cuenta/puntos')

  const admin = createAdminClient()

  const [{ data: account }, { data: transactions }, { data: config }] = await Promise.all([
    admin.from('loyalty_accounts').select('*').eq('user_id', user.id).maybeSingle(),
    admin
      .from('loyalty_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
    admin.from('loyalty_config').select('*').single(),
  ])

  const balance       = account?.points_balance ?? 0
  const earned        = account?.points_earned  ?? 0
  const redeemed      = account?.points_redeemed ?? 0
  const clpPerPoint   = config?.clp_per_point    ?? 1
  const pointsPerClp  = config?.points_per_clp   ?? 0.001
  const minRedeem     = config?.min_points_redeem ?? 100

  const balanceValue  = balance * clpPerPoint

  const txTypeConfig: Record<string, { label: string; color: string; sign: string }> = {
    earn:    { label: 'Puntos ganados',  color: 'text-emerald-600', sign: '+' },
    redeem:  { label: 'Canje',           color: 'text-red-500',     sign: '-' },
    expire:  { label: 'Vencidos',        color: 'text-gray-400',    sign: '-' },
    adjust:  { label: 'Ajuste',          color: 'text-blue-500',    sign: '' },
    refund:  { label: 'Reembolso',       color: 'text-amber-600',   sign: '+' },
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Star className="h-5 w-5 text-amber-500" />
        <div>
          <h1 className="font-cormorant font-light text-3xl text-gray-900">Mis puntos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Programa de fidelización Maria Caro Store</p>
        </div>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-warm-700 to-warm-900 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <p className="text-white/70 text-sm mb-1">Saldo disponible</p>
          <p className="text-4xl font-bold mb-1">{balance.toLocaleString('es-CL')} pts</p>
          <p className="text-white/80 text-sm">≈ {formatCLP(balanceValue)} de descuento</p>

          {balance >= minRedeem && (
            <div className="mt-4 inline-block bg-white/20 border border-white/30 rounded-lg px-3 py-1.5">
              <p className="text-xs text-white font-medium">
                ✓ Puedes canjear en tu próxima compra
              </p>
            </div>
          )}
          {balance < minRedeem && balance > 0 && (
            <p className="text-xs text-white/60 mt-3">
              Necesitas {minRedeem - balance} puntos más para poder canjear
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <TrendingUp className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{earned.toLocaleString('es-CL')}</p>
          <p className="text-xs text-gray-400">Ganados</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <Gift className="h-4 w-4 text-warm-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{redeemed.toLocaleString('es-CL')}</p>
          <p className="text-xs text-gray-400">Canjeados</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <Star className="h-4 w-4 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{balance.toLocaleString('es-CL')}</p>
          <p className="text-xs text-gray-400">Disponibles</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-warm-50 rounded-xl border border-warm-100 p-5 mb-8">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">¿Cómo funciona?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-warm-600 font-bold mt-0.5">→</span>
            Ganas <strong>{(pointsPerClp * 1000).toFixed(0)} punto{(pointsPerClp * 1000) !== 1 ? 's' : ''}</strong> por cada $1.000 de compra
          </li>
          <li className="flex items-start gap-2">
            <span className="text-warm-600 font-bold mt-0.5">→</span>
            1 punto = <strong>{formatCLP(clpPerPoint)}</strong> de descuento al canjear
          </li>
          <li className="flex items-start gap-2">
            <span className="text-warm-600 font-bold mt-0.5">→</span>
            Mínimo para canjear: <strong>{minRedeem} puntos</strong>
          </li>
        </ul>
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-sm text-gray-900">Historial de movimientos</h3>
        </div>
        {!transactions?.length ? (
          <div className="py-12 text-center">
            <Clock className="h-8 w-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No hay movimientos aún</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map(tx => {
              const cfg = txTypeConfig[tx.type] ?? { label: tx.type, color: 'text-gray-600', sign: '' }
              return (
                <div key={tx.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{cfg.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{tx.description}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${cfg.color}`}>
                      {cfg.sign}{Math.abs(tx.points).toLocaleString('es-CL')} pts
                    </p>
                    <p className="text-[10px] text-gray-400">{tx.balance_after.toLocaleString('es-CL')} pts saldo</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
