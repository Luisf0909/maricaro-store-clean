import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const is_active = body.is_active === true || body.is_active === 'true'

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('products')
      .update({ is_active })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Toggle active error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Revalidate the product edit page
    revalidatePath(`/admin/productos/${params.id}`)
    revalidatePath('/admin/productos')

    return NextResponse.json(data)
  } catch (err) {
    console.error('Toggle active exception:', err)
    return NextResponse.json({ error: 'Error al cambiar estado' }, { status: 500 })
  }
}
