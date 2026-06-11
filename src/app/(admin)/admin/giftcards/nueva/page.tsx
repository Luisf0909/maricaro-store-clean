'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'GC-'
  for (let i = 0; i < 12; i++) {
    if (i === 4 || i === 8) code += '-'
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export default function NuevaGiftCardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    code:            generateCode(),
    amount:          '',
    issued_to_email: '',
    note:            '',
    expires_at:      '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.amount || parseInt(form.amount) <= 0) { toast.error('Monto inválido'); return }
    setLoading(true)

    const res = await fetch('/api/admin/giftcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code:            form.code.toUpperCase().trim(),
        initial_amount:  parseInt(form.amount),
        balance:         parseInt(form.amount),
        issued_to_email: form.issued_to_email || null,
        note:            form.note || null,
        expires_at:      form.expires_at || null,
      }),
    })

    if (res.ok) {
      toast.success('GiftCard creada correctamente')
      router.push('/admin/giftcards')
    } else {
      const data = await res.json()
      toast.error(data.error ?? 'Error al crear giftcard')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href="/admin/giftcards" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-warm-700 mb-3">
          <ArrowLeft className="h-3 w-3" /> Volver a GiftCards
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nueva GiftCard</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        {/* Code */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Código</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase())}
              required
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-warm-400 bg-white"
              maxLength={30}
            />
            <button
              type="button"
              onClick={() => set('code', generateCode())}
              title="Generar nuevo código"
              className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Monto (CLP)</label>
          <input
            type="number"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            required
            min={1000}
            step={500}
            placeholder="10000"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400 bg-white"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Email del destinatario (opcional)</label>
          <input
            type="email"
            value={form.issued_to_email}
            onChange={e => set('issued_to_email', e.target.value)}
            placeholder="cliente@email.com"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400 bg-white"
          />
        </div>

        {/* Expiry */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Fecha de vencimiento (opcional)</label>
          <input
            type="date"
            value={form.expires_at}
            onChange={e => set('expires_at', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400 bg-white"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Nota interna (opcional)</label>
          <textarea
            value={form.note}
            onChange={e => set('note', e.target.value)}
            rows={2}
            placeholder="Motivo o uso de esta giftcard"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400 bg-white resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-warm-700 text-white text-sm font-semibold rounded-lg hover:bg-warm-800 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Creando…' : 'Crear GiftCard'}
        </button>
      </form>
    </div>
  )
}
