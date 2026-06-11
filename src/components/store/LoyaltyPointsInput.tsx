'use client'

import { useState, useEffect } from 'react'
import { Star, X, Loader2 } from 'lucide-react'
import { formatCLP } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  orderTotal:  number
  isLoggedIn:  boolean
  onApply:     (points: number, discount: number) => void
  onRemove:    () => void
  applied?:    { points: number; discount: number }
}

interface BalanceInfo {
  balance: number
  clpPerPoint: number
  minRedeem: number
}

export function LoyaltyPointsInput({ orderTotal, isLoggedIn, onApply, onRemove, applied }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null)
  const [pointsInput, setPointsInput] = useState('')

  useEffect(() => {
    if (open && isLoggedIn && !balanceInfo) {
      fetch('/api/loyalty/balance')
        .then(r => r.json())
        .then(data => {
          if (data.balance !== undefined) setBalanceInfo(data)
        })
        .catch(() => {})
    }
  }, [open, isLoggedIn, balanceInfo])

  async function apply() {
    const points = parseInt(pointsInput, 10)
    if (!points || points < 1) { toast.error('Ingresa la cantidad de puntos a canjear'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/loyalty/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsToRedeem: points, orderTotal }),
      })
      const data = await res.json()
      if (data.valid) {
        onApply(points, data.discountAmount)
        setOpen(false)
        setPointsInput('')
        toast.success(`${points} puntos canjeados: -${formatCLP(data.discountAmount)}`)
      } else {
        toast.error(data.error ?? 'No se pudo canjear los puntos')
      }
    } catch {
      toast.error('Error al canjear puntos')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) return null

  if (applied) {
    return (
      <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500 fill-current" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {applied.points.toLocaleString('es-CL')} puntos canjeados
            </p>
            <p className="text-xs text-amber-600">-{formatCLP(applied.discount)} de descuento</p>
          </div>
        </div>
        <button onClick={onRemove} className="text-amber-400 hover:text-amber-600 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-800 underline underline-offset-2 transition-colors"
        >
          <Star className="h-4 w-4 fill-current" />
          Canjear puntos de fidelización
        </button>
      ) : (
        <div className="space-y-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-amber-800 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-current" />
              Canjear puntos
            </p>
            <button onClick={() => { setOpen(false); setPointsInput('') }}>
              <X className="h-4 w-4 text-amber-400" />
            </button>
          </div>

          {balanceInfo && (
            <p className="text-xs text-amber-700">
              Tienes <strong>{balanceInfo.balance.toLocaleString('es-CL')} puntos</strong>{' '}
              (≈ {formatCLP(balanceInfo.balance * balanceInfo.clpPerPoint)})
            </p>
          )}

          <div className="flex gap-2">
            <input
              type="number"
              value={pointsInput}
              onChange={e => setPointsInput(e.target.value)}
              min={balanceInfo?.minRedeem ?? 100}
              max={balanceInfo?.balance ?? undefined}
              placeholder={`Mín. ${balanceInfo?.minRedeem ?? 100} pts`}
              className="flex-1 text-sm border border-amber-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <button
              type="button"
              onClick={apply}
              disabled={loading || !pointsInput}
              className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Canjear
            </button>
          </div>
          {balanceInfo && pointsInput && (
            <p className="text-xs text-amber-600">
              Descuento: {formatCLP(Math.min(parseInt(pointsInput) * balanceInfo.clpPerPoint, orderTotal))}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
