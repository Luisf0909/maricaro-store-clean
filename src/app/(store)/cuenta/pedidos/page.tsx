import { createClient } from '@/lib/supabase/server'
import { formatCLP } from '@/lib/utils'
import Link from 'next/link'

export const metadata = { title: 'Mis pedidos' }

export default async function MisPedidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, total, created_at, payment_status')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente', confirmed: 'Confirmado',
    processing: 'En proceso', shipped: 'Enviado',
    delivered: 'Entregado', cancelled: 'Cancelado',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl text-warm-900 mb-8">Mis pedidos</h1>

      {!orders?.length ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Aún no tienes pedidos.</p>
          <Link href="/productos" className="text-warm-700 underline">Ver productos</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/cuenta/pedidos/${order.id}`}
              className="block bg-white rounded-xl border border-cream-200 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm font-medium text-warm-700">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('es-CL', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-warm-800">{formatCLP(order.total)}</p>
                  <span className="text-xs text-muted-foreground">
                    {statusLabels[order.status] ?? order.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
