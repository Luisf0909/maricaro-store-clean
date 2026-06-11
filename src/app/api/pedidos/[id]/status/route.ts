import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Prohibido' }, { status: 403 })

  const { status } = await req.json()

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const admin = createAdminClient()
  const updates: Record<string, unknown> = { status }
  if (status === 'shipped') updates.shipped_at = new Date().toISOString()
  if (status === 'delivered') updates.delivered_at = new Date().toISOString()

  const { error } = await admin.from('orders').update(updates).eq('id', params.id)
  if (error) return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })

  return NextResponse.json({ success: true })
}
