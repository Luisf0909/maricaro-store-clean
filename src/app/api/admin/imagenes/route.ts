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

export async function POST(req: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const productId = formData.get('productId') as string | null
  const isPrimary = formData.get('isPrimary') === 'true'
  const altText = formData.get('altText') as string | null

  if (!file || !productId) {
    return NextResponse.json({ error: 'Archivo y productId son requeridos' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${productId}/${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const admin = createAdminClient()

  // Upload to Supabase Storage
  const { error: uploadError } = await admin.storage
    .from('product-images')
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 })

  const { data: { publicUrl } } = admin.storage.from('product-images').getPublicUrl(path)

  // If this is primary, unset previous primary
  if (isPrimary) {
    await admin.from('product_images').update({ is_primary: false }).eq('product_id', productId)
  }

  // Get current max sort_order
  const { data: existing } = await admin
    .from('product_images')
    .select('sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const sortOrder = existing?.[0]?.sort_order != null ? existing[0].sort_order + 1 : 0

  const { data, error } = await admin
    .from('product_images')
    .insert({
      product_id: productId,
      url: publicUrl,
      alt_text: altText || null,
      sort_order: sortOrder,
      is_primary: isPrimary || sortOrder === 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { imageId } = await req.json()
  const admin = createAdminClient()

  const { data: img } = await admin
    .from('product_images')
    .select('url')
    .eq('id', imageId)
    .single()

  if (img) {
    // Extract storage path from URL
    const url = new URL(img.url)
    const storagePath = url.pathname.split('/product-images/')[1]
    if (storagePath) {
      await admin.storage.from('product-images').remove([storagePath])
    }
  }

  await admin.from('product_images').delete().eq('id', imageId)
  return NextResponse.json({ success: true })
}
