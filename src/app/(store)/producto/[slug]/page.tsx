export const dynamic = 'force-dynamic'

import { getProductBySlug, getProducts } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { formatCLP, extractIVA } from '@/lib/utils'
import { AddToCartButton } from '@/components/store/AddToCartButton'
import { AvailabilityBadge } from '@/components/store/AvailabilityBadge'
import { ProductImageGallery } from '@/components/store/ProductImageGallery'
import { ProductReviews } from '@/components/store/ProductReviews'
import { WishlistButton } from '@/components/store/WishlistButton'
import { ProductCard } from '@/components/store/ProductCard'
import { ProductVideo } from '@/components/store/ProductVideo'
import Link from 'next/link'
import {
  Shield, Truck, Download, RotateCcw, Share2,
  ChevronRight, Package, Clock, CheckCircle2,
  BookOpen, Heart, Feather, Star
} from 'lucide-react'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  if (!product) return {}
  return {
    title:       `${product.meta_title ?? product.name} | Maria Caro Store`,
    description: product.meta_description ?? product.description ?? undefined,
    openGraph:   { title: product.name, images: product.product_images?.[0]?.url ? [product.product_images[0].url] : [] },
  }
}

// Frases inspiradoras por categoría
const CATEGORY_VERSES: Record<string, { text: string; ref: string }> = {
  devocionales: { text: 'Tu Palabra es lámpara a mis pies y lumbrera a mi camino.', ref: 'Salmo 119:105' },
  planners:     { text: 'Encomienda al Señor tus obras y tus proyectos se cumplirán.', ref: 'Proverbios 16:3' },
  agendas:      { text: 'Instruye al niño en su camino, y aun cuando fuere viejo no se apartará de él.', ref: 'Proverbios 22:6' },
  digitales:    { text: 'La sabiduría que viene de lo alto es primeramente pura, después pacífica.', ref: 'Santiago 3:17' },
}

export default async function ProductoPage({ params }: Props) {
  const [product, supabase] = await Promise.all([getProductBySlug(params.slug), createClient()])
  if (!product) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdminClient()

  const [{ data: reviews }, { data: summary }, { data: wishlistRow }] = await Promise.all([
    admin.from('product_reviews').select('*, profiles(full_name)').eq('product_id', product.id).eq('status', 'approved').order('created_at', { ascending: false }).limit(20),
    admin.from('product_rating_summary').select('*').eq('product_id', product.id).maybeSingle(),
    user ? admin.from('wishlists').select('id').eq('user_id', user.id).eq('product_id', product.id).maybeSingle() : Promise.resolve({ data: null }),
  ])

  const related = product.category_id
    ? await getProducts({ categoryId: product.category_id, limit: 5 }).then(ps => ps.filter(p => p.id !== product.id).slice(0, 4))
    : []

  const images      = (product.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order)
  const { neto, iva } = extractIVA(product.price)
  const hasDiscount = product.compare_price && product.compare_price > product.price
  const discountPct = hasDiscount ? Math.round(100 - (product.price / product.compare_price!) * 100) : 0
  const categorySlug = product.categories?.slug ?? ''
  const verseData   = CATEGORY_VERSES[categorySlug]

  return (
    <div style={{ backgroundColor: '#FFFAF8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-rose-500 transition-colors">Inicio</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/productos" className="hover:text-rose-500 transition-colors">Tienda</Link>
          {product.categories && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/productos?categoria=${product.categories.slug}`} className="hover:text-rose-500 transition-colors">
                {product.categories.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main product section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Gallery */}
          <ProductImageGallery images={images} productName={product.name} />

          {/* Info */}
          <div className="space-y-5">
            {/* Category + SKU */}
            <div className="flex items-center justify-between">
              {product.categories && (
                <Link href={`/productos?categoria=${product.categories.slug}`}
                  className="text-xs font-bold uppercase tracking-widest text-rose-500 hover:text-rose-700 transition-colors"
                >
                  {product.categories.name}
                </Link>
              )}
              {product.sku && <span className="text-[10px] text-gray-300 font-mono">SKU: {product.sku}</span>}
            </div>

            {/* Name */}
            <h1 className="font-cormorant font-light text-3xl md:text-4xl lg:text-5xl text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {summary && Number(summary.review_count) > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`h-4 w-4 ${n <= Math.round(Number(summary.avg_rating)) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{summary.avg_rating}</span>
                <span className="text-sm text-gray-400">({summary.review_count} {Number(summary.review_count) === 1 ? 'reseña' : 'reseñas'})</span>
              </div>
            )}

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">{formatCLP(product.price)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-gray-300 line-through">{formatCLP(product.compare_price!)}</span>
                    <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discountPct}%</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">IVA incluido · Neto {formatCLP(neto)} + IVA {formatCLP(iva)}</p>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-500 leading-[1.9] font-light text-base border-l-2 border-rose-100 pl-4">
                {product.description}
              </p>
            )}

            {/* Variants */}
            {(product.product_variants?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">{product.product_variants[0]?.name ?? 'Variante'}</p>
                <div className="flex flex-wrap gap-2">
                  {product.product_variants.filter(v => v.is_active).map(variant => (
                    <span key={variant.id} className="px-4 py-2 text-sm border border-rose-100 rounded-xl text-gray-700 bg-white hover:border-rose-300 cursor-pointer transition-colors">
                      {variant.value}
                      {variant.price_modifier !== 0 && (
                        <span className="ml-1.5 text-rose-500 font-medium text-xs">
                          {variant.price_modifier > 0 ? '+' : ''}{formatCLP(variant.price_modifier)}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <AvailabilityBadge stock={product.stock} madeToOrder={product.made_to_order ?? false} isDigital={product.is_digital} />

            {/* CTA */}
            <div className="flex gap-3">
              <div className="flex-1"><AddToCartButton product={product} /></div>
              <WishlistButton productId={product.id} initialInWishlist={!!wishlistRow} isLoggedIn={!!user} />
              <button
                title="Compartir"
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-rose-100 text-rose-300 hover:text-rose-500 hover:border-rose-200 bg-white transition-all"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {/* Trust info grid */}
            <div className="grid grid-cols-1 gap-2">
              {product.is_digital ? (
                <div className="flex items-center gap-3 p-3.5 bg-teal-50 rounded-2xl border border-teal-100">
                  <Download className="h-4 w-4 text-teal-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-teal-700">Entrega inmediata</p>
                    <p className="text-xs text-teal-500">Acceso instantáneo por email tras el pago</p>
                  </div>
                </div>
              ) : product.stock > 0 ? (
                <div className="flex items-center gap-3 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <Truck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">Envío en 24 horas hábiles</p>
                    <p className="text-xs text-emerald-500">A todo Chile · Gratis sobre $50.000</p>
                  </div>
                </div>
              ) : product.made_to_order ? (
                <div className="flex items-center gap-3 p-3.5 bg-amber-50 rounded-2xl border border-amber-100">
                  <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700">Fabricación a pedido · 48–72 horas</p>
                    <p className="text-xs text-amber-500">Se prepara especialmente para ti</p>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2.5 p-3 bg-rose-50/60 rounded-2xl border border-rose-100">
                  <Shield className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
                  <p className="text-xs text-gray-600">Pago seguro</p>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-violet-50/60 rounded-2xl border border-violet-100">
                  <RotateCcw className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                  <p className="text-xs text-gray-600">Garantía satisfacción</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── VIDEO (si existe) ── */}
        {product.video_url && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-px w-8 bg-rose-200" />
              <p className="text-xs text-rose-500 font-semibold uppercase tracking-wider">Ver en acción</p>
            </div>
            <div className="max-w-2xl">
              <ProductVideo
                videoUrl={product.video_url}
                posterUrl={images[0]?.url}
                productName={product.name}
              />
            </div>
          </section>
        )}

        {/* ── SECCIONES ENRIQUECIDAS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

          {/* Qué incluye */}
          <div className="bg-white rounded-3xl border border-pink-50 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-rose-50">
                <Package className="h-4 w-4 text-rose-500" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">Qué incluye</h3>
            </div>
            <ul className="space-y-2">
              {product.is_digital ? [
                'Archivo PDF en alta calidad',
                'Formatos A4 y carta',
                'Acceso de descarga por 72h',
                'Enlace por email',
              ] : [
                'Cuaderno con encuadernación premium',
                'Papel de 90g sin sangrado',
                `${product.categories?.name ?? 'Papelería'} con diseño exclusivo`,
                'Empaque cuidado con amor',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Para quién es */}
          <div className="bg-white rounded-3xl border border-violet-50 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-violet-50">
                <Heart className="h-4 w-4 text-violet-500" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">Para quién es</h3>
            </div>
            <ul className="space-y-2">
              {[
                'Personas que buscan crecer en fe',
                'Quienes quieren organizar con propósito',
                'Mujeres que aman papelería bonita',
                'Quien busca un regalo con significado',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-300 mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Cómo usarlo */}
          <div className="bg-white rounded-3xl border border-sky-50 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-sky-50">
                <BookOpen className="h-4 w-4 text-sky-500" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">Cómo usarlo</h3>
            </div>
            <ol className="space-y-2 list-none">
              {product.is_digital ? [
                'Completa tu compra online',
                'Recibe el enlace en tu email',
                'Descarga el archivo PDF',
                'Imprime o usa en tu tablet',
              ] : [
                'Dedica unos minutos cada mañana',
                'Escribe tu versículo y oración',
                'Reflexiona con el corazón abierto',
                'Cierra con gratitud a Dios',
              ].map((item, i) => (
                <li key={item} className="flex items-start gap-2 text-xs text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── VERSÍCULO INSPIRACIONAL ── */}
        {verseData && (
          <section className="mb-16">
            <div className="verse-card p-8 md:p-12 text-center max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-10 bg-rose-200" />
                <Feather className="h-4 w-4 text-rose-400" />
                <div className="h-px w-10 bg-rose-200" />
              </div>
              <p className="font-cormorant font-light text-2xl md:text-3xl text-gray-700 italic leading-relaxed mb-4">
                &ldquo;{verseData.text}&rdquo;
              </p>
              <cite className="text-xs text-gray-400 not-italic uppercase tracking-[0.25em]">
                — {verseData.ref}
              </cite>
            </div>
          </section>
        )}

        {/* ── RELACIONADOS ── */}
        {related.length > 0 && (
          <section className="mb-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs text-rose-500 font-semibold uppercase tracking-wider mb-1">También te puede interesar</p>
                <h2 className="font-cormorant font-light text-2xl md:text-3xl text-gray-800">Productos relacionados</h2>
              </div>
              <Link href={`/productos?categoria=${product.categories?.slug ?? ''}`} className="text-sm text-gray-400 hover:text-rose-500 transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* ── RESEÑAS ── */}
        <ProductReviews
          productId={product.id}
          reviews={reviews ?? []}
          summary={summary ?? null}
          isLoggedIn={!!user}
        />

      </div>
    </div>
  )
}
