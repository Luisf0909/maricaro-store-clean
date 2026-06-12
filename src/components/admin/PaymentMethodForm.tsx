'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react'
import type { PaymentMethod } from '@/types'

interface Props {
  method?: PaymentMethod
  onSave: (method: PaymentMethod) => Promise<void>
  onCancel: () => void
}

const PROVIDERS = [
  { id: 'transbank', name: 'Transbank (WebPay)', icon: '🏦' },
  { id: 'mercadopago', name: 'Mercado Pago', icon: '💳' },
  { id: 'stripe', name: 'Stripe', icon: '⚡' },
  { id: 'paypal', name: 'PayPal', icon: '🅿️' },
] as const

const FIELD_CONFIG = {
  transbank: [
    { key: 'commerce_code', label: 'Código de comercio', type: 'text', required: true },
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  mercadopago: [
    { key: 'access_token', label: 'Access Token', type: 'password', required: true },
    { key: 'public_key', label: 'Public Key', type: 'text', required: true },
  ],
  stripe: [
    { key: 'publishable_key', label: 'Publishable Key', type: 'text', required: true },
    { key: 'secret_key', label: 'Secret Key', type: 'password', required: true },
  ],
  paypal: [
    { key: 'client_id', label: 'Client ID', type: 'text', required: true },
    { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
  ],
} as const

export function PaymentMethodForm({ method, onSave, onCancel }: Props) {
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  const [form, setForm] = useState({
    name: method?.name ?? '',
    provider: method?.provider ?? ('transbank' as const),
    is_production: method?.is_production ?? false,
    is_active: method?.is_active ?? true,
    config: method?.config ?? {},
  })

  const provider = form.provider as keyof typeof FIELD_CONFIG
  const fields = FIELD_CONFIG[provider]

  function updateConfig(key: string, value: string) {
    setForm(f => ({
      ...f,
      config: { ...f.config, [key]: value || undefined },
    }))
  }

  function toggleShowSecret(key: string) {
    setShowSecrets(s => ({ ...s, [key]: !s[key] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    // Validar que los campos requeridos estén completos
    const missing = fields.filter(f => f.required && !form.config[f.key])
    if (missing.length > 0) {
      toast.error(`Completa estos campos: ${missing.map(f => f.label).join(', ')}`)
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        api_key: form.config?.api_key,
        api_secret: form.config?.api_secret,
      }

      const url = method ? `/api/admin/payment-methods/${method.id}` : '/api/admin/payment-methods'
      const res = await fetch(url, {
        method: method ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al guardar')
      }

      const data = await res.json()
      await onSave(data)
      toast.success(method ? 'Método actualizado' : 'Método creado')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const fi = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white'
  const lb = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4 p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {method ? 'Editar método de pago' : 'Nuevo método de pago'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Name */}
        <div>
          <label className={lb}>Nombre *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="ej: Transbank - Principal"
            className={fi}
          />
          <p className="text-xs text-gray-500 mt-1">Nombre identificador para este método</p>
        </div>

        {/* Provider */}
        <div>
          <label className={lb}>Proveedor *</label>
          <select
            value={form.provider}
            onChange={e => setForm(f => ({
              ...f,
              provider: e.target.value as typeof form.provider,
              config: {},
            }))}
            className={fi}
          >
            {PROVIDERS.map(p => (
              <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
            ))}
          </select>
        </div>

        {/* API Credentials */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Credenciales
          </p>
          {fields.map(field => (
            <div key={field.key}>
              <label className={lb}>{field.label} {field.required && '*'}</label>
              <div className="relative">
                <input
                  type={showSecrets[field.key] ? 'text' : field.type}
                  required={field.required}
                  value={form.config[field.key] as string || ''}
                  onChange={e => updateConfig(field.key, e.target.value)}
                  className={`${fi} pr-10`}
                  placeholder={`Ingresa ${field.label.toLowerCase()}`}
                />
                {field.type === 'password' && (
                  <button
                    type="button"
                    onClick={() => toggleShowSecret(field.key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showSecrets[field.key] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Environment & Status */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={form.is_production}
                onChange={e => setForm(f => ({ ...f, is_production: e.target.checked }))}
                className="accent-rose-600"
              />
              <span className="text-sm font-medium text-amber-900">
                {form.is_production ? 'Producción' : 'Prueba (Sandbox)'}
              </span>
            </label>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="accent-rose-600"
            />
            <span className="text-sm text-gray-700">Activo en la tienda</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-lg font-medium text-sm transition-colors"
          >
            {saving ? 'Guardando...' : method ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  )
}
