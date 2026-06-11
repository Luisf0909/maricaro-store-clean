import Link from 'next/link'
import { BookOpen, CalendarDays, BookMarked, Download } from 'lucide-react'

const CATEGORIES = [
  {
    title:   'Devocionales',
    subtitle: 'Tiempo con Dios cada día',
    href:     '/productos?categoria=devocionales',
    icon:     BookOpen,
    gradient: 'from-pink-400 to-rose-500',
    shadow:   'shadow-pink-200',
    ring:     'ring-pink-100',
    glow:     'group-hover:shadow-pink-200/50',
  },
  {
    title:   'Planners',
    subtitle: 'Organiza con propósito',
    href:     '/productos?categoria=planners',
    icon:     CalendarDays,
    gradient: 'from-violet-400 to-purple-500',
    shadow:   'shadow-violet-200',
    ring:     'ring-violet-100',
    glow:     'group-hover:shadow-violet-200/50',
  },
  {
    title:   'Agendas',
    subtitle: 'Tu año con intención',
    href:     '/productos?categoria=agendas',
    icon:     BookMarked,
    gradient: 'from-yellow-300 to-amber-400',
    shadow:   'shadow-yellow-200',
    ring:     'ring-yellow-100',
    glow:     'group-hover:shadow-yellow-200/50',
  },
  {
    title:   'Digital',
    subtitle: 'Descarga instantánea',
    href:     '/productos?digital=true',
    icon:     Download,
    gradient: 'from-sky-300 to-blue-400',
    shadow:   'shadow-sky-200',
    ring:     'ring-sky-100',
    glow:     'group-hover:shadow-sky-200/50',
  },
]

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon
        return (
          <Link
            key={cat.title}
            href={cat.href}
            className={`group relative flex flex-col items-center text-center gap-3 p-5 md:p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${cat.glow}`}
          >
            {/* Icon circle */}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-md ${cat.shadow} group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="h-7 w-7 text-white drop-shadow-sm" />
            </div>

            {/* Text */}
            <div>
              <p className="font-semibold text-gray-800 text-sm group-hover:text-warm-700 transition-colors">
                {cat.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{cat.subtitle}</p>
            </div>

            {/* Very subtle hover tint */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${cat.gradient} transition-opacity duration-300 rounded-2xl pointer-events-none`} />
          </Link>
        )
      })}
    </div>
  )
}
