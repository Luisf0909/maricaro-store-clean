import { CouponForm } from '@/components/admin/CouponForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = { title: 'Admin — Nuevo cupón' }

export default function NuevoCuponPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/cupones" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nuevo cupón</h1>
      </div>
      <CouponForm />
    </div>
  )
}
