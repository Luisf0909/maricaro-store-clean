import { createAdminClient } from '@/lib/supabase/admin'
import { BulkImportWrapper } from '@/components/admin/BulkImportWrapper'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin — Importar productos' }

export default async function ImportarProductosPage() {
  const admin = createAdminClient()
  const { data: categories } = await admin
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/productos" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Importar productos</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <BulkImportWrapper categories={categories ?? []} />
      </div>
    </div>
  )
}
