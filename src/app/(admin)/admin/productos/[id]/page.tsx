import { createAdminClient } from '@/lib/supabase/admin'
import { ProductForm } from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { ProductWithImages, Category } from '@/types'

export const dynamic = 'force-dynamic'

interface Props { params: { id: string } }

export default async function EditarProductoPage({ params }: Props) {
  const admin = createAdminClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    admin
      .from('products')
      .select('*, product_images(*), categories(*)')
      .eq('id', params.id)
      .single(),
    admin
      .from('categories')
      .select('id, name, slug, description, image_url, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order'),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/productos" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Editar: {product.name}</h1>
      </div>
      <ProductForm product={product as unknown as ProductWithImages} categories={(categories ?? []) as unknown as Category[]} />
    </div>
  )
}
