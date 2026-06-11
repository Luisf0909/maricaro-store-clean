import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeRUT } from '@/lib/rut'

export async function POST(req: Request) {
  const { code, email, rut, subtotal } = await req.json()

  if (!code || !email || !rut) {
    return NextResponse.json({ error: 'Código, correo y RUT son requeridos' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: coupon } = await admin
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('is_active', true)
    .single()

  if (!coupon) return NextResponse.json({ error: 'Cupón inválido o inactivo' }, { status: 404 })

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Este cupón ha vencido' }, { status: 400 })
  }

  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return NextResponse.json({ error: 'Este cupón ha alcanzado su límite de usos' }, { status: 400 })
  }

  if (subtotal < coupon.min_order_amount) {
    return NextResponse.json({
      error: `El mínimo para este cupón es $${coupon.min_order_amount.toLocaleString('es-CL')} CLP`,
    }, { status: 400 })
  }

  if (coupon.one_per_customer) {
    const normalizedRut = normalizeRUT(rut)
    const { data: uses } = await admin
      .from('coupon_uses')
      .select('id')
      .eq('coupon_id', coupon.id)
      .or(`customer_email.eq.${email.toLowerCase()},customer_rut.eq.${normalizedRut}`)
      .limit(1)

    if (uses && uses.length > 0) {
      return NextResponse.json({ error: 'Ya usaste este cupón anteriormente' }, { status: 400 })
    }
  }

  const discountAmount =
    coupon.discount_type === 'percentage'
      ? Math.round((subtotal * coupon.discount_value) / 100)
      : Math.min(coupon.discount_value, subtotal)

  return NextResponse.json({
    valid: true,
    coupon,
    discountAmount,
  })
}
