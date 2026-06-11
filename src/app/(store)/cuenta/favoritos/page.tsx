import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { ProductCard } from '@/components/store/ProductCard'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Favoritos | Maria Caro Store' }

export default async function FavoritosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cuenta/login?redirect=/cuenta/favoritos')

  const admin = createAdminClient()
  const { data: wishlistItems } = await admin
    .from('wishlists')
    .select(`
      id, created_at,
      products(
        *,
        product_images(*),
        categories(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = (wishlistItems ?? [])
    .map(item => item.products as unknown as Record<string, unknown> | null)
    .filter((p): p is Record<string, unknown> => p !== null)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-5 w-5 text-pink-500" />
        <div>
          <h1 className="font-cormorant font-light text-3xl text-gray-900">Mis favoritos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.length} {products.length === 1 ? 'producto guardado' : 'productos guardados'}
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart className="h-12 w-12 text-gray-200 mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">Tu lista de favoritos está vacía</h3>
          <p className="text-sm text-gray-400 mb-6">
            Guarda los productos que te interesan con el ícono ♥ en cada producto.
          </p>
          <Link
            href="/productos"
            className="px-5 py-2 bg-warm-700 text-white text-sm font-medium rounded-lg hover:bg-warm-800 transition-colors"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <ProductCard key={(product as any).id} product={product as any} />
          ))}
        </div>
      )}
    </div>
  )
}
