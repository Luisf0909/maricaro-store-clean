import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data } = await admin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { code, description, discount_type, discount_value, min_order_amount,
          max_uses, one_per_customer, expires_at, is_active } = body

  if (!code || !discount_type || !discount_value) {
    return NextResponse.json({ error: 'Código, tipo y valor son requeridos' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('coupons')
    .insert({
      code: code.toUpperCase().trim(),
      description: description || null,
      discount_type,
      discount_value: Math.round(discount_value),
      min_order_amount: min_order_amount ? Math.round(min_order_amount) : 0,
      max_uses: max_uses || null,
      one_per_customer: one_per_customer ?? true,
      expires_at: expires_at || null,
      is_active: is_active ?? true,
    })
    .select()
    .single()

  if (error) {
    const msg = error.code === '23505' ? 'Ese código ya existe' : error.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }
  return NextResponse.json(data, { status: 201 })
}
