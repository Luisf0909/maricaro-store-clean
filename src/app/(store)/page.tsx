export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { getFeaturedProducts, getNewProducts, getSiteConfig } from '@/lib/products'
import { getActiveSections, getSectionConfig } from '@/lib/cms'
import { ProductCard } from '@/components/store/ProductCard'
import { ProductCarousel } from '@/components/store/ProductCarousel'
import { HeroBanner } from '@/components/store/HeroBanner'
import { CategoryGrid } from '@/components/store/CategoryGrid'
import { NewsletterForm } from '@/components/store/NewsletterForm'
import {
  ArrowRight, BookOpen, Feather, Compass, Heart, Sparkles,
  Package, Shield, Download, CheckCircle2
} from 'lucide-react'
import type { HomepageSection } from '@/types'

export default async function HomePage() {
  const [featured, newProducts, config, sections] = await Promise.all([
    getFeaturedProducts(8),
    getNewProducts(10),
    getSiteConfig(),
    getActiveSections(),
  ])

  // Site-config with CMS override support
  const inspTitle    = config.inspiration_title    ?? '¿Qué nos inspiró?'
  const inspBody     = config.inspiration_body     ?? 'Todo comenzó con el deseo de caminar con Dios cada día, con intención y belleza.'
  const inspVerse    = config.inspiration_verse    ?? 'Todo lo que hagan, háganlo de corazón, como si fuera para el Señor.'
  const inspVerseRef = config.inspiration_verse_ref ?? 'Colosenses 3:23'

  // If no sections in DB, render the full default layout
  if (!sections.length) {
    return <DefaultHome featured={featured} newProducts={newProducts} inspTitle={inspTitle} inspBody={inspBody} inspVerse={inspVerse} inspVerseRef={inspVerseRef} />
  }

  // Render sections dynamically
  return (
    <div style={{ backgroundColor: '#FFFAF8' }}>
      {sections.map(section => (
        <SectionRenderer
          key={section.id}
          section={section}
          featured={featured}
          newProducts={newProducts}
          inspTitle={inspTitle}
          inspBody={inspBody}
          inspVerse={inspVerse}
          inspVerseRef={inspVerseRef}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Renderer — dispatches to the right section component
// ─────────────────────────────────────────────────────────────────────────────

interface SectionProps {
  section: HomepageSection
  featured: Awaited<ReturnType<typeof getFeaturedProducts>>
  newProducts: Awaited<ReturnType<typeof getNewProducts>>
  inspTitle: string; inspBody: string; inspVerse: string; inspVerseRef: string
}

async function SectionRenderer({ section, featured, newProducts, inspTitle, inspBody, inspVerse, inspVerseRef }: SectionProps) {
  switch (section.type) {
    case 'hero_banner':
      return <HeroBannerSection section={section} featured={featured} />
    case 'category_grid':
      return <CategoryGridSection section={section} />
    case 'featured_products':
      return <FeaturedSection section={section} featured={featured} />
    case 'new_arrivals':
      return <NewArrivalsSection section={section} newProducts={newProducts} />
    case 'promo_banner':
      return <PromoBannerSection section={section} inspVerse={inspVerse} inspVerseRef={inspVerseRef} />
    case 'inspiration':
      return <InspirationSection section={section} inspTitle={inspTitle} inspBody={inspBody} inspVerse={inspVerse} inspVerseRef={inspVerseRef} />
    case 'newsletter':
      return <NewsletterSection section={section} />
    case 'custom_html': {
      const html = getSectionConfig(section, 'html', '')
      if (!html) return null
      return <div className="max-w-7xl mx-auto px-4 py-8" dangerouslySetInnerHTML={{ __html: html }} />
    }
    default:
      return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual Section Components
// ─────────────────────────────────────────────────────────────────────────────

function HeroBannerSection({ section, featured }: Pick<SectionProps, 'section' | 'featured'>) {
  const limit = getSectionConfig(section, 'limit', 3)
  return <HeroBanner featuredProducts={featured.slice(0, limit)} />
}

function CategoryGridSection({ section }: { section: HomepageSection }) {
  const title = getSectionConfig(section, 'title', 'Encuentra lo que tu alma necesita')
  const subtitle = getSectionConfig(section, 'subtitle', '')
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-10">
        <p className="text-xs text-rose-500 font-semibold uppercase tracking-[0.25em] mb-2">Colección</p>
        <h2 className="font-cormorant font-light text-3xl md:text-4xl text-gray-800">{title}</h2>
        {subtitle && <p className="text-gray-400 text-sm mt-2 font-light">{subtitle}</p>}
      </div>
      <CategoryGrid />
    </section>
  )
}

function FeaturedSection({ section, featured }: Pick<SectionProps, 'section' | 'featured'>) {
  if (!featured.length) return null
  const title    = getSectionConfig(section, 'title', 'Más amados')
  const subtitle = getSectionConfig(section, 'subtitle', 'Selección especial')
  const limit    = getSectionConfig(section, 'limit', 8)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs text-rose-500 font-semibold uppercase tracking-[0.25em] mb-2">{subtitle}</p>
          <h2 className="font-cormorant font-light text-3xl md:text-4xl text-gray-800">{title}</h2>
        </div>
        <Link href="/productos" className="text-sm font-medium text-gray-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors group">
          Ver todos <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {featured.slice(0, limit).map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}

function NewArrivalsSection({ section, newProducts }: Pick<SectionProps, 'section' | 'newProducts'>) {
  if (!newProducts.length) return null
  const title    = getSectionConfig(section, 'title', 'Nuevos lanzamientos')
  const subtitle = getSectionConfig(section, 'subtitle', 'Recién llegados')

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs text-violet-500 font-semibold uppercase tracking-[0.25em] mb-2">{subtitle}</p>
          <h2 className="font-cormorant font-light text-3xl md:text-4xl text-gray-800">{title}</h2>
        </div>
        <Link href="/productos" className="text-sm font-medium text-gray-400 hover:text-violet-500 flex items-center gap-1.5 transition-colors group">
          Ver todos <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      <ProductCarousel products={newProducts} />
    </section>
  )
}

function PromoBannerSection({ section, inspVerse, inspVerseRef }: Pick<SectionProps, 'section' | 'inspVerse' | 'inspVerseRef'>) {
  const verse     = getSectionConfig(section, 'verse', inspVerse)
  const verseRef  = getSectionConfig(section, 'verse_ref', inspVerseRef)
  const ctaText   = getSectionConfig(section, 'cta_text', 'Explorar productos')
  const ctaHref   = getSectionConfig(section, 'cta_href', '/productos')

  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-50 via-pink-50 to-sky-50" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/30 blur-3xl" />
      </div>
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-7">
          <div className="h-px w-12 bg-rose-200" />
          <Feather className="h-4 w-4 text-rose-400" />
          <div className="h-px w-12 bg-rose-200" />
        </div>
        <blockquote>
          <p className="font-cormorant font-light text-3xl md:text-4xl lg:text-5xl text-gray-700 leading-[1.3] italic mb-6">
            &ldquo;{verse}&rdquo;
          </p>
          <cite className="text-gray-400 text-xs not-italic uppercase tracking-[0.3em]">— {verseRef}</cite>
        </blockquote>
        <div className="mt-10">
          <Link href={ctaHref}
            className="inline-flex items-center gap-2 bg-white hover:bg-rose-50 border border-rose-100 hover:border-rose-200 text-rose-600 font-semibold text-sm px-6 py-3 rounded-full shadow-sm transition-all hover:-translate-y-0.5"
          >
            {ctaText} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function InspirationSection({ section, inspTitle, inspBody, inspVerse, inspVerseRef }: Pick<SectionProps, 'section' | 'inspTitle' | 'inspBody' | 'inspVerse' | 'inspVerseRef'>) {
  const title     = getSectionConfig(section, 'title', inspTitle)
  const body      = getSectionConfig(section, 'body', inspBody)
  const verse     = getSectionConfig(section, 'verse', inspVerse)
  const verseRef  = getSectionConfig(section, 'verse_ref', inspVerseRef)
  const imageUrl  = getSectionConfig(section, 'image_url', 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=85')

  return (
    <section className="bg-gradient-to-br from-rose-50 via-white to-violet-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl shadow-pink-100">
              <Image src={imageUrl} alt={title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
          </div>
          {/* Text */}
          <div className="order-1 lg:order-2 space-y-6">
            <div>
              <p className="text-xs text-rose-500 font-semibold uppercase tracking-[0.25em] mb-3">Nuestra historia</p>
              <h2 className="font-cormorant font-light text-3xl md:text-4xl text-gray-800 leading-tight mb-4">{title}</h2>
              <p className="text-gray-500 leading-[1.9] font-light text-base">{body}</p>
            </div>
            <div className="space-y-3">
              {[
                { icon: Compass, title: 'Discernimiento',  desc: 'Cada producto nace de oración y búsqueda genuina.' },
                { icon: Heart,   title: 'Propósito',       desc: 'Creamos para edificar, no solo para vender.' },
                { icon: Sparkles,title: 'Belleza con fe',  desc: 'Lo estético al servicio de lo eterno.' },
              ].map(v => (
                <div key={v.title} className="flex gap-4 p-4 rounded-2xl hover:bg-rose-50/50 transition-colors">
                  <div className="p-2 rounded-xl bg-rose-100 h-fit flex-shrink-0">
                    <v.icon className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{v.title}</p>
                    <p className="text-sm text-gray-400 font-light leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {verse && (
              <blockquote className="border-l-2 border-rose-200 pl-4">
                <p className="font-cormorant italic text-lg text-gray-600">&ldquo;{verse}&rdquo;</p>
                <cite className="text-xs text-gray-400 not-italic">— {verseRef}</cite>
              </blockquote>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function NewsletterSection({ section }: { section: HomepageSection }) {
  const title    = getSectionConfig(section, 'title', 'Únete a nuestra familia')
  const subtitle = getSectionConfig(section, 'subtitle', 'Recibe novedades, devocionales gratuitos y acceso anticipado a nuevos productos.')
  const note     = getSectionConfig(section, 'note', 'Sin spam. Solo contenido que edifica. ✝️')

  return (
    <section className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="bg-gradient-to-br from-rose-50 via-white to-violet-50 rounded-3xl border border-pink-100 shadow-sm p-10 md:p-14">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-10 bg-rose-200" />
          <BookOpen className="h-4 w-4 text-rose-400" />
          <div className="h-px w-10 bg-rose-200" />
        </div>
        <p className="text-xs text-rose-500 font-semibold uppercase tracking-[0.25em] mb-3">Comunidad</p>
        <h2 className="font-cormorant font-light text-3xl md:text-4xl text-gray-800 mb-3">{title}</h2>
        <p className="text-gray-400 text-sm mb-7 font-light leading-relaxed">{subtitle}</p>
        <NewsletterForm />
        {note && <p className="text-xs text-gray-300 mt-4">{note}</p>}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DefaultHome — rendered when DB has no sections yet
// ─────────────────────────────────────────────────────────────────────────────

interface DefaultHomeProps {
  featured: Awaited<ReturnType<typeof getFeaturedProducts>>
  newProducts: Awaited<ReturnType<typeof getNewProducts>>
  inspTitle: string; inspBody: string; inspVerse: string; inspVerseRef: string
}

function DefaultHome({ featured, newProducts, inspVerse, inspVerseRef }: DefaultHomeProps) {
  return (
    <div style={{ backgroundColor: '#FFFAF8' }}>
      <HeroBanner featuredProducts={featured.slice(0, 3)} />

      {/* Strip */}
      <section className="bg-white border-y border-pink-50 py-5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {[
              { icon: Heart, text: 'Creado con amor y fe' },
              { icon: Package, text: 'Envío a todo Chile' },
              { icon: Download, text: 'Digitales al instante' },
              { icon: Shield, text: 'Pago 100% seguro' },
              { icon: CheckCircle2, text: 'Calidad artesanal' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2 text-xs text-gray-500">
                <item.icon className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <p className="text-xs text-rose-500 font-semibold uppercase tracking-[0.25em] mb-2">Colección</p>
          <h2 className="font-cormorant font-light text-3xl md:text-4xl text-gray-800">Encuentra lo que tu alma necesita</h2>
        </div>
        <CategoryGrid />
      </section>

      {/* Destacados */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs text-rose-500 font-semibold uppercase tracking-[0.25em] mb-2">Selección especial</p>
              <h2 className="font-cormorant font-light text-3xl md:text-4xl text-gray-800">Más amados</h2>
            </div>
            <Link href="/productos" className="text-sm font-medium text-gray-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors group">
              Ver todos <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Versículo */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50 via-pink-50 to-sky-50" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-7">
            <div className="h-px w-12 bg-rose-200" />
            <Feather className="h-4 w-4 text-rose-400" />
            <div className="h-px w-12 bg-rose-200" />
          </div>
          <blockquote>
            <p className="font-cormorant font-light text-3xl md:text-5xl text-gray-700 italic leading-[1.3] mb-6">&ldquo;{inspVerse}&rdquo;</p>
            <cite className="text-gray-400 text-xs not-italic uppercase tracking-[0.3em]">— {inspVerseRef}</cite>
          </blockquote>
          <div className="mt-10">
            <Link href="/productos" className="inline-flex items-center gap-2 bg-white hover:bg-rose-50 border border-rose-100 text-rose-600 font-semibold text-sm px-6 py-3 rounded-full shadow-sm transition-all hover:-translate-y-0.5">
              Explorar productos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Nuevos */}
      {newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs text-violet-500 font-semibold uppercase tracking-[0.25em] mb-2">Recién llegados</p>
              <h2 className="font-cormorant font-light text-3xl md:text-4xl text-gray-800">Nuevos lanzamientos</h2>
            </div>
            <Link href="/productos" className="text-sm font-medium text-gray-400 hover:text-violet-500 flex items-center gap-1.5 transition-colors group">
              Ver todos <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <ProductCarousel products={newProducts} />
        </section>
      )}

      {/* Newsletter */}
      <section className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-br from-rose-50 via-white to-violet-50 rounded-3xl border border-pink-100 shadow-sm p-10 md:p-14">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10 bg-rose-200" />
            <BookOpen className="h-4 w-4 text-rose-400" />
            <div className="h-px w-10 bg-rose-200" />
          </div>
          <p className="text-xs text-rose-500 font-semibold uppercase tracking-[0.25em] mb-3">Comunidad</p>
          <h2 className="font-cormorant font-light text-3xl md:text-4xl text-gray-800 mb-3">Únete a nuestra familia</h2>
          <p className="text-gray-400 text-sm mb-7 font-light leading-relaxed">
            Recibe novedades, devocionales gratuitos y acceso anticipado a nuevos productos.
          </p>
          <NewsletterForm />
          <p className="text-xs text-gray-300 mt-4">Sin spam. Solo contenido que edifica. ✝️</p>
        </div>
      </section>
    </div>
  )
}
