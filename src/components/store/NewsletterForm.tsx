'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export function NewsletterForm() {
  const [email, setEmail] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    toast.success('¡Gracias! Te hemos suscrito correctamente.')
    setEmail('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"
      />
      <button
        type="submit"
        className="bg-warm-700 hover:bg-warm-800 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors whitespace-nowrap"
      >
        Suscribirme
      </button>
    </form>
  )
}
