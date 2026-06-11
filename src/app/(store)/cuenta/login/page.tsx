'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword(form)
    if (error) {
      toast.error('Email o contraseña incorrectos')
    } else {
      router.push(redirect)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-warm-900">Bienvenida</h1>
          <p className="text-muted-foreground mt-1 text-sm">Ingresa a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-cream-300 bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Contraseña</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-cream-300 bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-warm-700 hover:bg-warm-800 disabled:opacity-60 text-cream-50 font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/cuenta/registro" className="text-warm-700 font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
