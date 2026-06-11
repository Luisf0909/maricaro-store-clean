import { NextResponse } from 'next/server'
import { createAdminClient, requireAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  const admin = createAdminClient()
  const { data, error } = await admin.from('site_config').select('*').order('section').order('key')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  const authError = await requireAdmin()
  if (authError) return authError

  const updates: Array<{ key: string; value: string }> = await req.json()
  if (!Array.isArray(updates) || !updates.length) {
    return NextResponse.json({ error: 'Se esperan actualizaciones' }, { status: 400 })
  }

  const admin = createAdminClient()
  const now   = new Date().toISOString()

  for (const { key, value } of updates) {
    const { error } = await admin
      .from('site_config')
      .update({ value, updated_at: now })
      .eq('key', key)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
