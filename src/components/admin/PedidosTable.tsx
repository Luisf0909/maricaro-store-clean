'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { formatCLP } from '@/lib/utils'
import { toast } from 'sonner'
import { CheckSquare, Square, ChevronDown, Loader2, Search, X, Filter } from 'lucide-react'

type Order = {
  id: string; order_number: string; status: string; payment_status: string
  total: number; created_at: string; shipping_full_name: string
  payment_method: string | null; customer_email: string | null; is_guest: boolean
}

interface Props {
  orders: Order[]
  searchParams: { estado?: string; pago?: string; q?: string }
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending:    { label: 'Pendiente de pago', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  confirmed:  { label: 'Confirmado',        className: 'bg-blue-100 text-blue-700 border-blue-200' },
  processing: { label: 'En preparación',    className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  shipped:    { label: 'Enviado',           className: 'bg-purple-100 text-purple-700 border-purple-200' },
  delivered:  { label: 'Entregado',         className: 'bg-green-100 text-green-700 border-green-200' },
  cancelled:  { label: 'Cancelado',         className: 'bg-red-100 text-red-700 border-red-200' },
  refunded:   { label: 'Reembolsado',       className: 'bg-orange-100 text-orange-700 border-orange-200' },
}

const ALL_STATUSES = [
  { value: 'pending',    label: 'Pendiente de pago' },
  { value: 'confirmed',  label: 'Pago confirmado' },
  { value: 'processing', label: 'En preparación' },
  { value: 'shipped',    label: 'Enviado' },
  { value: 'delivered',  label: 'Entregado' },
  { value: 'cancelled',  label: 'Cancelado' },
  { value: 'refunded',   label: 'Reembolsado' },
]

export function PedidosTable({ orders, searchParams }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()

  const [selected,     setSelected]     = useState<Set<string>>(new Set())
  const [bulkStatus,   setBulkStatus]   = useState('')
  const [bulkComment,  setBulkComment]  = useState('')
  const [showBulk,     setShowBulk]     = useState(false)
  const [isPending,    startTransition] = useTransition()

  const [result, setResult] = useState<{ updated: number; emails: number; emailsFailed: number } | null>(null)

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value); else next.delete(key)
    router.push(`${pathname}?${next.toString()}`)
  }

  function toggleAll() {
    if (selected.size === orders.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(orders.map(o => o.id)))
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  async function applyBulk() {
    if (!bulkStatus) { toast.error('Selecciona el nuevo estado'); return }
    if (!selected.size) { toast.error('Selecciona al menos un pedido'); return }

    const confirm = window.confirm(
      `¿Cambiar ${selected.size} pedido${selected.size > 1 ? 's' : ''} a "${STATUS_LABELS[bulkStatus]?.label}"?\n\n` +
      `${bulkStatus === 'shipped' ? 'Se enviarán emails de notificación a los clientes.' : ''}`
    )
    if (!confirm) return

    startTransition(async () => {
      const res = await fetch('/api/admin/pedidos/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: Array.from(selected),
          status: bulkStatus,
          comment: bulkComment || null,
          notifyOnShipped: true,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult(data)
        setSelected(new Set())
        setShowBulk(false)
        setBulkComment('')
        router.refresh()
        toast.success(`${data.updated} pedido${data.updated > 1 ? 's' : ''} actualizado${data.updated > 1 ? 's' : ''}`)
        if (data.emails > 0) toast.success(`📧 ${data.emails} email${data.emails > 1 ? 's' : ''} enviado${data.emails > 1 ? 's' : ''}`)
        if (data.emailsFailed > 0) toast.error(`⚠️ ${data.emailsFailed} email${data.emailsFailed > 1 ? 's fallaron' : ' falló'} (estado actualizado igual)`)
      } else {
        toast.error(data.error ?? 'Error al actualizar pedidos')
      }
    })
  }

  const allSelected = orders.length > 0 && selected.size === orders.length
  const someSelected = selected.size > 0 && selected.size < orders.length

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-[150px] sm:min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            defaultValue={searchParams.q ?? ''}
            placeholder="Nº pedido, cliente, email…"
            onChange={e => {
              clearTimeout((window as Window & { _t?: ReturnType<typeof setTimeout> })._t)
              ;(window as Window & { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(() => updateFilter('q', e.target.value), 300)
            }}
            className="w-full text-sm border border-gray-200 rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-300 bg-white"
          />
        </div>
        <select value={searchParams.estado ?? ''} onChange={e => updateFilter('estado', e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-warm-300">
          <option value="">Todos los estados</option>
          {ALL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={searchParams.pago ?? ''} onChange={e => updateFilter('pago', e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-warm-300">
          <option value="">Todos los pagos</option>
          <option value="paid">Pagado</option>
          <option value="pending">Pendiente</option>
          <option value="failed">Fallido</option>
        </select>
        {(searchParams.estado || searchParams.pago || searchParams.q) && (
          <button onClick={() => router.push(pathname)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <X className="h-3.5 w-3.5" /> Limpiar
          </button>
        )}
      </div>

      {/* Result summary */}
      {result && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700 flex items-center justify-between">
          <span>
            ✅ {result.updated} pedido{result.updated > 1 ? 's' : ''} actualizado{result.updated > 1 ? 's' : ''}
            {result.emails > 0 && ` · 📧 ${result.emails} email${result.emails > 1 ? 's' : ''} enviado${result.emails > 1 ? 's' : ''}`}
            {result.emailsFailed > 0 && ` · ⚠️ ${result.emailsFailed} email${result.emailsFailed > 1 ? 's' : ''} fallido${result.emailsFailed > 1 ? 's' : ''}`}
          </span>
          <button onClick={() => setResult(null)} className="text-emerald-400 hover:text-emerald-600"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-warm-50 border border-warm-100 rounded-xl flex-wrap">
          <span className="text-sm font-medium text-warm-700">
            {selected.size} pedido{selected.size > 1 ? 's' : ''} seleccionado{selected.size > 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setShowBulk(v => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-warm-700 bg-white border border-warm-200 px-3 py-1.5 rounded-lg hover:bg-warm-50 transition-colors"
          >
            <Filter className="h-3.5 w-3.5" /> Cambiar estado <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {showBulk && (
            <>
              <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
                className="text-sm border border-warm-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-warm-400">
                <option value="">— Nuevo estado —</option>
                {ALL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <input
                type="text"
                value={bulkComment}
                onChange={e => setBulkComment(e.target.value)}
                placeholder="Comentario opcional…"
                className="text-sm border border-warm-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-warm-400 w-48"
              />
              {bulkStatus === 'shipped' && (
                <span className="text-xs text-amber-600 font-medium">📧 Se enviarán emails</span>
              )}
              <button
                onClick={applyBulk}
                disabled={isPending || !bulkStatus}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-warm-700 hover:bg-warm-800 px-4 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Aplicar a {selected.size}
              </button>
            </>
          )}
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-gray-400 hover:text-gray-600">
            Deseleccionar
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="pl-3 sm:pl-4 py-2 sm:py-3">
                  <button onClick={toggleAll} className="flex items-center justify-center text-gray-400 hover:text-warm-600">
                    {allSelected
                      ? <CheckSquare className="h-4 w-4 text-warm-600" />
                      : someSelected
                        ? <CheckSquare className="h-4 w-4 text-warm-400" />
                        : <Square className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-xs">Nº Pedido</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium hidden sm:table-cell">Cliente</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium hidden md:table-cell">Tipo</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium hidden lg:table-cell">Fecha</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium hidden lg:table-cell">Método</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium">Estado</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium hidden sm:table-cell">Pago</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium">Total</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => {
                const s  = STATUS_LABELS[order.status] ?? { label: order.status, className: 'bg-gray-100 text-gray-600' }
                const isChecked = selected.has(order.id)

                return (
                  <tr key={order.id} className={`transition-colors text-xs sm:text-sm ${isChecked ? 'bg-warm-50/60' : 'hover:bg-gray-50/60'}`}>
                    <td className="pl-3 sm:pl-4 py-2 sm:py-3">
                      <button onClick={() => toggleOne(order.id)} className="flex items-center justify-center">
                        {isChecked
                          ? <CheckSquare className="h-4 w-4 text-warm-600" />
                          : <Square className="h-4 w-4 text-gray-300 hover:text-gray-500" />}
                      </button>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <Link href={`/admin/pedidos/${order.id}`} className="font-mono text-warm-700 hover:underline font-semibold text-xs">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                      <p className="font-medium text-gray-800 text-xs sm:text-sm">{order.shipping_full_name}</p>
                      {order.customer_email && <p className="text-[9px] sm:text-[10px] text-gray-400">{order.customer_email}</p>}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold border ${order.is_guest ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-violet-50 text-violet-600 border-violet-100'}`}>
                        {order.is_guest ? 'Inv' : 'Reg'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 text-[9px] sm:text-xs hidden lg:table-cell">
                      {new Date(order.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500 text-[9px] sm:text-xs hidden lg:table-cell">
                      {order.payment_method === 'flow_webpay' ? 'WP' : order.payment_method === 'mercadopago' ? 'MP' : '—'}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold border ${s.className}`}>
                        {s.label.split(' ')[0]}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold ${
                        order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        order.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.payment_status === 'paid' ? 'Pago' : order.payment_status === 'failed' ? 'Fallo' : 'Pend'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-800 text-xs sm:text-sm">{formatCLP(order.total)}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                      <Link href={`/admin/pedidos/${order.id}`} className="text-xs text-warm-700 hover:underline font-medium">
                        →
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-400">
                    No hay pedidos con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
