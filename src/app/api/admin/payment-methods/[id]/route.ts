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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('payment_methods')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const { name, provider, api_key, api_secret, config, is_production, is_active, sort_order } = body

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('payment_methods')
      .update({
        ...(name && { name }),
        ...(provider && { provider }),
        api_key: api_key || null,
        api_secret: api_secret || null,
        config: config || null,
        ...(typeof is_production !== 'undefined' && { is_production }),
        ...(typeof is_active !== 'undefined' && { is_active }),
        ...(typeof sort_order !== 'undefined' && { sort_order }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()

    if (error) throw error
    if (!data?.length) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    return NextResponse.json(data[0])
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const admin = createAdminClient()
    const { error } = await admin
      .from('payment_methods')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
