import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const schema = z.object({
  productId: z.string().uuid(),
  rating:    z.number().int().min(1).max(5),
  title:     z.string().max(100).optional(),
  body:      z.string().max(1000).optional(),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  if (!productId) return NextResponse.json({ error: 'productId requerido' }, { status: 400 })

  const supabase = await createClient()

  const [{ data: reviews }, { data: summary }] = await Promise.all([
    supabase
      .from('product_reviews')
      .select('*, profiles(full_name)')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('product_rating_summary')
      .select('*')
      .eq('product_id', productId)
      .single(),
  ])

  return NextResponse.json({ reviews: reviews ?? [], summary: summary ?? null })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { productId, rating, title, body: reviewBody } = parsed.data

  // Check if user already reviewed this product
  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('product_reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .single()

  if (existing) return NextResponse.json({ error: 'Ya enviaste una reseña para este producto' }, { status: 409 })

  // Check if verified buyer
  const { data: purchase } = await admin
    .from('order_items')
    .select('id, orders!inner(user_id, payment_status)')
    .eq('product_id', productId)
    .eq('orders.user_id', user.id)
    .eq('orders.payment_status', 'paid')
    .limit(1)
    .single()

  const { error } = await admin
    .from('product_reviews')
    .insert({
      product_id:   productId,
      user_id:      user.id,
      rating,
      title:        title || null,
      body:         reviewBody || null,
      is_verified:  !!purchase,
      status:       'pending',
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 201 })
}
