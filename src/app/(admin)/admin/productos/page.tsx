import { createAdminClient } from '@/lib/supabase/admin'
import { formatCLP } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Upload, Package, TrendingUp, AlertTriangle, Download } from 'lucide-react'
import { ProductosSearch } from '@/components/admin/ProductosSearch'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin — Productos' }

interface SearchProps {
  searchParams: { q?: string; tipo?: string; estado?: string; stock?: string; categoria?: string }
}

export default async function AdminProductosPage({ searchParams }: SearchProps) {
  const admin = createAdminClient()

  // Fetch all with joins
  const { data: allProducts } = await admin
    .from('products')
    .select('*, categories(name, slug), product_images(url, is_primary, sort_order)')
    .order('created_at', { ascending: false })

  const products = allProducts ?? []

  // Stats
  const total     = products.length
  const activos   = products.filter(p => p.is_active).length
  const inactivos = products.filter(p => !p.is_active).length
  const fisicos   = products.filter(p => !p.is_digital).length
  const digitales = products.filter(p => p.is_digital).length
  const sinStock  = products.filter(p => !p.is_digital && p.stock === 0).length

  // Fetch categories for filter
  const { data: categories } = await admin.from('categories').select('id, name, slug').order('sort_order')

  // Apply filters
  const { q, tipo, estado, stock: stockFilter, categoria } = searchParams
  const filtered = products.filter(p => {
    if (q) {
      const term = q.toLowerCase()
      if (!p.name.toLowerCase().includes(term) && !(p.sku?.toLowerCase().includes(term))) return false
    }
    if (tipo === 'digital' && !p.is_digital) return false
    if (tipo === 'fisico' && p.is_digital) return false
    if (estado === 'activo' && !p.is_active) return false
    if (estado === 'inactivo' && p.is_active) return false
    if (stockFilter === 'con' && !p.is_digital && p.stock === 0) return false
    if (stockFilter === 'sin' && (p.is_digital || p.stock > 0)) return false
    if (categoria) {
      const cat = p.categories as { slug: string } | null
      if (!cat || cat.slug !== categoria) return false
    }
    return true
  })

  const statusConfig: Record<string, { label: string; className: string }> = {
    activo:   { label: 'Activo',   className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    inactivo: { label: 'Inactivo', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-400 mt-0.5">{filtered.length} de {total} productos</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/productos/importar"
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4" /> Importar
          </Link>
          <Link href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 bg-warm-700 hover:bg-warm-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" /> Nuevo producto
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total',     value: total,     icon: Package,       color: 'text-gray-600',    bg: 'bg-gray-50 border-gray-100' },
          { label: 'Activos',   value: activos,   icon: TrendingUp,    color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Inactivos', value: inactivos, icon: Package,       color: 'text-gray-400',    bg: 'bg-gray-50 border-gray-100' },
          { label: 'Físicos',   value: fisicos,   icon: Package,       color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-100' },
          { label: 'Digitales', value: digitales, icon: Download,      color: 'text-teal-600',    bg: 'bg-teal-50 border-teal-100' },
          { label: 'Sin stock', value: sinStock,  icon: AlertTriangle, color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-3 ${s.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters (client-side search) */}
      <ProductosSearch categories={categories ?? []} />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
              <tr>
                {['', 'Producto', 'Categoría', 'Tipo', 'Precio', 'Stock', 'Disponibilidad', 'Estado', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => {
                const images = (p.product_images as Array<{ url: string; is_primary: boolean; sort_order: number }> | null) ?? []
                const primaryImg = images.find(i => i.is_primary) ?? images.sort((a, b) => a.sort_order - b.sort_order)[0]
                const cat = p.categories as { name: string; slug: string } | null
                const hasDiscount = p.compare_price && p.compare_price > p.price

                let dispLabel = ''
                let dispClass = ''
                if (p.is_digital) {
                  dispLabel = 'Descarga inmediata'; dispClass = 'bg-teal-50 text-teal-700 border-teal-100'
                } else if (p.stock > 0) {
                  dispLabel = 'En stock · 24h'; dispClass = 'bg-emerald-50 text-emerald-700 border-emerald-100'
                } else if (p.made_to_order) {
                  dispLabel = 'A pedido · 48-72h'; dispClass = 'bg-amber-50 text-amber-700 border-amber-100'
                } else {
                  dispLabel = 'Sin stock'; dispClass = 'bg-red-50 text-red-600 border-red-100'
                }

                return (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Miniatura */}
                    <td className="px-4 py-2.5">
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {primaryImg ? (
                          <Image
                            src={primaryImg.url}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Nombre + SKU */}
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-900 max-w-[200px] truncate">{p.name}</p>
                      {p.sku && <p className="text-[10px] text-gray-400 font-mono">{p.sku}</p>}
                    </td>
                    {/* Categoría */}
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{cat?.name ?? '—'}</td>
                    {/* Tipo */}
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        p.is_digital ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-sky-50 text-sky-700 border-sky-100'
                      }`}>
                        {p.is_digital ? <><Download className="h-2.5 w-2.5" /> Digital</> : <><Package className="h-2.5 w-2.5" /> Físico</>}
                      </span>
                    </td>
                    {/* Precio */}
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-gray-900">{formatCLP(p.price)}</p>
                      {hasDiscount && (
                        <p className="text-[10px] text-gray-400 line-through">{formatCLP(p.compare_price!)}</p>
                      )}
                    </td>
                    {/* Stock */}
                    <td className="px-4 py-2.5">
                      {p.is_digital ? (
                        <span className="text-xs text-gray-400">∞</span>
                      ) : (
                        <span className={`font-mono text-sm font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-600' : 'text-gray-700'}`}>
                          {p.stock}
                        </span>
                      )}
                    </td>
                    {/* Disponibilidad */}
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${dispClass}`}>
                        {dispLabel}
                      </span>
                    </td>
                    {/* Estado */}
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        p.is_active ? statusConfig.activo.className : statusConfig.inactivo.className
                      }`}>
                        {p.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {/* Acciones */}
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/producto/${p.slug}`} target="_blank"
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                          title="Ver en tienda"
                        >
                          Ver
                        </Link>
                        <Link href={`/admin/productos/${p.id}`}
                          className="inline-flex items-center gap-1 text-warm-700 hover:underline text-xs font-medium"
                        >
                          <Pencil className="h-3 w-3" /> Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-400">
                    No se encontraron productos con los filtros aplicados.
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
