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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const { digital_file_name, digital_file_path } = body

    console.log(`PATCH /save-digital-file/${params.id}:`, { digital_file_name, digital_file_path })

    const admin = createAdminClient()

    // Update ONLY digital file fields
    const { data, error } = await admin
      .from('products')
      .update({
        digital_file_name: digital_file_name || null,
        digital_file_path: digital_file_path || null,
      })
      .eq('id', params.id)
      .select()
      .single()

    console.log(`Update result:`, { data, error })

    if (error) {
      console.error('Error saving digital file:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Exception:', err)
    return NextResponse.json({ error: 'Error al guardar archivo' }, { status: 500 })
  }
}
