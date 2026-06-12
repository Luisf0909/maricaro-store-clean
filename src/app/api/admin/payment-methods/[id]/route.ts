'use server'

import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth-server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error
    if (!data) return Response.json({ error: 'No encontrado' }, { status: 404 })

    return Response.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const body = await req.json()
    const { name, provider, api_key, api_secret, config, is_production, is_active, sort_order } = body

    const { data, error } = await supabase
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
    if (!data?.length) return Response.json({ error: 'No encontrado' }, { status: 404 })

    return Response.json(data[0])
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ error: message }, { status: 500 })
  }
}
