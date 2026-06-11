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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data } = await admin.from('coupons').select('*').eq('id', params.id).single()
  if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('coupons')
    .update({
      code: body.code?.toUpperCase().trim(),
      description: body.description || null,
      discount_type: body.discount_type,
      discount_value: Math.round(body.discount_value),
      min_order_amount: body.min_order_amount ? Math.round(body.min_order_amount) : 0,
      max_uses: body.max_uses || null,
      one_per_customer: body.one_per_customer ?? true,
      expires_at: body.expires_at || null,
      is_active: body.is_active ?? true,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin.from('coupons').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
