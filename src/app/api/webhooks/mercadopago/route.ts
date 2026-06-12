import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MercadopagoClient } from 'mercadopago'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Mercado Pago envía notificaciones con topic y resource
    if (body.topic === 'payment' || body.type === 'payment') {
      const paymentId = body.data?.id || body.resource?.id?.split('/').pop()

      if (!paymentId) {
        return NextResponse.json({ received: true })
      }

      // Obtener método de pago para verificar
      const admin = createAdminClient()
      const { data: paymentMethod } = await admin
        .from('payment_methods')
        .select('*')
        .eq('provider', 'mercadopago')
        .eq('is_active', true)
        .single()

      if (!paymentMethod?.config?.access_token) {
        console.error('Mercado Pago no configurado para webhook')
        return NextResponse.json({ received: true })
      }

      // Consultar detalles del pago con el SDK
      const client = new MercadopagoClient({
        accessToken: paymentMethod.config.access_token as string,
      })

      const payment = await client.paymentClient.get({
        id: paymentId,
      })

      if (!payment || !payment.external_reference) {
        console.warn('Pago sin referencia externa:', paymentId)
        return NextResponse.json({ received: true })
      }

      // Mapear estado de Mercado Pago a nuestros estados
      const statusMap: Record<string, string> = {
        'approved': 'paid',
        'pending': 'pending',
        'rejected': 'failed',
        'cancelled': 'failed',
        'refunded': 'refunded',
        'charged_back': 'failed',
      }

      const orderStatus = statusMap[payment.status] || 'failed'

      // Actualizar orden en la BD
      const { error: updateError } = await admin
        .from('orders')
        .update({
          payment_status: orderStatus,
          payment_method: 'mercadopago',
          payment_id: paymentId.toString(),
          paid_at: orderStatus === 'paid' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.external_reference)

      if (updateError) {
        console.error('Error actualizando orden:', updateError)
      } else {
        console.log(`Pago ${paymentId} procesado. Orden: ${payment.external_reference}, Estado: ${orderStatus}`)
      }

      // Actualizar status history
      if (orderStatus !== 'pending') {
        await admin
          .from('order_status_history')
          .insert({
            order_id: payment.external_reference,
            previous_payment_status: 'pending',
            new_payment_status: orderStatus,
            comment: `Pago ${orderStatus === 'paid' ? 'confirmado' : 'rechazado'} por Mercado Pago`,
            customer_notified: false,
          })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    console.error('Error en webhook Mercado Pago:', err)
    return NextResponse.json({ received: true })
  }
}

export async function GET() {
  // Mercado Pago verifica que el endpoint existe con GET
  return NextResponse.json({ status: 'ok' })
}
