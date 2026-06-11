'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Revisa tu email para confirmar tu cuenta')
      router.push('/cuenta/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-warm-900">Crear cuenta</h1>
          <p className="text-muted-foreground mt-1 text-sm">Únete a nuestra comunidad</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nombre completo</label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-cream-300 bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"
              placeholder="María Carolina"
            />
          </div>
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
              minLength={6}
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
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/cuenta/login" className="text-warm-700 font-medium hover:underline">
            Ingresar
          </Link>
        </p>
      </div>
    </div>
  )
}
