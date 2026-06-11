'use client'

import { useCartStore } from '@/lib/store/cart'
import { formatCLP } from '@/lib/utils'
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } = useCartStore()
  const total = getTotal()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-cream-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-warm-700" />
            <h2 className="font-serif text-lg text-warm-900">
              Tu carrito
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-md hover:bg-cream-200 transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5 text-foreground/60" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag className="h-12 w-12 text-cream-300" />
              <p className="text-muted-foreground text-sm">Tu carrito está vacío</p>
              <Link
                href="/productos"
                onClick={closeCart}
                className="text-sm font-medium text-warm-700 underline underline-offset-4 hover:text-warm-900"
              >
                Ver productos
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                {/* Image */}
                <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-cream-200">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full bg-cream-200" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  {item.variantName && (
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                  )}
                  <p className="text-sm font-semibold text-warm-700 mt-0.5">
                    {formatCLP(item.price)}
                  </p>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, item.quantity - 1)
                      }
                      className="p-0.5 rounded border border-cream-300 hover:bg-cream-200 transition-colors"
                      aria-label="Reducir cantidad"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, item.quantity + 1)
                      }
                      className="p-0.5 rounded border border-cream-300 hover:bg-cream-200 transition-colors"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="ml-auto p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-cream-200 px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatCLP(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Envío gratis sobre {formatCLP(50000)}
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-warm-700 hover:bg-warm-800 text-cream-50 text-sm font-semibold text-center py-3 rounded-lg transition-colors"
            >
              Ir al checkout
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  )
}
