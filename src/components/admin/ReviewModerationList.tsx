'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, XCircle, Star, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

interface Review {
  id: string
  product_id: string
  status: 'pending' | 'approved' | 'rejected'
  rating: number
  title: string | null
  body: string | null
  is_verified: boolean
  guest_name: string | null
  created_at: string
  profiles?: { full_name: string | null } | null
  products?: { name: string; slug: string } | null
}

interface Props {
  reviews: Review[]
}

const STATUS_TABS = ['pending', 'approved', 'rejected'] as const
const STATUS_LABELS: Record<string, string> = {
  pending:  'Pendientes',
  approved: 'Aprobadas',
  rejected: 'Rechazadas',
}

export function ReviewModerationList({ reviews: initialReviews }: Props) {
  const [reviews, setReviews] = useState(initialReviews)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [isPending, startTransition] = useTransition()

  function moderate(id: string, status: 'approved' | 'rejected') {
    setReviews(rs => rs.map(r => r.id === id ? { ...r, status } : r))
    startTransition(async () => {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        setReviews(rs => rs.map(r => r.id === id ? { ...r, status: 'pending' } : r))
        toast.error('Error al moderar reseña')
      } else {
        toast.success(status === 'approved' ? 'Reseña aprobada' : 'Reseña rechazada')
      }
    })
  }

  const filtered = reviews.filter(r => r.status === activeTab)

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100 mb-6">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab
                ? 'border-warm-600 text-warm-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            )}
          >
            {STATUS_LABELS[tab]}{' '}
            <span className="text-xs">({reviews.filter(r => r.status === tab).length})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-12 text-sm text-gray-400">No hay reseñas {STATUS_LABELS[activeTab].toLowerCase()}</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(review => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {/* Product */}
                  <div className="flex items-center gap-2 mb-3">
                    {review.products && (
                      <Link
                        href={`/producto/${review.products.slug}`}
                        target="_blank"
                        className="text-xs font-semibold text-warm-700 hover:underline flex items-center gap-1"
                      >
                        {review.products.name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                    {review.is_verified && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                        Verificada
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={cn('h-3.5 w-3.5', n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200')} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {review.profiles?.full_name ?? review.guest_name ?? 'Anónimo'}
                    </span>
                    <span className="text-[10px] text-gray-300">·</span>
                    <time className="text-[10px] text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('es-CL')}
                    </time>
                  </div>

                  {review.title && (
                    <p className="font-semibold text-sm text-gray-800 mb-1">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
                  )}
                </div>

                {/* Actions */}
                {activeTab === 'pending' && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => moderate(review.id, 'approved')}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Aprobar
                    </button>
                    <button
                      onClick={() => moderate(review.id, 'rejected')}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-60"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Rechazar
                    </button>
                  </div>
                )}
                {activeTab !== 'pending' && (
                  <button
                    onClick={() => moderate(review.id, activeTab === 'approved' ? 'rejected' : 'approved')}
                    disabled={isPending}
                    className="flex-shrink-0 text-xs text-gray-400 hover:text-warm-600 underline transition-colors"
                  >
                    {activeTab === 'approved' ? 'Rechazar' : 'Aprobar'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
