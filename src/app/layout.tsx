import type { Metadata } from 'next'
import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: { default: 'MariaCaroStore.cl', template: '%s | MariaCaroStore.cl' },
  description:
    'Cuadernos devocionales, planners y agendas de inspiración cristiana hechos con amor en Chile.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://maricarostore.cl'),
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: 'MariaCaroStore.cl',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
