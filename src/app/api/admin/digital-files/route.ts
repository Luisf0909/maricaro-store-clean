import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const authError = await requireAdmin()
  if (authError) return authError

  const formData = await req.formData()
  const file      = formData.get('file')      as File | null
  const productId = formData.get('productId') as string | null

  if (!file || !productId) {
    return NextResponse.json({ error: 'Archivo y productId son requeridos' }, { status: 400 })
  }

  const ext   = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const path  = `${productId}/file.${ext}`
  const bytes = await file.arrayBuffer()

  const admin = createAdminClient()

  const { error: uploadError } = await admin.storage
    .from('digital-products')
    .upload(path, bytes, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Persist path + display name on the product
  const { error: updateError } = await admin
    .from('products')
    .update({ digital_file_path: path, digital_file_name: file.name })
    .eq('id', productId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ digital_file_name: file.name, path })
}
