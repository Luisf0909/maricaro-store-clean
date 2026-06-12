'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, AlertCircle } from 'lucide-react'
import { PaymentMethodForm } from '@/components/admin/PaymentMethodForm'
import { PaymentMethodsTable } from '@/components/admin/PaymentMethodsTable'
import type { PaymentMethod } from '@/types'

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchMethods()
  }, [])

  async function fetchMethods() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/payment-methods')
      if (!res.ok) throw new Error('Error al cargar métodos')
      const data = await res.json()
      setMethods(data || [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(method: PaymentMethod) {
    setShowForm(false)
    setEditingMethod(null)
    await fetchMethods()
  }

  async function handleDelete(method: PaymentMethod) {
    if (!confirm(`¿Eliminar "${method.name}"? Esta acción no se puede deshacer.`)) return

    try {
      const res = await fetch(`/api/admin/payment-methods/${method.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Error al eliminar')
      toast.success('Método eliminado')
      await fetchMethods()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  function handleEdit(method: PaymentMethod) {
    setEditingMethod(method)
    setShowForm(true)
  }

  function handleCreateNew() {
    setEditingMethod(null)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Métodos de Pago</h1>
        <p className="text-gray-600 mt-1">Configura y gestiona tus pasarelas de pago</p>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium">Importante</p>
          <p className="mt-1">Mantén tus credenciales seguras. Los datos sensibles están encriptados. Puedes usar el ambiente de prueba (Sandbox) para realizar pruebas antes de activar en producción.</p>
        </div>
      </div>

      {/* Quick access cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: '🏦', label: 'Transbank', desc: 'WebPay' },
          { icon: '💳', label: 'Mercado Pago', desc: 'MercadoPago' },
          { icon: '⚡', label: 'Stripe', desc: 'Stripe' },
          { icon: '🅿️', label: 'PayPal', desc: 'PayPal' },
        ].map(p => (
          <button
            key={p.desc}
            onClick={handleCreateNew}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-center group"
          >
            <div className="text-2xl mb-1">{p.icon}</div>
            <p className="text-xs font-medium text-gray-900">{p.label}</p>
            <p className="text-[10px] text-gray-500">{p.desc}</p>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="space-y-4">
        {/* Create button */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Métodos Configurados</h2>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo método
          </button>
        </div>

        {/* Methods table */}
        <PaymentMethodsTable
          methods={methods}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={loading}
        />
      </div>

      {/* Configuration summary */}
      {methods.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-900 font-medium">Métodos Activos</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              {methods.filter(m => m.is_active).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900 font-medium">En Producción</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">
              {methods.filter(m => m.is_production).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium">En Prueba (Sandbox)</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">
              {methods.filter(m => !m.is_production).length}
            </p>
          </div>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <PaymentMethodForm
          method={editingMethod || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingMethod(null)
          }}
        />
      )}
    </div>
  )
}
