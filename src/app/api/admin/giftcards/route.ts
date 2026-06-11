import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  code:            z.string().min(3).max(50).toUpperCase(),
  initial_amount:  z.number().int().min(1),
  balance:         z.number().int().min(0),
  issued_to_email: z.string().email().nullable().optional(),
  note:            z.string().nullable().optional(),
  expires_at:      z.string().nullable().optional(),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { data: existing } = await admin
    .from('gift_cards')
    .select('id')
    .eq('code', parsed.data.code)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: 'Ya existe una giftcard con ese código' }, { status: 409 })

  const { error } = await admin.from('gift_cards').insert({
    ...parsed.data,
    issued_by: user.id,
    expires_at: parsed.data.expires_at ? new Date(parsed.data.expires_at).toISOString() : null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const admin = createAdminClient()
  const { data } = await admin
    .from('gift_cards')
    .select('*, gift_card_transactions(*)')
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
