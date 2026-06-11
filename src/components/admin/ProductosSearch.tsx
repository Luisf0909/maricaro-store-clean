'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search, X } from 'lucide-react'

interface Props {
  categories: { id: string; name: string; slug: string }[]
}

export function ProductosSearch({ categories }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()

  const update = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.push(`${pathname}?${next.toString()}`)
  }, [params, pathname, router])

  const clearAll = () => router.push(pathname)
  const hasFilters = params.size > 0

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[150px] sm:min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          defaultValue={params.get('q') ?? ''}
          onChange={e => {
            clearTimeout((window as Window & { _searchTimeout?: ReturnType<typeof setTimeout> })._searchTimeout)
            ;(window as Window & { _searchTimeout?: ReturnType<typeof setTimeout> })._searchTimeout = setTimeout(() => update('q', e.target.value), 300)
          }}
          placeholder="Nombre o SKU…"
          className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-warm-200 focus:border-warm-300 bg-white"
        />
      </div>

      {/* Tipo */}
      <select
        value={params.get('tipo') ?? ''}
        onChange={e => update('tipo', e.target.value)}
        className="text-xs sm:text-sm border border-gray-200 rounded-xl px-2 sm:px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-warm-300"
      >
        <option value="">Tipo</option>
        <option value="fisico">Físico</option>
        <option value="digital">Digital</option>
      </select>

      {/* Estado */}
      <select
        value={params.get('estado') ?? ''}
        onChange={e => update('estado', e.target.value)}
        className="text-xs sm:text-sm border border-gray-200 rounded-xl px-2 sm:px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-warm-300 hidden sm:block"
      >
        <option value="">Estado</option>
        <option value="activo">Activos</option>
        <option value="inactivo">Inactivos</option>
      </select>

      {/* Stock */}
      <select
        value={params.get('stock') ?? ''}
        onChange={e => update('stock', e.target.value)}
        className="text-xs sm:text-sm border border-gray-200 rounded-xl px-2 sm:px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-warm-300 hidden md:block"
      >
        <option value="">Stock</option>
        <option value="con">Con stock</option>
        <option value="sin">Sin stock</option>
      </select>

      {/* Categoría */}
      <select
        value={params.get('categoria') ?? ''}
        onChange={e => update('categoria', e.target.value)}
        className="text-xs sm:text-sm border border-gray-200 rounded-xl px-2 sm:px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-warm-300 hidden lg:block"
      >
        <option value="">Categoría</option>
        {categories.map(c => (
          <option key={c.id} value={c.slug}>{c.name}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-3.5 w-3.5" /> Limpiar
        </button>
      )}
    </div>
  )
}
