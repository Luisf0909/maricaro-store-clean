'use client'

import { useState, useTransition } from 'react'
import { Star, ThumbsUp, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { ProductReview, ProductRatingSummary } from '@/types'

interface Props {
  productId: string
  reviews: ProductReview[]
  summary: ProductRatingSummary | null
  isLoggedIn: boolean
  canReview?: boolean  // comprador verificado
}

function StarRating({ rating, interactive = false, onChange }: {
  rating: number
  interactive?: boolean
  onChange?: (r: number) => void
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          className={cn('transition-colors', interactive && 'cursor-pointer')}
        >
          <Star
            className={cn(
              'h-4 w-4',
              n <= (interactive ? (hover || rating) : rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-200 fill-gray-200'
            )}
          />
        </button>
      ))}
    </div>
  )
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-14 text-gray-500 text-right">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-gray-400 text-left">{count}</span>
    </div>
  )
}

export function ProductReviews({ productId, reviews, summary, isLoggedIn, canReview }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()

  function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoggedIn) { toast.error('Debes iniciar sesión para reseñar'); return }
    startTransition(async () => {
      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, rating, title, body }),
        })
        if (!res.ok) throw new Error((await res.json()).error ?? 'Error')
        toast.success('Reseña enviada. Está en revisión.')
        setShowForm(false)
        setTitle(''); setBody(''); setRating(5)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al enviar reseña'
        toast.error(msg)
      }
    })
  }

  const total = summary?.review_count ?? 0

  return (
    <section className="mt-16 border-t border-gray-100 pt-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-warm-600" />
          <h2 className="text-xl font-semibold text-gray-900">Reseñas</h2>
          {total > 0 && (
            <span className="text-sm text-gray-400">({total})</span>
          )}
        </div>
        {(isLoggedIn || canReview) && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-warm-700 hover:text-warm-900 underline underline-offset-2 transition-colors"
          >
            Escribir reseña
          </button>
        )}
      </div>

      {/* Rating summary */}
      {summary && total > 0 && (
        <div className="flex flex-col sm:flex-row gap-8 mb-10 p-6 bg-gray-50 rounded-2xl">
          <div className="flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-5xl font-bold text-gray-900">{summary.avg_rating}</span>
            <StarRating rating={Math.round(summary.avg_rating)} />
            <span className="text-xs text-gray-400 mt-1">{total} {total === 1 ? 'reseña' : 'reseñas'}</span>
          </div>
          <div className="flex-1 space-y-1.5">
            <RatingBar label="5 ⭐"  count={summary.five_star}  total={total} />
            <RatingBar label="4 ⭐"  count={summary.four_star}  total={total} />
            <RatingBar label="3 ⭐"  count={summary.three_star} total={total} />
            <RatingBar label="2 ⭐"  count={summary.two_star}   total={total} />
            <RatingBar label="1 ⭐"  count={summary.one_star}   total={total} />
          </div>
        </div>
      )}

      {/* Write review form */}
      {showForm && (
        <form onSubmit={submitReview} className="mb-8 p-6 border border-warm-200 rounded-2xl bg-warm-50/30 space-y-4">
          <h3 className="font-semibold text-gray-800">Tu reseña</h3>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Calificación</label>
            <StarRating rating={rating} interactive onChange={setRating} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Título (opcional)</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Resumen en pocas palabras"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Comentario</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Cuéntanos tu experiencia con este producto..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400 bg-white resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-warm-700 text-white text-sm font-medium rounded-lg hover:bg-warm-800 disabled:opacity-60 transition-colors"
            >
              {isPending ? 'Enviando…' : 'Enviar reseña'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
          <p className="text-xs text-gray-400">Las reseñas son revisadas antes de publicarse.</p>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <Star className="h-8 w-8 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Aún no hay reseñas para este producto.</p>
          {isLoggedIn && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm text-warm-600 underline underline-offset-2"
            >
              ¡Sé el primero en reseñar!
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map(review => (
            <article key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} />
                    {review.is_verified && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        Compra verificada
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-sm text-gray-800">
                    {review.profiles?.full_name ?? review.guest_name ?? 'Cliente'}
                  </p>
                </div>
                <time className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' })}
                </time>
              </div>
              {review.title && (
                <p className="font-medium text-gray-800 text-sm mb-1">{review.title}</p>
              )}
              {review.body && (
                <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
              )}
              {review.helpful_votes > 0 && (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {review.helpful_votes} {review.helpful_votes === 1 ? 'persona encontró esto útil' : 'personas encontraron esto útil'}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
