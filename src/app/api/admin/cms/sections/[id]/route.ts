import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'operator'].includes(profile.role)) return null
  return user
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await req.json()
  const admin = createAdminClient()

  // Allow updating: is_active, title, subtitle, config, sort_order
  const allowed: Record<string, unknown> = {}
  if ('is_active'   in body) allowed.is_active   = body.is_active
  if ('title'       in body) allowed.title        = body.title
  if ('subtitle'    in body) allowed.subtitle     = body.subtitle
  if ('config'      in body) allowed.config       = body.config
  if ('sort_order'  in body) allowed.sort_order   = body.sort_order

  allowed.updated_at = new Date().toISOString()

  const { error } = await admin
    .from('homepage_sections')
    .update(allowed)
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('homepage_sections')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
