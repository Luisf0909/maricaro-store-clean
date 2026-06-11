import { createAdminClient } from '@/lib/supabase/admin'
import { CouponForm } from '@/components/admin/CouponForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { Coupon } from '@/types'

export const dynamic = 'force-dynamic'

interface Props { params: { id: string } }

export default async function EditarCuponPage({ params }: Props) {
  const admin = createAdminClient()
  const { data: coupon } = await admin.from('coupons').select('*').eq('id', params.id).single()
  if (!coupon) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/cupones" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Editar cupón: <span className="font-mono">{coupon.code}</span></h1>
      </div>
      <CouponForm coupon={coupon as unknown as Coupon} />
    </div>
  )
}
