import { createAdminClient } from '@/lib/supabase/admin'
import { ProductForm } from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin — Nuevo producto' }

export default async function NuevoProductoPage() {
  const admin = createAdminClient()
  const { data: categories } = await admin
    .from('categories')
    .select('id, name, slug, description, image_url, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/productos" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nuevo producto</h1>
      </div>
      <ProductForm categories={categories ?? []} />
    </div>
  )
}
