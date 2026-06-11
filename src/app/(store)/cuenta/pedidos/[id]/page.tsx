import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCLP } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props { params: { id: string } }

export default async function PedidoDetailPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single()

  if (!order) notFound()

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente', confirmed: 'Confirmado',
    processing: 'En proceso', shipped: 'Enviado',
    delivered: 'Entregado', cancelled: 'Cancelado',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/cuenta/pedidos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-warm-700 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Volver a mis pedidos
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-mono text-xl font-bold text-warm-900">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span className="text-sm px-3 py-1 rounded-full bg-cream-100 text-warm-800">
          {statusLabels[order.status] ?? order.status}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-cream-200 p-5 space-y-4 mb-4">
        <h2 className="font-serif text-lg text-warm-900">Productos</h2>
        <ul className="divide-y divide-cream-100 text-sm">
          {order.order_items?.map((item: { id: string; product_name: string; variant_name?: string; quantity: number; subtotal: number }) => (
            <li key={item.id} className="flex justify-between py-3">
              <span className="text-foreground/70">{item.product_name} × {item.quantity}</span>
              <span className="font-medium">{formatCLP(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-cream-200 pt-3 text-sm space-y-1">
          <div className="flex justify-between text-foreground/60">
            <span>Envío</span><span>{order.shipping_cost === 0 ? 'Gratis' : formatCLP(order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between font-bold text-base">
            <span>Total</span><span className="text-warm-800">{formatCLP(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-cream-200 p-5 text-sm text-muted-foreground">
        <h2 className="font-serif text-lg text-warm-900 mb-2">Envío</h2>
        <p>{order.shipping_full_name}</p>
        <p>{order.shipping_address}{order.shipping_apartment ? `, ${order.shipping_apartment}` : ''}</p>
        <p>{order.shipping_city}, {order.shipping_region}</p>
      </div>
    </div>
  )
}
