'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import type { LoyaltyConfig } from '@/types'

interface Props {
  initialConfig: LoyaltyConfig | null
}

export function LoyaltyConfigEditor({ initialConfig }: Props) {
  const [config, setConfig] = useState({
    points_per_clp:     initialConfig?.points_per_clp     ?? 0.001,
    clp_per_point:      initialConfig?.clp_per_point      ?? 1,
    min_points_redeem:  initialConfig?.min_points_redeem  ?? 100,
    points_expiry_days: initialConfig?.points_expiry_days ?? null as number | null,
    is_active:          initialConfig?.is_active          ?? true,
  })
  const [isPending, startTransition] = useTransition()

  const pointsPer1000 = Math.round(config.points_per_clp * 1000)
  const valueOf100pts = 100 * config.clp_per_point

  function save(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await fetch('/api/admin/loyalty/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (res.ok) toast.success('Configuración guardada')
      else toast.error('Error al guardar')
    })
  }

  return (
    <form onSubmit={save} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
      {/* Active toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm text-gray-800">Programa activo</p>
          <p className="text-xs text-gray-400">Los clientes pueden acumular y canjear puntos</p>
        </div>
        <button
          type="button"
          onClick={() => setConfig(c => ({ ...c, is_active: !c.is_active }))}
          className={`relative w-11 h-6 rounded-full transition-colors ${config.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Puntos por $1.000 de compra
          </label>
          <input
            type="number"
            value={pointsPer1000}
            onChange={e => setConfig(c => ({ ...c, points_per_clp: parseInt(e.target.value) / 1000 }))}
            min={0}
            max={100}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400 bg-white"
          />
          <p className="text-xs text-gray-400 mt-1">Por cada $1.000 gastados, el cliente gana {pointsPer1000} punto{pointsPer1000 !== 1 ? 's' : ''}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Valor de cada punto (CLP)
          </label>
          <input
            type="number"
            value={config.clp_per_point}
            onChange={e => setConfig(c => ({ ...c, clp_per_point: parseInt(e.target.value) }))}
            min={1}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400 bg-white"
          />
          <p className="text-xs text-gray-400 mt-1">1 punto = ${config.clp_per_point} al canjear</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Mínimo para canjear (puntos)
          </label>
          <input
            type="number"
            value={config.min_points_redeem}
            onChange={e => setConfig(c => ({ ...c, min_points_redeem: parseInt(e.target.value) }))}
            min={1}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400 bg-white"
          />
          <p className="text-xs text-gray-400 mt-1">Equivale a ${config.min_points_redeem * config.clp_per_point} de descuento</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Vencimiento de puntos (días, vacío = no vencen)
          </label>
          <input
            type="number"
            value={config.points_expiry_days ?? ''}
            onChange={e => setConfig(c => ({
              ...c,
              points_expiry_days: e.target.value ? parseInt(e.target.value) : null,
            }))}
            min={1}
            placeholder="Sin vencimiento"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400 bg-white"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-amber-50 rounded-lg border border-amber-100 p-3">
        <p className="text-xs font-semibold text-amber-700 mb-1">Resumen de la configuración</p>
        <ul className="text-xs text-amber-600 space-y-0.5">
          <li>→ El cliente gana <strong>{pointsPer1000} pts</strong> por cada $1.000 comprados</li>
          <li>→ 100 puntos acumulados = <strong>${valueOf100pts}</strong> de descuento</li>
          <li>→ Mínimo para canjear: <strong>{config.min_points_redeem} pts</strong></li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 bg-warm-700 text-white text-sm font-medium rounded-lg hover:bg-warm-800 disabled:opacity-60 transition-colors"
      >
        {isPending ? 'Guardando…' : 'Guardar configuración'}
      </button>
    </form>
  )
}
