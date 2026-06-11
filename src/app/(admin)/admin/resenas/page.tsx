import { createAdminClient } from '@/lib/supabase/admin'
import { ReviewModerationList } from '@/components/admin/ReviewModerationList'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Reseñas | Admin' }

export default async function AdminResenasPage() {
  const admin = createAdminClient()

  const { data: reviews } = await admin
    .from('product_reviews')
    .select(`
      *,
      profiles(full_name),
      products(name, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  const pending   = (reviews ?? []).filter(r => r.status === 'pending')
  const approved  = (reviews ?? []).filter(r => r.status === 'approved')
  const rejected  = (reviews ?? []).filter(r => r.status === 'rejected')

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reseñas de productos</h1>
        <p className="text-sm text-gray-400 mt-0.5">Modera las reseñas antes de publicarlas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pendientes', count: pending.length,  color: 'amber' },
          { label: 'Aprobadas',  count: approved.length, color: 'emerald' },
          { label: 'Rechazadas', count: rejected.length, color: 'red' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl border border-gray-100 p-4 text-center`}>
            <p className={`text-2xl font-bold text-${s.color}-600`}>{s.count}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      <ReviewModerationList reviews={reviews ?? []} />
    </div>
  )
}
