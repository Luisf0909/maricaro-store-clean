export const dynamic = 'force-dynamic'

import { getProducts, getCategories } from '@/lib/products'
import { ProductCard } from '@/components/store/ProductCard'
import { ProductFilters } from '@/components/store/ProductFilters'
import { Suspense } from 'react'
import { Download, PackageSearch, Sparkles } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  searchParams: {
    categoria?: string; q?: string; digital?: string; sort?: string
    min_price?: string; max_price?: string; disponible?: string
  }
}

export const metadata: Metadata = {
  title: 'Tienda | Maria Caro Store',
  description: 'Devocionales, planners y agendas diseñados con fe y propósito para acompañar tu caminar con Dios.',
}

export default async function ProductosPage({ searchParams }: Props) {
  const isDigital  = searchParams.digital === 'true'
  const isPhysical = searchParams.digital === 'false'
  const minPrice   = searchParams.min_price ? Number(searchParams.min_price) : undefined
  const maxPrice   = searchParams.max_price ? Number(searchParams.max_price) : undefined
  const disponible = searchParams.disponible

  const [allProducts, categories] = await Promise.all([
    getProducts({
      categorySlug: searchParams.categoria,
      search:       searchParams.q,
      digital:      isDigital ? true : isPhysical ? false : undefined,
      minPrice, maxPrice,
      sortBy: (searchParams.sort as 'newest' | 'price_asc' | 'price_desc' | 'featured' | 'name') ?? 'newest',
    }),
    getCategories(),
  ])

  const products = disponible === 'stock'
    ? allProducts.filter(p => p.is_digital || p.stock > 0)
    : disponible === 'pedido'
    ? allProducts.filter(p => !p.is_digital && p.stock === 0 && p.made_to_order)
    : allProducts

  const pageTitle = isDigital
    ? 'Recursos digitales'
    : searchParams.categoria
      ? categories.find(c => c.slug === searchParams.categoria)?.name ?? 'Colección'
      : 'Toda la colección'

  return (
    <div style={{ backgroundColor: '#FFFAF8', minHeight: '70vh' }}>

      {/* ── Header emocional ── */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-violet-50 border-b border-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-8 bg-rose-200" />
            <Sparkles className="h-3.5 w-3.5 text-rose-400" />
            <p className="text-xs text-rose-500 font-semibold uppercase tracking-[0.25em]">
              Papelería con fe y propósito
            </p>
          </div>
          <h1 className="font-cormorant font-light text-4xl md:text-5xl text-gray-800 mb-3">
            {pageTitle}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-400">
              <span className="font-semibold text-gray-700">{products.length}</span>{' '}
              {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
            </p>
            {searchParams.q && (
              <span className="text-sm text-gray-500">
                — búsqueda: <span className="font-medium text-gray-700">&ldquo;{searchParams.q}&rdquo;</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">

        {/* Digital info banner */}
        {isDigital && (
          <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-teal-50 border border-teal-100 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-100 flex-shrink-0">
              <Download className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-teal-800">Descarga instantánea</p>
              <p className="text-[10px] sm:text-xs text-teal-600 mt-0.5 font-light">
                Sin costo de envío. Recibes el archivo inmediatamente en tu correo tras el pago.
              </p>
            </div>
          </div>
        )}

        {/* Main layout */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-6">
          <Suspense fallback={null}>
            <ProductFilters categories={categories} totalCount={products.length} />
          </Suspense>

          <div className="flex-1 min-w-0">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                  <PackageSearch className="h-7 w-7 text-rose-300" />
                </div>
                <h3 className="font-semibold text-gray-700 mb-2">Sin resultados</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs">
                  No encontramos productos con los filtros seleccionados. Prueba con otra combinación.
                </p>
                <Link
                  href="/productos"
                  className="px-5 py-2.5 bg-rose-500 text-white text-sm font-semibold rounded-full hover:bg-rose-600 shadow-sm shadow-rose-200 transition-all hover:-translate-y-0.5"
                >
                  Ver todos los productos
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
