'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { ShoppingBag, Check } from 'lucide-react'
import type { ProductWithVariants } from '@/types'

interface AddToCartButtonProps {
  product: ProductWithVariants
  selectedVariantId?: string
}

export function AddToCartButton({ product, selectedVariantId }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const { addItem, openCart } = useCartStore()

  const variant = product.product_variants?.find((v) => v.id === selectedVariantId)
  const price = product.price + (variant?.price_modifier ?? 0)
  const primaryImage = product.product_images?.find((i) => i.is_primary) ?? product.product_images?.[0]

  function handleAdd() {
    addItem({
      productId: product.id,
      variantId: selectedVariantId,
      name: product.name,
      variantName: variant ? `${variant.name}: ${variant.value}` : undefined,
      price,
      imageUrl: primaryImage?.url,
      quantity: 1,
      slug: product.slug,
    })
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2000)
  }

  const outOfStock = product.stock === 0 && !variant
    ? true
    : variant
      ? variant.stock === 0
      : product.stock === 0

  return (
    <button
      onClick={handleAdd}
      disabled={outOfStock || added}
      className="w-full flex items-center justify-center gap-2 bg-warm-700 hover:bg-warm-800 disabled:bg-cream-300 disabled:cursor-not-allowed text-cream-50 font-semibold py-3.5 px-6 rounded-xl transition-colors"
    >
      {added ? (
        <>
          <Check className="h-5 w-5" />
          Agregado
        </>
      ) : outOfStock ? (
        'Agotado'
      ) : (
        <>
          <ShoppingBag className="h-5 w-5" />
          Agregar al carrito
        </>
      )}
    </button>
  )
}
