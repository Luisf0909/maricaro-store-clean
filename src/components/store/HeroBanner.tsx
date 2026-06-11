'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, Heart, Download } from 'lucide-react'
import { formatCLP } from '@/lib/utils'
import type { ProductWithImages } from '@/types'

interface Props { featuredProducts: ProductWithImages[] }

const SLIDES = [
  {
    id: 1,
    eyebrow: 'Papelería con fe',
    title: 'Organiza tus días\ncon fe y propósito',
    subtitle: 'Devocionales, planners y agendas diseñados para acompañar\ntu caminar con Dios cada día.',
    cta: 'Explorar colección',
    href: '/productos',
    icon: Heart,
    bg: 'from-rose-50 via-pink-50 to-fuchsia-50',
    blobA: 'bg-pink-200/40',
    blobB: 'bg-fuchsia-100/40',
    blobC: 'bg-rose-100/30',
    tagBg: 'bg-rose-100/80 text-rose-600',
    ctaClass: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200',
    accentClass: 'bg-rose-100 text-rose-600',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=900&q=85',
    imageAlt: 'Cuaderno devocional con flores y luz natural',
  },
  {
    id: 2,
    eyebrow: 'Planea con propósito',
    title: 'Diseñamos con fe\npara tocar el alma',
    subtitle: 'Planners semanales y mensuales que te ayudan a vivir\ncada día con intención y amor por Dios.',
    cta: 'Ver planners',
    href: '/productos?categoria=planners',
    icon: Sparkles,
    bg: 'from-violet-50 via-purple-50 to-fuchsia-50',
    blobA: 'bg-violet-200/35',
    blobB: 'bg-purple-100/35',
    blobC: 'bg-fuchsia-100/25',
    tagBg: 'bg-violet-100/80 text-violet-600',
    ctaClass: 'bg-violet-500 hover:bg-violet-600 text-white shadow-violet-200',
    accentClass: 'bg-violet-100 text-violet-600',
    imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=900&q=85',
    imageAlt: 'Planner abierto con pluma y café en escritorio',
  },
  {
    id: 3,
    eyebrow: 'Descarga instantánea',
    title: 'Recursos digitales\npara tu vida de fe',
    subtitle: 'PDFs, planners digitales y guías de estudio bíblico.\nRecíbelos al instante en tu correo.',
    cta: 'Ver digitales',
    href: '/productos?digital=true',
    icon: Download,
    bg: 'from-sky-50 via-blue-50 to-cyan-50',
    blobA: 'bg-sky-200/40',
    blobB: 'bg-blue-100/35',
    blobC: 'bg-cyan-100/30',
    tagBg: 'bg-sky-100/80 text-sky-600',
    ctaClass: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200',
    accentClass: 'bg-sky-100 text-sky-600',
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=900&q=85',
    imageAlt: 'Tablet con planner digital en escritorio minimalista',
  },
]

export function HeroBanner({ featuredProducts }: Props) {
  const [current, setCurrent] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [hovering, setHovering] = useState(false)

  const goTo = useCallback((idx: number) => {
    if (transitioning) return
    setTransitioning(true)
    setTimeout(() => { setCurrent(idx); setTransitioning(false) }, 280)
  }, [transitioning])

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo])
  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length)

  useEffect(() => {
    if (hovering) return
    const t = setInterval(next, 5500)
    return () => clearInterval(t)
  }, [next, hovering])

  const slide = SLIDES[current]
  const Icon = slide.icon
  const featured = featuredProducts[current % Math.max(featuredProducts.length, 1)]

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: 440, maxHeight: 600 }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-all duration-700`} />

      {/* Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-24 -right-24 w-80 h-80 rounded-full ${slide.blobA} blur-3xl`} />
        <div className={`absolute -bottom-24 -left-24 w-72 h-72 rounded-full ${slide.blobB} blur-3xl`} />
        <div className={`absolute top-1/2 right-1/3 w-48 h-48 rounded-full ${slide.blobC} blur-2xl`} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, #555 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center" style={{ minHeight: 440 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center w-full py-14 lg:py-20">

          {/* Text */}
          <div className={`transition-all duration-400 ${transitioning ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}>
            <div className={`inline-flex items-center gap-2 ${slide.tagBg} text-xs font-semibold uppercase tracking-widest rounded-full px-3.5 py-1.5 mb-5`}>
              <Icon className="h-3.5 w-3.5" />
              {slide.eyebrow}
            </div>

            <h1 className="font-cormorant font-light text-4xl md:text-5xl lg:text-[3.5rem] text-gray-800 leading-[1.12] mb-4">
              {slide.title.split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
            </h1>

            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-7 font-light max-w-md">
              {slide.subtitle.split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href={slide.href}
                className={`inline-flex items-center gap-2 ${slide.ctaClass} font-semibold text-sm px-6 py-3 rounded-full shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
              >
                {slide.cta} <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/productos"
                className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-3 rounded-full border border-gray-200/70 bg-white/60 hover:bg-white/80 backdrop-blur-sm transition-all"
              >
                Ver todo
              </Link>
            </div>

            {/* Featured chip */}
            {featured && (
              <Link href={`/producto/${featured.slug}`}
                className="mt-7 flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-2.5 pr-4 border border-white/90 shadow-sm w-fit hover:shadow-md transition-shadow"
              >
                <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-pink-50">
                  {featured.product_images?.[0] ? (
                    <Image src={featured.product_images[0].url} alt={featured.name} fill className="object-cover" sizes="40px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-pink-300" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{featured.categories?.name ?? 'Destacado'}</p>
                  <p className="text-xs text-gray-700 font-semibold truncate max-w-[140px]">{featured.name}</p>
                </div>
                <span className="text-xs font-bold text-gray-800 ml-auto flex-shrink-0">{formatCLP(featured.price)}</span>
              </Link>
            )}
          </div>

          {/* Image */}
          <div className={`hidden lg:flex justify-center items-center transition-all duration-400 ${transitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="relative w-full max-w-[420px] aspect-[4/3.2] rounded-3xl overflow-hidden shadow-2xl shadow-black/8">
              <Image src={slide.imageUrl} alt={slide.imageAlt} fill priority className="object-cover" sizes="420px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent" />
            </div>

            {/* Floating verse */}
            <div className="absolute -bottom-2 -left-4 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg border border-white/90 max-w-[190px]">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Filipenses 4:13</p>
              <p className="text-xs text-gray-700 font-medium italic leading-snug">&ldquo;Todo lo puedo en Cristo que me fortalece.&rdquo;</p>
            </div>

            {/* Badge */}
            <div className={`absolute -top-2 -right-2 ${slide.accentClass} rounded-2xl px-3 py-2 shadow-md text-[10px] font-bold uppercase tracking-wide`}>
              ✨ Nueva colección
            </div>
          </div>

        </div>
      </div>

      {/* Arrows */}
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white backdrop-blur-sm shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white backdrop-blur-sm shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all">
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-gray-500' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
          />
        ))}
      </div>
    </section>
  )
}
