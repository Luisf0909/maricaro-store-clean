'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Truck, MessageSquare, Save } from 'lucide-react'

interface Props {
  orderId: string
  currentStatus: string
  currentTracking: { code?: string | null; url?: string | null; carrier?: string | null }
  adminUserId: string | null
  adminName: string | null
}

const STATUSES = [
  { value: 'pending',    label: 'Pendiente de pago' },
  { value: 'confirmed',  label: 'Pago confirmado' },
  { value: 'processing', label: 'En preparación' },
  { value: 'shipped',    label: 'Enviado' },
  { value: 'delivered',  label: 'Entregado' },
  { value: 'cancelled',  label: 'Cancelado' },
  { value: 'refunded',   label: 'Reembolsado' },
]

export function UpdateOrderStatusFull({ orderId, currentStatus, currentTracking, adminUserId, adminName }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [comment, setComment] = useState('')
  const [notifyCustomer, setNotifyCustomer] = useState(true)
  const [trackingCode, setTrackingCode] = useState(currentTracking.code ?? '')
  const [trackingUrl, setTrackingUrl] = useState(currentTracking.url ?? '')
  const [carrier, setCarrier] = useState(currentTracking.carrier ?? '')
  const [loading, setLoading] = useState(false)
  const [showTracking, setShowTracking] = useState(false)

  const changed = status !== currentStatus || trackingCode !== (currentTracking.code ?? '') ||
    carrier !== (currentTracking.carrier ?? '')

  async function save() {
    if (!changed && !comment) return
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/pedidos/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          comment:        comment || null,
          notifyCustomer,
          trackingCode:   trackingCode || null,
          trackingUrl:    trackingUrl  || null,
          carrier:        carrier      || null,
          adminUserId,
          adminName,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error')
      toast.success('Estado actualizado')
      router.refresh()
      setComment('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
      <h3 className="font-semibold text-sm text-gray-900">Actualizar estado del pedido</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Estado</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-warm-400"
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Comentario interno</label>
          <div className="relative">
            <MessageSquare className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-300" />
            <input
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Obs. interna (opcional)"
              className="w-full text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-warm-400"
            />
          </div>
        </div>
      </div>

      {/* Tracking toggle */}
      <button
        type="button"
        onClick={() => setShowTracking(v => !v)}
        className="flex items-center gap-2 text-xs text-warm-600 hover:text-warm-800 font-medium"
      >
        <Truck className="h-3.5 w-3.5" />
        {showTracking ? 'Ocultar tracking' : 'Agregar/editar tracking de envío'}
      </button>

      {showTracking && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Código de seguimiento</label>
            <input
              type="text"
              value={trackingCode}
              onChange={e => setTrackingCode(e.target.value)}
              placeholder="ABC123456"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-warm-400 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Transportista</label>
            <input
              type="text"
              value={carrier}
              onChange={e => setCarrier(e.target.value)}
              placeholder="Starken, Chilexpress..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-warm-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">URL de seguimiento</label>
            <input
              type="url"
              value={trackingUrl}
              onChange={e => setTrackingUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-warm-400"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={notifyCustomer}
            onChange={e => setNotifyCustomer(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-warm-600 focus:ring-warm-400"
          />
          <span className="text-xs text-gray-600">Notificar cliente por email</span>
        </label>

        <button
          onClick={save}
          disabled={loading || (!changed && !comment)}
          className="flex items-center gap-2 px-4 py-2 bg-warm-700 text-white text-sm font-medium rounded-lg hover:bg-warm-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="h-3.5 w-3.5" />
          {loading ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
