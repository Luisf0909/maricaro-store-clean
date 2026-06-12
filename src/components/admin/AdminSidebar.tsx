'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Package, ShoppingBag, Users, LogOut,
  Tag, Settings2, Gift, Star, BarChart3, Image as ImageIcon,
  MessageSquare, ExternalLink, Menu, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavGroup = {
  label: string
  items: { href: string; label: string; icon: React.ElementType; exact?: boolean }[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Tienda',
    items: [
      { href: '/admin',               label: 'Dashboard',  icon: LayoutDashboard, exact: true },
      { href: '/admin/pedidos',       label: 'Pedidos',    icon: ShoppingBag },
      { href: '/admin/productos',     label: 'Productos',  icon: Package },
      { href: '/admin/clientes',      label: 'Clientes',   icon: Users },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/cupones',    label: 'Cupones',    icon: Tag },
      { href: '/admin/giftcards', label: 'GiftCards',  icon: Gift },
      { href: '/admin/puntos',    label: 'Puntos',     icon: Star },
    ],
  },
  {
    label: 'Contenido',
    items: [
      { href: '/admin/cms',           label: 'Constructor visual', icon: ImageIcon },
      { href: '/admin/configuracion', label: 'Configuración',      icon: Settings2 },
      { href: '/admin/resenas',       label: 'Reseñas',            icon: MessageSquare },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { href: '/admin/analitica', label: 'Analítica', icon: BarChart3 },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'))
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Blobs decorativos */}
      <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-violet-300/40 pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-cyan-300/30 pointer-events-none" />

      {/* Logo */}
      <div className="relative px-4 py-4 border-b border-violet-200/60 flex items-center justify-between">
        <Link href="/" className="block group">
          <span className="font-cormorant text-xl">
            <span className="text-violet-800 font-medium">MariaCaro</span>
            <span className="text-cyan-500 font-light">Store</span>
          </span>
          <p className="text-[9px] uppercase tracking-[0.3em] text-violet-600/60 mt-0.5">
            Administración
          </p>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/"
            target="_blank"
            className="p-1 text-violet-600/40 hover:text-violet-700 transition-colors"
            title="Ver tienda"
          >
            <ExternalLink className="h-3 w-3" />
          </Link>
          {/* Close button — mobile only */}
          <button
            className="lg:hidden p-1 text-violet-600/60 hover:text-violet-800 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="relative flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[9px] uppercase tracking-[0.25em] text-violet-600/40 font-semibold">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, exact }) => {
                const active = isActive(href, exact)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                      active
                        ? 'bg-violet-200/60 text-violet-900 shadow-sm'
                        : 'text-violet-700 hover:bg-violet-200/40 hover:text-violet-900'
                    )}
                  >
                    <Icon className={cn('h-3.5 w-3.5 flex-shrink-0', active ? 'text-cyan-600' : 'text-violet-600')} />
                    <span className="text-sm">{label}</span>
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Verse */}
      <div className="relative px-4 py-3 border-t border-violet-200/50">
        <p className="text-[9px] italic text-violet-600/40 font-serif text-center leading-relaxed">
          &ldquo;Todo lo que hagan, háganlo de corazón.&rdquo;
          <span className="block not-italic tracking-widest uppercase text-violet-500/30 mt-0.5">Col. 3:23</span>
        </p>
      </div>

      {/* Sign out */}
      <div className="relative px-3 pb-4">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-violet-700 hover:bg-violet-200/40 hover:text-violet-900 transition-all duration-200"
        >
          <LogOut className="h-3.5 w-3.5 text-violet-600" />
          Cerrar sesión
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar (always visible ≥ lg) ── */}
      <aside className="hidden lg:flex w-56 bg-gradient-to-b from-violet-100 to-cyan-50 text-violet-900 flex-col flex-shrink-0 relative overflow-hidden min-h-screen">
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar (< lg) ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-violet-100 to-cyan-50 text-violet-900 flex items-center justify-between px-4 h-14 border-b border-violet-200/60">
        <Link href="/" className="font-cormorant text-xl">
          <span className="text-violet-800 font-medium">MariaCaro</span>
          <span className="text-cyan-500 font-light">Store</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/" target="_blank" className="p-1.5 text-violet-600/50 hover:text-violet-700 transition-colors">
            <ExternalLink className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="p-1.5 text-violet-700 hover:text-violet-900 transition-colors"
            aria-label="Menú administración"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-violet-100 to-cyan-50 text-violet-900 flex flex-col relative overflow-hidden transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
