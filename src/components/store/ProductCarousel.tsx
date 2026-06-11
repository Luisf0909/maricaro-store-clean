'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from './ProductCard'
import type { ProductWithImages } from '@/types'

interface Props {
  products: ProductWithImages[]
}

export function ProductCarousel({ products }: Props) {
  const trackRef  = useRef<HTMLDivElement>(null)
  const [canLeft,   setCanLeft]   = useState(false)
  const [canRight,  setCanRight]  = useState(true)
  const [dotIndex,  setDotIndex]  = useState(0)
  const [paused,    setPaused]    = useState(false)

  // Card width including gap
  const cardPx = useCallback(() => {
    const el = trackRef.current
    if (!el || !el.firstElementChild) return 220
    const card = el.firstElementChild as HTMLElement
    const gap  = 20 // gap-5 = 20px
    return card.getBoundingClientRect().width + gap
  }, [])

  const updateState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max   = el.scrollWidth - el.clientWidth
    const left  = el.scrollLeft
    setCanLeft(left > 2)
    setCanRight(left < max - 2)
    const cw  = cardPx()
    if (cw > 0) setDotIndex(Math.round(left / cw))
  }, [cardPx])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateState()
    el.addEventListener('scroll', updateState, { passive: true })
    window.addEventListener('resize', updateState, { passive: true })
    return () => {
      el.removeEventListener('scroll', updateState)
      window.removeEventListener('resize', updateState)
    }
  }, [updateState])

  const scrollDir = useCallback((dir: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'right' ? cardPx() : -cardPx(), behavior: 'smooth' })
  }, [cardPx])

  const scrollTo = useCallback((i: number) => {
    const el = trackRef.current
    if (!el) return
    el.scrollTo({ left: cardPx() * i, behavior: 'smooth' })
  }, [cardPx])

  // Auto-advance every 4 s
  useEffect(() => {
    if (paused || products.length <= 3) return
    const id = setInterval(() => {
      const el = trackRef.current
      if (!el) return
      const max = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= max - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        scrollDir('right')
      }
    }, 4000)
    return () => clearInterval(id)
  }, [paused, products.length, scrollDir])

  if (!products.length) return null

  const dots = Math.min(products.length, 10)

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Left arrow */}
      {canLeft && (
        <button
          type="button"
          onClick={() => scrollDir('left')}
          className="absolute -left-4 top-[38%] z-10 glass gold-border rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all hover:-translate-x-1 md:flex hidden items-center justify-center"
        >
          <ChevronLeft className="h-4 w-4 text-warm-700" />
        </button>
      )}

      {/* Right arrow */}
      {canRight && (
        <button
          type="button"
          onClick={() => scrollDir('right')}
          className="absolute -right-4 top-[38%] z-10 glass gold-border rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all hover:translate-x-1 md:flex hidden items-center justify-center"
        >
          <ChevronRight className="h-4 w-4 text-warm-700" />
        </button>
      )}

      {/* Track */}
      <div
        ref={trackRef}
        className="scrollbar-hide flex gap-5 overflow-x-auto pb-4"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="flex-none"
            style={{ scrollSnapAlign: 'start', width: 'clamp(160px, 46vw, 220px)' }}
          >
            <ProductCard product={p} />
          </div>
        ))}
        {/* Right-padding sentinel */}
        <div className="flex-none w-1 shrink-0" />
      </div>

      {/* Dots */}
      {products.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: dots }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === Math.min(dotIndex, dots - 1)
                  ? 'w-5 h-1.5 bg-gold-500'
                  : 'w-1.5 h-1.5 bg-warm-300 hover:bg-warm-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
