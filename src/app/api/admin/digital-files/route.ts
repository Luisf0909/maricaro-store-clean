import { NextResponse } from 'next/server'
import { createAdminClient, requireAdmin } from '@/lib/supabase/admin'

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

  // Upload file to storage
  const { error: uploadError } = await admin.storage
    .from('digital-products')
    .upload(path, bytes, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  console.log(`[STORAGE] File uploaded: ${path}`)

  // Update database
  console.log(`[DB] Updating product ${productId} with file ${file.name}`)

  const { data: updated, error: dbError, count } = await admin
    .from('products')
    .update({
      digital_file_name: file.name,
      digital_file_path: path,
    })
    .eq('id', productId)
    .select()

  console.log(`[DB RESULT]`, {
    productId,
    fileName: file.name,
    filePath: path,
    rowsUpdated: count,
    error: dbError?.message,
    dataReturned: updated ? updated.length : 0,
  })

  if (dbError) {
    console.error(`[DB ERROR]`, dbError)
  }

  // Return path to client
  return NextResponse.json({
    digital_file_name: file.name,
    path,
    success: true,
    message: 'Archivo subido y guardado correctamente.'
  })
}
