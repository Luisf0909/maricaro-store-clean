'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
// RUT validation available via validateRUT from '@/lib/rut' if needed

interface Props {
  userId: string
  email: string
  initialData: {
    full_name?: string | null
    phone?: string | null
    accepts_marketing?: boolean
  } | null
}

export function AccountProfileForm({ userId, email, initialData }: Props) {
  const [form, setForm] = useState({
    full_name:         initialData?.full_name         ?? '',
    phone:             initialData?.phone             ?? '',
    accepts_marketing: initialData?.accepts_marketing ?? false,
  })
  const [isPending, startTransition] = useTransition()

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  function save(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await fetch('/api/cuenta/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...form }),
      })
      if (res.ok) toast.success('Perfil actualizado')
      else toast.error('Error al guardar')
    })
  }

  return (
    <form onSubmit={save} className="space-y-5">
      {/* Email (read-only) */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full text-sm border border-gray-100 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-400 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-1">El email no se puede modificar aquí.</p>
      </div>

      {/* Full name */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Nombre completo</label>
        <input
          type="text"
          value={form.full_name}
          onChange={e => set('full_name', e.target.value)}
          placeholder="María González"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-warm-400 bg-white"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Teléfono</label>
        <input
          type="tel"
          value={form.phone}
          onChange={e => set('phone', e.target.value)}
          placeholder="+56 9 1234 5678"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-warm-400 bg-white"
        />
      </div>

      {/* Marketing consent */}
      <div className="flex items-start gap-3 p-3 bg-warm-50 rounded-lg border border-warm-100">
        <input
          type="checkbox"
          id="marketing"
          checked={form.accepts_marketing}
          onChange={e => set('accepts_marketing', e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-warm-600 focus:ring-warm-400"
        />
        <label htmlFor="marketing" className="text-xs text-gray-600 cursor-pointer">
          <span className="font-medium text-gray-700">Recibir novedades y promociones</span>
          <br />
          Acepto recibir emails sobre nuevos productos, ofertas especiales y devocionales. Puedes desactivarlo en cualquier momento.
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 bg-warm-700 text-white text-sm font-medium rounded-lg hover:bg-warm-800 disabled:opacity-60 transition-colors"
      >
        {isPending ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  )
}
