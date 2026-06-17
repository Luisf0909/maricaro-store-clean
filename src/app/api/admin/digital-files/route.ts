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

  console.log(`File uploaded to storage: ${path}`)

  // Save path directly to database - simple and direct
  console.log(`[SAVING] productId=${productId}, file=${file.name}, path=${path}`)

  try {
    const updateResult = await admin
      .from('products')
      .update({
        digital_file_name: file.name,
        digital_file_path: path
      })
      .eq('id', productId)

    console.log(`[UPDATE RESULT]`, {
      status: updateResult.status,
      error: updateResult.error,
      data: updateResult.data
    })

    if (updateResult.error) {
      console.error(`[ERROR] Failed to save digital file:`, updateResult.error)
    } else {
      console.log(`[SUCCESS] Digital file saved for product ${productId}`)
    }
  } catch (err) {
    console.error(`[EXCEPTION] Error saving digital file:`, err)
  }

  // Return success to client
  return NextResponse.json({
    digital_file_name: file.name,
    path,
    success: true,
    message: 'Archivo subido y guardado. Haz click en "Guardar cambios" para confirmar los cambios del producto.'
  })
}
