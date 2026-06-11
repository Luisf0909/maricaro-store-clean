'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  productId: string
  initialInWishlist?: boolean
  isLoggedIn: boolean
  className?: string
}

export function WishlistButton({ productId, initialInWishlist = false, isLoggedIn, className }: Props) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist)
  const [isPending, startTransition] = useTransition()

  function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) {
      toast.error('Debes iniciar sesión para guardar favoritos', {
        action: { label: 'Iniciar sesión', onClick: () => window.location.href = '/cuenta/login' },
      })
      return
    }

    const prev = inWishlist
    setInWishlist(!prev)

    startTransition(async () => {
      try {
        const res = await fetch(`/api/wishlist`, {
          method: prev ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
        if (!res.ok) throw new Error()
        toast.success(prev ? 'Eliminado de favoritos' : 'Guardado en favoritos')
      } catch {
        setInWishlist(prev) // revert
        toast.error('No se pudo actualizar favoritos')
      }
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={cn(
        'flex items-center justify-center w-10 h-10 rounded-xl border transition-all',
        inWishlist
          ? 'bg-petal-50 border-petal-200 text-petal-500 hover:bg-petal-100'
          : 'border-gray-200 text-gray-400 hover:border-petal-200 hover:text-petal-400 bg-white',
        isPending && 'opacity-50 cursor-wait',
        className
      )}
      title={inWishlist ? 'Quitar de favoritos' : 'Guardar en favoritos'}
    >
      <Heart className={cn('h-4.5 w-4.5', inWishlist && 'fill-current')} strokeWidth={2} />
    </button>
  )
}
