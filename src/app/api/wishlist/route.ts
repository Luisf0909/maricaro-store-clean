import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 200 })

  const { data } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', user.id)

  return NextResponse.json(data?.map(w => w.product_id) ?? [])
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId requerido' }, { status: 400 })

  const { error } = await supabase
    .from('wishlists')
    .upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id,product_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId requerido' }, { status: 400 })

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
