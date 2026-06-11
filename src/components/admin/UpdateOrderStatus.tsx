'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  orderId: string
  currentStatus: string
}

const statuses = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'processing', label: 'En proceso' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export function UpdateOrderStatus({ orderId, currentStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleUpdate() {
    setLoading(true)
    const res = await fetch(`/api/pedidos/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success('Estado actualizado')
      router.refresh()
    } else {
      toast.error('Error al actualizar')
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <button
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
        className="bg-warm-700 hover:bg-warm-800 disabled:opacity-50 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
      >
        {loading ? '...' : 'Guardar'}
      </button>
    </div>
  )
}
