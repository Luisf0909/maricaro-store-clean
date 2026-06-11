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
  const { data, error } = await admin
    .from('banners')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const admin = createAdminClient()
  const { error } = await admin.from('banners').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
