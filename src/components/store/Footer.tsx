import Link from 'next/link'
import { Instagram, Mail, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-warm-900 text-white mt-0 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full border-2 border-white" />
        <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full border border-white" />
      </div>

      <div className="aqua-divider opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Marca — 5 cols */}
          <div className="md:col-span-5 space-y-5">
            <div>
              <span className="font-cormorant text-3xl">
                <span className="text-white font-medium">MariaCaro</span>
                <span className="text-warm-300 font-light">Store</span>
              </span>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mt-1">
                Papelería cristiana con propósito
              </p>
            </div>
            <p className="text-sm text-white/65 leading-relaxed max-w-xs font-light">
              Productos hechos con amor para edificar tu fe, organizar tus días y vivir con propósito. Desde Chile, para el mundo.
            </p>
            <div className="flex flex-col gap-2.5">
              <a href="https://instagram.com/mariacarostore.cl" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors group">
                <Instagram className="h-4 w-4 group-hover:text-warm-300 transition-colors" />
                @mariacarostore.cl
              </a>
              <a href="mailto:hola@maricarostore.cl"
                className="inline-flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors group">
                <Mail className="h-4 w-4 group-hover:text-warm-300 transition-colors" />
                hola@maricarostore.cl
              </a>
            </div>
          </div>

          <div className="hidden md:block md:col-span-1" />

          {/* Tienda — 3 cols */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-[10px] font-semibold text-white uppercase tracking-[0.3em]">Tienda</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/productos', label: 'Todos los productos' },
                { href: '/productos?categoria=devocionales', label: 'Devocionales' },
                { href: '/productos?categoria=planners', label: 'Planners' },
                { href: '/productos?categoria=agendas', label: 'Agendas' },
                { href: '/productos?digital=true', label: 'Descargas digitales' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/55 hover:text-white transition-colors font-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda — 3 cols */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-[10px] font-semibold text-white uppercase tracking-[0.3em]">Ayuda</h3>
            <ul className="space-y-2.5">
              <li><Link href="/cuenta/pedidos" className="text-sm text-white/55 hover:text-white transition-colors font-light">Mis pedidos</Link></li>
              <li><a href="mailto:hola@maricarostore.cl" className="text-sm text-white/55 hover:text-white transition-colors font-light">Contacto</a></li>
              <li><Link href="/checkout" className="text-sm text-white/55 hover:text-white transition-colors font-light">Finalizar compra</Link></li>
            </ul>
            <blockquote className="pt-4 border-l border-warm-600/50 pl-3">
              <p className="text-xs italic text-white/40 font-serif leading-relaxed">
                &ldquo;Todo lo puedo en Cristo que me fortalece.&rdquo;
              </p>
              <cite className="text-[10px] text-white/30 mt-1 block not-italic tracking-widest">— Filipenses 4:13</cite>
            </blockquote>
          </div>
        </div>

        <div className="aqua-divider opacity-20 mb-6" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-white/30">
          <p>© {new Date().getFullYear()} MariaCaroStore.cl — Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">Hecho con <Heart className="h-3 w-3 text-petal-400 fill-petal-400" /> en Chile</p>
        </div>
      </div>
    </footer>
  )
}
