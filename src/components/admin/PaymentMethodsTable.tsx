'use client'

import { Trash2, Edit2, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types'

interface Props {
  methods: PaymentMethod[]
  onEdit: (method: PaymentMethod) => void
  onDelete: (method: PaymentMethod) => void
  isLoading?: boolean
}

const PROVIDER_ICONS = {
  transbank: '🏦',
  mercadopago: '💳',
  stripe: '⚡',
  paypal: '🅿️',
} as const

export function PaymentMethodsTable({ methods, onEdit, onDelete, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-rose-600 rounded-full animate-spin" />
        <p className="mt-2 text-sm text-gray-600">Cargando métodos de pago...</p>
      </div>
    )
  }

  if (methods.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-2">💳</div>
        <p className="text-gray-600 font-medium">Sin métodos de pago configurados</p>
        <p className="text-gray-500 text-sm mt-1">Crea tu primer método de pago para comenzar a recibir pagos</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Desktop view */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Método</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Proveedor</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Ambiente</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {methods.map(method => (
              <tr key={method.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{method.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">ID: {method.id.slice(0, 8)}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {PROVIDER_ICONS[method.provider as keyof typeof PROVIDER_ICONS]}
                    </span>
                    <span className="text-sm text-gray-700 capitalize">{method.provider}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                      method.is_production
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    )}
                  >
                    <AlertCircle className="h-3 w-3" />
                    {method.is_production ? 'Producción' : 'Prueba'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {method.is_active ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      <Check className="h-3 w-3" />
                      Activo
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
                      Inactivo
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(method)}
                      className="p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(method)}
                      className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden divide-y divide-gray-200">
        {methods.map(method => (
          <div key={method.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{method.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {PROVIDER_ICONS[method.provider as keyof typeof PROVIDER_ICONS]} {method.provider}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onEdit(method)}
                  className="p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(method)}
                  className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 text-xs">
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full',
                  method.is_production
                    ? 'bg-red-50 text-red-700'
                    : 'bg-blue-50 text-blue-700'
                )}
              >
                <AlertCircle className="h-3 w-3" />
                {method.is_production ? 'Producción' : 'Prueba'}
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full',
                  method.is_active
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {method.is_active ? (
                  <>
                    <Check className="h-3 w-3" />
                    Activo
                  </>
                ) : (
                  'Inactivo'
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
