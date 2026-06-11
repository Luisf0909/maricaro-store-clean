'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) =>
        set((state) => {
          const idx = state.items.findIndex(
            (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
          )
          if (idx >= 0) {
            const updated = [...state.items]
            updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + newItem.quantity }
            return { items: updated }
          }
          return { items: [...state.items, newItem] }
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        })),

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId && i.variantId === variantId
                ? { ...i, quantity: Math.max(0, quantity) }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'mcs-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
