'use client'

import { useState } from 'react'
import { Gift, X, CheckCircle2, Loader2 } from 'lucide-react'
import { formatCLP } from '@/lib/utils'
import { toast } from 'sonner'
import type { GiftCard } from '@/types'

interface Props {
  orderTotal: number
  onApply:   (code: string, discount: number, giftCard: GiftCard) => void
  onRemove:  () => void
  applied?:  { code: string; discount: number }
}

export function GiftCardInput({ orderTotal, onApply, onRemove, applied }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function validate() {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return

    setLoading(true)
    try {
      const res = await fetch('/api/giftcards/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed, orderTotal }),
      })
      const data = await res.json()
      if (data.valid) {
        onApply(trimmed, data.applicableAmount, data.giftCard)
        setCode('')
        setOpen(false)
        toast.success(`Giftcard aplicada: -${formatCLP(data.applicableAmount)}`)
      } else {
        toast.error(data.error ?? 'Código inválido')
      }
    } catch {
      toast.error('Error al validar la giftcard')
    } finally {
      setLoading(false)
    }
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 font-mono">{applied.code}</p>
            <p className="text-xs text-emerald-600">-{formatCLP(applied.discount)} aplicado</p>
          </div>
        </div>
        <button onClick={onRemove} className="text-emerald-400 hover:text-emerald-600 transition-colors">
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
          className="flex items-center gap-2 text-sm text-warm-600 hover:text-warm-800 underline underline-offset-2 transition-colors"
        >
          <Gift className="h-4 w-4" />
          ¿Tienes una giftcard?
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), validate())}
              placeholder="CÓDIGO GIFTCARD"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-warm-400 bg-white"
              maxLength={50}
            />
            <button
              type="button"
              onClick={validate}
              disabled={loading || !code.trim()}
              className="px-4 py-2 bg-warm-700 text-white text-sm font-medium rounded-lg hover:bg-warm-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Aplicar
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setCode('') }}
              className="px-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
