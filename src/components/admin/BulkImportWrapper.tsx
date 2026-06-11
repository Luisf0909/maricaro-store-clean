'use client'

import { useRouter } from 'next/navigation'
import { BulkImportProducts } from './BulkImportProducts'

interface Props {
  categories: { id: string; name: string }[]
}

export function BulkImportWrapper({ categories }: Props) {
  const router = useRouter()
  return (
    <BulkImportProducts
      categories={categories}
      onComplete={() => router.push('/admin/productos')}
    />
  )
}
