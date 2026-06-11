'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import type { Coupon } from '@/types'

interface CouponFormProps {
  coupon?: Coupon
}

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter()
  const isEdit = !!coupon

  const [form, setForm] = useState({
    code: coupon?.code ?? '',
    description: coupon?.description ?? '',
    discount_type: coupon?.discount_type ?? 'percentage' as 'percentage' | 'fixed',
    discount_value: coupon?.discount_value?.toString() ?? '',
    min_order_amount: coupon?.min_order_amount?.toString() ?? '0',
    max_uses: coupon?.max_uses?.toString() ?? '',
    unlimited: coupon?.max_uses == null,
    one_per_customer: coupon?.one_per_customer ?? true,
    expires_at: coupon?.expires_at ? coupon.expires_at.split('T')[0] : '',
    no_expiry: !coupon?.expires_at,
    is_active: coupon?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.code || !form.discount_value) { toast.error('Código y valor son requeridos'); return }

    setSaving(true)
    try {
      const url = isEdit ? `/api/admin/cupones/${coupon!.id}` : '/api/admin/cupones'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          description: form.description || null,
          discount_type: form.discount_type,
          discount_value: parseInt(form.discount_value),
          min_order_amount: parseInt(form.min_order_amount) || 0,
          max_uses: form.unlimited ? null : parseInt(form.max_uses) || null,
          one_per_customer: form.one_per_customer,
          expires_at: form.no_expiry ? null : form.expires_at ? new Date(form.expires_at + 'T23:59:59').toISOString() : null,
          is_active: form.is_active,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al guardar')
      }

      toast.success(isEdit ? 'Cupón actualizado' : 'Cupón creado')
      router.push('/admin/cupones')
      router.refresh()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este cupón?')) return
    const res = await fetch(`/api/admin/cupones/${coupon!.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Cupón eliminado')
      router.push('/admin/cupones')
      router.refresh()
    } else {
      toast.error('Error al eliminar')
    }
  }

  const field = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 bg-white'
  const label = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-medium text-gray-900 text-sm">Código del cupón</h2>
        <div className="flex gap-2">
          <input
            required
            value={form.code}
            onChange={(e) => update('code', e.target.value.toUpperCase())}
            className={`${field} uppercase font-mono tracking-wider`}
            placeholder="NAVIDAD20"
          />
          <button
            type="button"
            onClick={() => update('code', randomCode())}
            className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
            title="Generar código aleatorio"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div>
          <label className={label}>Descripción (interna, no visible para el cliente)</label>
          <input value={form.description} onChange={(e) => update('description', e.target.value)} className={field} placeholder="Campaña Navidad 2024" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-medium text-gray-900 text-sm">Descuento</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Tipo</label>
            <select value={form.discount_type} onChange={(e) => update('discount_type', e.target.value as 'percentage' | 'fixed')} className={field}>
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto fijo (CLP)</option>
            </select>
          </div>
          <div>
            <label className={label}>Valor {form.discount_type === 'percentage' ? '(ej: 20 = 20%)' : '(CLP, ej: 2000)'}</label>
            <input
              required
              type="number"
              min="1"
              max={form.discount_type === 'percentage' ? 100 : undefined}
              value={form.discount_value}
              onChange={(e) => update('discount_value', e.target.value)}
              className={field}
            />
          </div>
        </div>
        <div>
          <label className={label}>Pedido mínimo (CLP, 0 = sin mínimo)</label>
          <input type="number" min="0" step="1" value={form.min_order_amount} onChange={(e) => update('min_order_amount', e.target.value)} className={field} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-medium text-gray-900 text-sm">Límites de uso</h2>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.unlimited} onChange={(e) => update('unlimited', e.target.checked)} className="accent-warm-600" />
          <span className="text-sm text-gray-700">Usos ilimitados</span>
        </label>

        {!form.unlimited && (
          <div>
            <label className={label}>Máximo de usos totales</label>
            <input type="number" min="1" value={form.max_uses} onChange={(e) => update('max_uses', e.target.value)} className={field} placeholder="100" />
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.one_per_customer} onChange={(e) => update('one_per_customer', e.target.checked)} className="accent-warm-600" />
          <span className="text-sm text-gray-700">1 uso por cliente (validado por correo y RUT)</span>
        </label>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-medium text-gray-900 text-sm">Vigencia</h2>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.no_expiry} onChange={(e) => update('no_expiry', e.target.checked)} className="accent-warm-600" />
          <span className="text-sm text-gray-700">Sin fecha de vencimiento</span>
        </label>

        {!form.no_expiry && (
          <div>
            <label className={label}>Válido hasta (inclusive)</label>
            <input type="date" value={form.expires_at} onChange={(e) => update('expires_at', e.target.value)} className={field} />
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="accent-warm-600" />
          <span className="text-sm text-gray-700">Cupón activo</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-warm-700 hover:bg-warm-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear cupón'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 border border-red-300 text-red-600 hover:bg-red-50 font-medium rounded-lg text-sm transition-colors"
          >
            Eliminar
          </button>
        )}
      </div>
    </form>
  )
}
