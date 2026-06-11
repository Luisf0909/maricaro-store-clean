import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { formatCLP } from '@/lib/utils'
import Link from 'next/link'
import { CheckCircle, Clock, XCircle, Download, FileText } from 'lucide-react'

export const dynamic  = 'force-dynamic'
export const metadata = { title: 'Confirmación de pedido' }

interface Props {
  params: { orderId: string }
}

export default async function ConfirmacionPage({ params }: Props) {
  const supabase = await createClient()
  const admin    = createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.orderId)
    .single()

  if (!order) notFound()

  // Fetch download tokens for this order (admin bypasses RLS for guest orders)
  const { data: downloadTokens } = await admin
    .from('order_download_tokens')
    .select('*, products(name, digital_file_name)')
    .eq('order_id', params.orderId)

  const statusConfig = {
    paid: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50 border-green-100',
      title: '¡Pedido confirmado!',
      message: 'Tu pago fue procesado exitosamente. Recibirás un correo de confirmación.',
    },
    pending: {
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 border-yellow-100',
      title: 'Pago pendiente',
      message: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
    },
    failed: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-100',
      title: 'Pago no procesado',
      message: 'Hubo un problema con tu pago. Puedes intentarlo nuevamente.',
    },
  }

  const config = statusConfig[order.payment_status as keyof typeof statusConfig] ?? statusConfig.pending
  const Icon   = config.icon
  const isPaid = order.payment_status === 'paid'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Status banner */}
      <div className={`${config.bg} border rounded-2xl p-8 text-center mb-8`}>
        <Icon className={`h-14 w-14 mx-auto mb-4 ${config.color}`} />
        <h1 className="font-cormorant text-3xl text-warm-900 mb-2">{config.title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{config.message}</p>
        <p className="mt-3 text-sm font-mono font-medium text-warm-700">{order.order_number}</p>
      </div>

      {/* Digital downloads */}
      {isPaid && downloadTokens && downloadTokens.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <Download className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-blue-800">Tus descargas digitales</h2>
          </div>
          <p className="text-sm text-blue-600/80 mb-4">
            Los enlaces de descarga son válidos por 72 horas y permiten hasta 5 descargas cada uno.
          </p>
          <div className="space-y-3">
            {downloadTokens.map((token) => {
              const prod = token.products as { name?: string; digital_file_name?: string | null } | null
              return (
                <div key={token.id} className="flex items-center gap-3 bg-white rounded-xl p-3.5 border border-blue-100">
                  <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{prod?.name ?? 'Producto digital'}</p>
                    <p className="text-xs text-gray-400 truncate">{prod?.digital_file_name ?? 'Archivo digital'}</p>
                  </div>
                  <a
                    href={`/api/downloads/${token.token}`}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Download className="h-3 w-3" />
                    Descargar
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Order summary */}
      <div className="bg-white rounded-2xl border border-cream-200 p-6 space-y-4">
        <h2 className="font-cormorant text-xl text-warm-900">Resumen del pedido</h2>

        <ul className="divide-y divide-cream-100 text-sm">
          {order.order_items?.map((item: {
            id: string; product_name: string; variant_name?: string; quantity: number; subtotal: number
          }) => (
            <li key={item.id} className="flex justify-between py-3">
              <span className="text-foreground/70">
                {item.product_name}
                {item.variant_name && <span className="text-xs"> ({item.variant_name})</span>}
                <span className="ml-1">× {item.quantity}</span>
              </span>
              <span className="font-medium">{formatCLP(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-cream-200 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-foreground/70">
            <span>Envío</span>
            <span>{order.shipping_cost === 0 ? 'Gratis' : formatCLP(order.shipping_cost)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Descuento</span>
              <span>- {formatCLP(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-warm-800">{formatCLP(order.total)}</span>
          </div>
        </div>

        {order.shipping_cost > 0 && (
          <div className="border-t border-cream-200 pt-4 text-sm text-muted-foreground">
            <p><strong>Envío a:</strong> {order.shipping_address}, {order.shipping_city}, {order.shipping_region}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/cuenta/pedidos"
          className="text-center border border-warm-300 hover:bg-cream-100 text-warm-800 font-medium px-6 py-2.5 rounded-full transition-colors text-sm"
        >
          Ver mis pedidos
        </Link>
        <Link
          href="/productos"
          className="text-center bg-warm-700 hover:bg-warm-800 text-cream-50 font-semibold px-6 py-2.5 rounded-full transition-colors text-sm"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
