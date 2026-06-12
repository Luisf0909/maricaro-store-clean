'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Loader } from 'lucide-react'
import type { CartItem } from '@/types'

interface Props {
  orderId: string
  items: CartItem[]
  userEmail: string
  userName?: string | null
  userPhone?: string | null
  userRut?: string | null
  isProduction?: boolean
  onPaymentInitiated?: () => void
}

interface MercadoPagoInstance {
  checkout: (options: Record<string, unknown>) => void
}

declare global {
  interface Window {
    MercadoPago?: (publicKey: string, options: Record<string, unknown>) => MercadoPagoInstance
  }
}

export function MercadoPagoCheckout({
  orderId,
  items,
  userEmail,
  userName,
  userPhone,
  userRut,
  isProduction = false,
  onPaymentInitiated,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMercadoPago()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, userEmail])

  async function loadMercadoPago() {
    try {
      // Cargar script de Mercado Pago
      const script = document.createElement('script')
      script.src = 'https://sdk.mercadopago.com/js/v2'
      script.async = true
      document.body.appendChild(script)

      script.onload = async () => {
        // Crear preferencia
        const res = await fetch('/api/pagos/mercadopago/preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            items: items.map(item => ({
              product_id: item.productId,
              product_name: item.name,
              variant_name: item.variantName,
              quantity: item.quantity,
              unit_price: item.price,
            })),
            userEmail,
            userName,
            userPhone,
            userRut,
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Error creando preferencia')
        }

        const pref = await res.json()

        // Inicializar Checkout Pro
        const mp = new window.MercadoPago(pref.public_key, {
          locale: 'es-CL',
        })

        const initPoint = isProduction ? pref.init_point : pref.sandbox_init_point
        if (!initPoint) throw new Error('No se pudo obtener enlace de pago')

        mp.checkout({
          preference: {
            id: pref.id,
          },
          render: {
            container: '#mp-checkout-container',
            label: 'Pagar',
          },
          autoOpen: false,
        })

        onPaymentInitiated?.()
        setLoading(false)
      }

      script.onerror = () => {
        setError('Error cargando Mercado Pago')
        setLoading(false)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      setLoading(false)
      toast.error(message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="h-5 w-5 animate-spin text-rose-600" />
        <span className="ml-2 text-gray-600">Inicializando Mercado Pago...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-semibold">Error al cargar el pago</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full">
      <div id="mp-checkout-container" className="w-full" />
    </div>
  )
}
