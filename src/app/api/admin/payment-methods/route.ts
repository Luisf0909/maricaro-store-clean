import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { PaymentMethod } from '@/types'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function GET() {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('payment_methods')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const { name, provider, api_key, api_secret, config, is_production, is_active } = body

    if (!name || !provider) {
      return NextResponse.json(
        { error: 'Nombre y proveedor son requeridos' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Obtener el siguiente sort_order
    const { data: existing } = await admin
      .from('payment_methods')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextSortOrder = (existing?.[0]?.sort_order ?? 0) + 1

    const { data, error } = await admin
      .from('payment_methods')
      .insert([
        {
          name,
          provider,
          api_key: api_key || null,
          api_secret: api_secret || null,
          config: config || null,
          is_production: is_production ?? false,
          is_active: is_active ?? true,
          sort_order: nextSortOrder,
        },
      ])
      .select()

    if (error) throw error
    return NextResponse.json(data?.[0], { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
