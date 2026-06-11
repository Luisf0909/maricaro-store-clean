import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { sections } = await req.json()
  const admin = createAdminClient()

  const updates = sections.map(({ id, sort_order }: { id: string; sort_order: number }) =>
    admin.from('homepage_sections').update({ sort_order }).eq('id', id)
  )

  await Promise.all(updates)
  return NextResponse.json({ success: true })
}
