import { createClient } from '@/lib/supabase/server'
import { CheckoutForm } from '@/components/store/CheckoutForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: regions } = await supabase
    .from('chile_regions')
    .select('id, name, code')
    .order('id')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-cormorant font-light text-3xl text-warm-900">Finalizar compra</h1>
        <p className="text-sm text-muted-foreground mt-1">Completa tu pedido de forma segura</p>
      </div>
      <CheckoutForm
        regions={regions ?? []}
        isGuest={!user}
        userEmail={user?.email ?? null}
      />
    </div>
  )
}
