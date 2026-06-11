'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { X, ChevronDown, ChevronUp, SlidersHorizontal, Download, Package, Zap, Clock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

interface Props { categories: Category[]; totalCount: number }

const SORT_OPTIONS = [
  { value: 'newest',     label: '✨ Más recientes' },
  { value: 'featured',   label: '⭐ Destacados' },
  { value: 'price_asc',  label: '↑ Precio: menor a mayor' },
  { value: 'price_desc', label: '↓ Precio: mayor a menor' },
  { value: 'name',       label: 'A-Z Nombre' },
] as const

const PRICE_RANGES = [
  { label: 'Todos los precios', min: undefined, max: undefined },
  { label: 'Hasta $5.000',      min: 0,         max: 5000 },
  { label: '$5.000–$15.000',    min: 5000,       max: 15000 },
  { label: '$15.000–$30.000',   min: 15000,      max: 30000 },
  { label: 'Más de $30.000',    min: 30000,      max: undefined },
]

// Quick filters con iconos
const QUICK_FILTERS = [
  { key: 'digital',    val: 'true',   label: 'Digital',       icon: Download,  color: 'hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700',    activeColor: 'bg-teal-100 border-teal-200 text-teal-700' },
  { key: 'digital',    val: 'false',  label: 'Físico',        icon: Package,   color: 'hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700',        activeColor: 'bg-sky-100 border-sky-200 text-sky-700' },
  { key: 'disponible', val: 'stock',  label: '24h',           icon: Zap,       color: 'hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700', activeColor: 'bg-emerald-100 border-emerald-200 text-emerald-700' },
  { key: 'disponible', val: 'pedido', label: '48-72h',        icon: Clock,     color: 'hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700',   activeColor: 'bg-amber-100 border-amber-200 text-amber-700' },
  { key: 'sort',       val: 'featured', label: 'Destacados',  icon: Star,      color: 'hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700',      activeColor: 'bg-rose-100 border-rose-200 text-rose-700' },
]

export function ProductFilters({ categories, totalCount }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [priceOpen,  setPriceOpen]  = useState(true)
  const [availOpen,  setAvailOpen]  = useState(true)

  const get = (key: string) => params.get(key) ?? ''

  const update = useCallback((updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '') next.delete(k)
      else next.set(k, v)
    })
    router.push(`${pathname}?${next.toString()}`)
  }, [params, pathname, router])

  const clearAll = () => router.push(pathname)

  const activeCount = [get('categoria'), get('q'), get('sort'), get('digital'), get('min_price'), get('max_price'), get('disponible')]
    .filter(Boolean).length

  const currentPriceRange = PRICE_RANGES.find(
    r => String(r.min ?? '') === get('min_price') && String(r.max ?? '') === get('max_price')
  )

  function FilterContent() {
    return (
      <div className="space-y-6">

        {/* Quick filter chips */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Filtro rápido</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_FILTERS.map(f => {
              const isActive = get(f.key) === f.val
              return (
                <button
                  key={`${f.key}-${f.val}`}
                  onClick={() => update({ [f.key]: isActive ? undefined : f.val })}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all',
                    isActive ? f.activeColor : `border-gray-200 text-gray-500 ${f.color}`
                  )}
                >
                  <f.icon className="h-3 w-3" />
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Ordenar por
          </label>
          <select
            value={get('sort') || 'newest'}
            onChange={e => update({ sort: e.target.value === 'newest' ? undefined : e.target.value })}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Categories */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Categoría</p>
          <div className="space-y-1">
            {[{ slug: '', name: 'Todas las categorías' }, ...categories].map(cat => (
              <button
                key={cat.slug}
                onClick={() => update({ categoria: cat.slug || undefined })}
                className={cn(
                  'w-full text-left text-sm px-3 py-2 rounded-xl transition-all',
                  get('categoria') === cat.slug || (!get('categoria') && !cat.slug)
                    ? 'bg-rose-500 text-white font-semibold shadow-sm shadow-rose-200'
                    : 'text-gray-600 hover:bg-rose-50 hover:text-rose-700'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div>
          <button
            className="flex items-center justify-between w-full text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
            onClick={() => setPriceOpen(v => !v)}
          >
            Precio {priceOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {priceOpen && (
            <div className="space-y-1">
              {PRICE_RANGES.map(range => (
                <button
                  key={range.label}
                  onClick={() => update({
                    min_price: range.min !== undefined ? String(range.min) : undefined,
                    max_price: range.max !== undefined ? String(range.max) : undefined,
                  })}
                  className={cn(
                    'w-full text-left text-sm px-3 py-2 rounded-xl transition-all',
                    currentPriceRange?.label === range.label
                      ? 'bg-amber-400 text-amber-900 font-semibold'
                      : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Availability */}
        <div>
          <button
            className="flex items-center justify-between w-full text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
            onClick={() => setAvailOpen(v => !v)}
          >
            Disponibilidad {availOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {availOpen && (
            <div className="space-y-1">
              {[
                { label: 'Todos',                    val: undefined },
                { label: '⚡ En stock (entrega 24h)', val: 'stock' },
                { label: '🕐 A pedido (48-72h)',       val: 'pedido' },
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => update({ disponible: opt.val })}
                  className={cn(
                    'w-full text-left text-sm px-3 py-2 rounded-xl transition-all',
                    get('disponible') === (opt.val ?? '')
                      ? 'bg-sky-500 text-white font-semibold'
                      : 'text-gray-600 hover:bg-sky-50 hover:text-sky-700'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    )
  }

  return (
    <>
      {/* Mobile toggle */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-full bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all shadow-sm"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">{activeCount}</span>
          )}
        </button>
        <p className="text-sm text-gray-400">{totalCount} productos</p>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="md:hidden mb-6 p-5 bg-white border border-gray-100 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-sm text-gray-800">Filtros</h3>
            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <button onClick={clearAll} className="text-xs text-rose-500 underline underline-offset-2">Limpiar</button>
              )}
              <button onClick={() => setMobileOpen(false)}><X className="h-4 w-4 text-gray-300" /></button>
            </div>
          </div>
          <FilterContent />
        </div>
      )}

      {/* Tablet & Desktop sidebar */}
      <aside className="hidden md:block w-full md:w-48 lg:w-60 flex-shrink-0">
        <div className="sticky top-24 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-rose-400" />
              <span className="font-semibold text-sm text-gray-800">Filtros</span>
              {activeCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] rounded-full px-1.5 font-bold">{activeCount}</span>
              )}
            </div>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors">
                <X className="h-3 w-3" /> Limpiar
              </button>
            )}
          </div>
          <FilterContent />
        </div>
      </aside>
    </>
  )
}
