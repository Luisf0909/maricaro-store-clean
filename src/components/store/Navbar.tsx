'use client'

import Link from 'next/link'
import { ShoppingBag, User, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/productos',                        label: 'Tienda' },
  { href: '/productos?categoria=devocionales', label: 'Devocionales' },
  { href: '/productos?categoria=planners',      label: 'Planners' },
  { href: '/productos?categoria=agendas',       label: 'Agendas' },
  { href: '/productos?digital=true',            label: 'Digital' },
]

export function Navbar({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled,   setScrolled]   = useState(false)
  const pathname = usePathname()
  const { getItemCount, openCart } = useCartStore()
  const itemCount = getItemCount()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <header className={cn(
      'sticky top-0 z-50 bg-white transition-all duration-300',
      scrolled ? 'shadow-sm border-b border-gray-200' : 'border-b border-gray-100'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[64px]">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 group">
            <span className="font-cormorant text-2xl tracking-wide">
              <span className="text-gray-800 font-medium">MariaCaro</span>
              <span className="text-warm-600 font-light">Store</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href.split('?')[0]) &&
                (link.href === '/productos' ? !navLinks.slice(1).some(l => pathname.includes(l.href)) : pathname.includes(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm transition-colors relative pb-0.5',
                    link.label === 'Digital'
                      ? 'text-aqua-600 hover:text-aqua-700 font-medium'
                      : isActive
                        ? 'text-warm-700 font-semibold'
                        : 'text-gray-600 hover:text-warm-700 font-normal'
                  )}
                >
                  {link.label}
                  {isActive && link.label !== 'Digital' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-warm-500 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <Link
              href={isLoggedIn ? '/cuenta/pedidos' : '/cuenta/login'}
              className="p-2.5 text-gray-600 hover:text-warm-700 transition-colors rounded-full hover:bg-gray-100"
              aria-label="Mi cuenta"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>

            <button
              onClick={openCart}
              className="relative p-2.5 text-gray-600 hover:text-warm-700 transition-colors rounded-full hover:bg-gray-100"
              aria-label={`Carrito (${itemCount} items)`}
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {itemCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-warm-600 text-white text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            <button
              className="md:hidden p-2.5 text-gray-600 hover:text-warm-700 transition-colors rounded-full hover:bg-gray-100"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menú"
            >
              {mobileOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        'md:hidden border-t border-gray-100 bg-white overflow-hidden transition-all duration-300',
        mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
      )}>
        <nav className="flex flex-col px-4 py-4 gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'py-2.5 px-3 text-sm rounded-lg transition-colors',
                link.label === 'Digital'
                  ? 'text-aqua-600 font-medium hover:bg-aqua-50'
                  : 'text-gray-600 hover:text-warm-700 hover:bg-gray-50'
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 my-2" />
          <Link
            href={isLoggedIn ? '/cuenta/pedidos' : '/cuenta/login'}
            className="py-2.5 px-3 text-sm text-gray-600 hover:text-warm-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {isLoggedIn ? 'Mi cuenta' : 'Iniciar sesión'}
          </Link>
        </nav>
      </div>
    </header>
  )
}
