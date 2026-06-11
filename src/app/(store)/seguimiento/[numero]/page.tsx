import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { formatCLP } from '@/lib/utils'
import { CheckCircle2, Package, Truck, Home, XCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props { params: { numero: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Pedido ${params.numero} | Maria Caro Store` }
}

const STEPS = [
  { key: 'pending',    label: 'Pedido recibido',    icon: AlertCircle },
  { key: 'confirmed',  label: 'Pago confirmado',    icon: CheckCircle2 },
  { key: 'processing', label: 'En preparación',      icon: Package },
  { key: 'shipped',    label: 'Enviado',             icon: Truck },
  { key: 'delivered',  label: 'Entregado',           icon: Home },
]

const STATUS_ORDER: Record<string, number> = {
  pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4,
}

export default async function SeguimientoPage({ params }: Props) {
  const admin = createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select(`
      *,
      order_items(*),
      order_status_history(*)
    `)
    .eq('order_number', params.numero.toUpperCase())
    .single()

  if (!order) notFound()

  const currentStep = STATUS_ORDER[order.status] ?? 0
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded'

  const history = (order.order_status_history ?? [])
    .sort((a: { created_at: string }, b: { created_at: string }) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

  const statusLabels: Record<string, string> = {
    pending:    'Pendiente de pago',
    confirmed:  'Pago confirmado',
    processing: 'En preparación',
    shipped:    'Enviado',
    delivered:  'Entregado',
    cancelled:  'Cancelado',
    refunded:   'Reembolsado',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-warm-600 font-semibold uppercase tracking-wider mb-2">Seguimiento de pedido</p>
        <h1 className="font-cormorant font-light text-3xl text-gray-900">{order.order_number}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Realizado el {new Date(order.created_at).toLocaleDateString('es-CL', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      {/* Status tracker */}
      {!isCancelled ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-warm-500 transition-all duration-500"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />

            <div className="relative flex justify-between">
              {STEPS.map((step, idx) => {
                const done   = idx <= currentStep
                const active = idx === currentStep
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 w-16">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10',
                      done
                        ? 'bg-warm-700 border-warm-700 text-white'
                        : 'bg-white border-gray-200 text-gray-300'
                    )}>
                      <step.icon className="h-4 w-4" />
                    </div>
                    <p className={cn(
                      'text-[10px] text-center leading-tight',
                      active ? 'text-warm-700 font-semibold' : done ? 'text-gray-600' : 'text-gray-300'
                    )}>
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tracking info */}
          {order.tracking_code && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-1">Código de seguimiento</p>
              <p className="font-mono text-sm font-bold text-blue-900">{order.tracking_code}</p>
              {order.carrier && <p className="text-xs text-blue-500 mt-0.5">{order.carrier}</p>}
              {order.tracking_url && (
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-blue-600 underline hover:text-blue-800"
                >
                  Rastrear envío →
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-6 flex items-center gap-4">
          <XCircle className="h-8 w-8 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-700">{statusLabels[order.status]}</p>
            <p className="text-sm text-red-500 mt-0.5">
              {order.status === 'refunded'
                ? 'El reembolso está siendo procesado.'
                : 'Este pedido fue cancelado.'}
            </p>
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h2 className="font-semibold text-sm text-gray-900 mb-4">Productos del pedido</h2>
        <div className="space-y-3">
          {order.order_items?.map((item: {
            id: string; product_name: string; variant_name?: string
            quantity: number; unit_price: number; subtotal: number
            product_image_url?: string
          }) => (
            <div key={item.id} className="flex items-center gap-3">
              {item.product_image_url && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  <Image src={item.product_image_url} alt={item.product_name} fill className="object-cover" sizes="48px" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.product_name}</p>
                {item.variant_name && (
                  <p className="text-xs text-gray-400">{item.variant_name}</p>
                )}
                <p className="text-xs text-gray-400">Cant: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-gray-800 flex-shrink-0">{formatCLP(item.subtotal)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-4 pt-3 space-y-1.5 text-sm">
          {order.shipping_cost > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Envío</span><span>{formatCLP(order.shipping_cost)}</span>
            </div>
          )}
          {order.coupon_discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Cupón {order.coupon_code}</span>
              <span>-{formatCLP(order.coupon_discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-1">
            <span>Total</span>
            <span className="text-warm-800">{formatCLP(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      {!order.order_items?.every((i: { product_id: string | null }) => !i.product_id) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 text-sm">
          <h2 className="font-semibold text-gray-900 mb-3">Dirección de envío</h2>
          <p className="text-gray-700 font-medium">{order.shipping_full_name}</p>
          <p className="text-gray-500">{order.shipping_address}{order.shipping_apartment ? `, ${order.shipping_apartment}` : ''}</p>
          <p className="text-gray-500">{order.shipping_city}, {order.shipping_region}</p>
          {order.shipping_phone && <p className="text-gray-500">{order.shipping_phone}</p>}
        </div>
      )}

      {/* Status history */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-sm text-gray-900 mb-4">Historial del pedido</h2>
          <div className="space-y-3">
            {history.map((h: {
              id: string; new_status: string; comment?: string; created_at: string
            }) => (
              <div key={h.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-warm-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {statusLabels[h.new_status] ?? h.new_status}
                  </p>
                  {h.comment && <p className="text-xs text-gray-500 mt-0.5">{h.comment}</p>}
                  <p className="text-[10px] text-gray-300 mt-0.5">
                    {new Date(h.created_at).toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/productos" className="text-sm text-warm-600 hover:text-warm-800 underline underline-offset-2">
          ← Seguir comprando
        </Link>
      </div>
    </div>
  )
}
