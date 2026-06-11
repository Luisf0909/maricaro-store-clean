import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  points_per_clp:     z.number().min(0).max(1),
  clp_per_point:      z.number().int().min(1),
  min_points_redeem:  z.number().int().min(1),
  points_expiry_days: z.number().int().min(1).nullable().optional(),
  is_active:          z.boolean(),
})

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { error } = await admin
    .from('loyalty_config')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
