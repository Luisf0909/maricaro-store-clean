'use client'

import { useState } from 'react'
import { Tag, X, Loader2, CheckCircle } from 'lucide-react'
import { formatCLP } from '@/lib/utils'
import type { Coupon } from '@/types'

interface CouponInputProps {
  email: string
  rut: string
  subtotal: number
  onApply: (coupon: Coupon, discountAmount: number) => void
  onRemove: () => void
  appliedCoupon: { coupon: Coupon; discountAmount: number } | null
}

export function CouponInput({ email, rut, subtotal, onApply, onRemove, appliedCoupon }: CouponInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleApply() {
    if (!code.trim()) return
    if (!email) { setError('Ingresa tu correo primero'); return }
    if (!rut) { setError('Ingresa tu RUT primero'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/cupones/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), email, rut, subtotal }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Cupón inválido')
      } else {
        onApply(data.coupon, data.discountAmount)
        setCode('')
      }
    } catch {
      setError('Error al validar el cupón')
    } finally {
      setLoading(false)
    }
  }

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold font-mono">{appliedCoupon.coupon.code}</p>
            <p className="text-xs">Descuento aplicado: <strong>{formatCLP(appliedCoupon.discountAmount)}</strong></p>
          </div>
        </div>
        <button type="button" onClick={onRemove} className="text-green-600 hover:text-green-800">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <Tag className="h-4 w-4" />
        Cupón de descuento
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError('') }}
          placeholder="CÓDIGO"
          className="flex-1 px-4 py-2.5 rounded-lg border border-cream-300 bg-cream-50 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-warm-400"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApply())}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2.5 bg-warm-700 hover:bg-warm-800 disabled:opacity-50 text-cream-50 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
