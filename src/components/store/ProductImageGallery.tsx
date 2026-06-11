'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/types'

interface Props {
  images: ProductImage[]
  productName: string
}

export function ProductImageGallery({ images, productName }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  const active = images[activeIdx]

  function prev() { setActiveIdx(i => (i - 1 + images.length) % images.length) }
  function next() { setActiveIdx(i => (i + 1) % images.length) }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 cursor-zoom-in group"
        onClick={() => setZoomed(true)}
      >
        {active ? (
          <Image
            src={active.url}
            alt={active.alt_text ?? productName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-warm-50 to-warm-100">
            <span className="font-cormorant text-warm-300 text-lg italic">Sin imagen</span>
          </div>
        )}

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-4 w-4 text-gray-700" />
            </button>
          </>
        )}

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/80 rounded-full p-1.5">
            <ZoomIn className="h-3.5 w-3.5 text-gray-600" />
          </div>
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">
            {activeIdx + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                idx === activeIdx
                  ? 'border-warm-600 ring-1 ring-warm-400'
                  : 'border-transparent hover:border-gray-300'
              )}
            >
              <Image
                src={img.url}
                alt={img.alt_text ?? `Imagen ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {zoomed && active && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-sm"
            onClick={() => setZoomed(false)}
          >
            ✕ Cerrar
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            </>
          )}
          <div className="relative max-w-2xl max-h-[85vh] w-full h-full">
            <Image
              src={active.url}
              alt={active.alt_text ?? productName}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </div>
  )
}
