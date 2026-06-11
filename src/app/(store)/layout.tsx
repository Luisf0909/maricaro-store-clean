import { Navbar } from '@/components/store/Navbar'
import { Footer } from '@/components/store/Footer'
import { CartDrawer } from '@/components/store/CartDrawer'
import { WelcomeOverlay } from '@/components/store/WelcomeOverlay'
import { createClient } from '@/lib/supabase/server'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={!!user} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <WelcomeOverlay />
    </div>
  )
}
