'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface AdminNavLinkProps {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

export function AdminNavLink({ href, label, icon: Icon, exact = false }: AdminNavLinkProps) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
        isActive
          ? 'bg-warm-700/60 text-cream-100 shadow-sm'
          : 'text-cream-400 hover:bg-warm-700/40 hover:text-cream-200'
      )}
    >
      <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-gold-400' : 'text-cream-500')} />
      <span>{label}</span>
      {isActive && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold-400 flex-shrink-0" />
      )}
    </Link>
  )
}
