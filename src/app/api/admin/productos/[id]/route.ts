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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data } = await admin
    .from('products')
    .select('*, categories(*), product_images(*)')
    .eq('id', params.id)
    .single()

  if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { name, slug, description, price, compare_price, stock, made_to_order,
          category_id, sku, is_featured, is_active, meta_title, meta_description, video_url } = body

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('products')
    .update({
      name,
      slug: slug?.toLowerCase().replace(/\s+/g, '-'),
      description: description || null,
      price: Math.round(price),
      compare_price: compare_price ? Math.round(compare_price) : null,
      stock: stock ?? 0,
      made_to_order: made_to_order ?? false,
      category_id: category_id || null,
      sku: sku || null,
      is_featured: is_featured ?? false,
      is_active: is_active ?? true,
      meta_title: meta_title || null,
      meta_description: meta_description || null,
      video_url: video_url || null,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin.from('products').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
