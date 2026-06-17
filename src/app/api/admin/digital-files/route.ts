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

  // Verify product exists
  const { data: product, error: productError } = await admin
    .from('products')
    .select('id')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    console.error(`Product not found: ${productId}`, productError)
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

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

  // Persist path + display name on the product
  const { data: updateData, error: updateError } = await admin
    .from('products')
    .update({ digital_file_path: path, digital_file_name: file.name })
    .eq('id', productId)
    .select()

  console.log(`Update result for ${productId}:`, { data: updateData, error: updateError })

  if (updateError) {
    console.error('Error updating product with digital file:', updateError)
    return NextResponse.json({ error: `DB Update failed: ${updateError.message}` }, { status: 500 })
  }

  console.log(`Digital file saved for product ${productId}: ${path}`)
  return NextResponse.json({ digital_file_name: file.name, path, updated: true })
}
