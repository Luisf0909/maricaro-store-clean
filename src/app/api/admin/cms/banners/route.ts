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

export async function POST(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await req.json()
  const admin = createAdminClient()
  const { data, error } = await admin.from('banners').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
