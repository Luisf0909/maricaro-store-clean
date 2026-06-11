'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatCLP } from '@/lib/utils'
import { AvailabilityBadge } from './AvailabilityBadge'
import { ShoppingBag, Download, Heart, Star } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { toast } from 'sonner'
import type { ProductWithImages } from '@/types'

interface ProductCardProps {
  product: ProductWithImages
}

// Fondos pastel según categoría
const CATEGORY_PALETTES: Record<string, { bg: string; badgeBg: string; badgeText: string }> = {
  devocionales: { bg: 'from-rose-50 to-pink-50',   badgeBg: 'bg-rose-100',   badgeText: 'text-rose-600' },
  planners:     { bg: 'from-violet-50 to-purple-50', badgeBg: 'bg-violet-100', badgeText: 'text-violet-600' },
  agendas:      { bg: 'from-sky-50 to-blue-50',     badgeBg: 'bg-sky-100',    badgeText: 'text-sky-600' },
  digitales:    { bg: 'from-teal-50 to-cyan-50',    badgeBg: 'bg-teal-100',   badgeText: 'text-teal-600' },
}

const DEFAULT_PALETTE = { bg: 'from-gray-50 to-white', badgeBg: 'bg-gray-100', badgeText: 'text-gray-500' }

// Frases emocionales por categoría
const CATEGORY_PHRASES: Record<string, string> = {
  devocionales: 'Para tu tiempo con Dios',
  planners:     'Organiza con propósito',
  agendas:      'Vive cada día con fe',
  digitales:    'Descarga al instante',
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore()

  const primaryImage = product.product_images?.find(img => img.is_primary) ?? product.product_images?.[0]
  const hasDiscount   = !!(product.compare_price && product.compare_price > product.price)
  const discountPct   = hasDiscount ? Math.round(100 - (product.price / product.compare_price!) * 100) : 0
  const categorySlug  = product.categories?.slug ?? ''
  const palette       = CATEGORY_PALETTES[categorySlug] ?? DEFAULT_PALETTE
  const phrase        = CATEGORY_PHRASES[categorySlug] ?? 'Con amor y fe'
  const isOutOfStock  = !product.is_digital && product.stock === 0 && !product.made_to_order

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    addItem({
      productId: product.id,
      name:      product.name,
      price:     product.price,
      imageUrl:  primaryImage?.url,
      quantity:  1,
      slug:      product.slug,
      isDigital: product.is_digital,
    })
    toast.success('¡Añadido al carrito! 🌸', {
      action: { label: 'Ver carrito', onClick: openCart },
    })
  }

  return (
    <div className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 product-card-hover">

      {/* Image section */}
      <Link href={`/producto/${product.slug}`} className="relative block overflow-hidden">
        <div className={`relative aspect-[3/4] bg-gradient-to-br ${palette.bg} overflow-hidden`}>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text ?? product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-104"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${palette.bg}`}>
              <span className="font-cormorant text-gray-300 text-sm italic">Sin imagen</span>
            </div>
          )}

          {/* Badges top-left */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {product.is_digital && (
              <span className="inline-flex items-center gap-1 bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                <Download className="h-2.5 w-2.5" /> DIGITAL
              </span>
            )}
            {hasDiscount && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                -{discountPct}%
              </span>
            )}
            {product.is_featured && !product.is_digital && (
              <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                <Star className="h-2.5 w-2.5 fill-current" /> AMADO
              </span>
            )}
            {product.stock > 0 && product.stock <= 5 && !product.is_digital && (
              <span className="bg-orange-100 text-orange-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                ¡Últimas {product.stock}!
              </span>
            )}
          </div>

          {/* Wishlist button top-right */}
          <button
            onClick={e => e.preventDefault()}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm hover:bg-rose-50 text-gray-300 hover:text-rose-400"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>

          {/* Add to cart — slides up */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full flex items-center justify-center gap-2 text-white text-xs font-semibold py-3 transition-colors
                ${isOutOfStock
                  ? 'bg-gray-300 cursor-not-allowed'
                  : product.is_digital
                    ? 'bg-teal-500 hover:bg-teal-600'
                    : 'bg-rose-500 hover:bg-rose-600'
                }`}
            >
              {product.is_digital
                ? <><Download className="h-3.5 w-3.5" /> Añadir al carrito</>
                : <><ShoppingBag className="h-3.5 w-3.5" /> Añadir al carrito</>}
            </button>
          </div>
        </div>
      </Link>

      {/* Text content */}
      <div className="p-2 sm:p-3 md:p-4 flex flex-col gap-1 sm:gap-1.5 flex-1">
        {/* Category phrase */}
        <p className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider ${palette.badgeText}`}>
          {phrase}
        </p>

        <Link href={`/producto/${product.slug}`}>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-rose-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-1 sm:pt-2">
          <span className="text-sm sm:text-base font-bold text-gray-900">
            {formatCLP(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[9px] sm:text-xs text-gray-300 line-through">
              {formatCLP(product.compare_price!)}
            </span>
          )}
        </div>

        <AvailabilityBadge
          stock={product.stock}
          madeToOrder={product.made_to_order ?? false}
          isDigital={product.is_digital}
          size="sm"
        />
      </div>
    </div>
  )
}
