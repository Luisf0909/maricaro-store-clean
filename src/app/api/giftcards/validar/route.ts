import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const schema = z.object({
  code:       z.string().min(1).max(100).transform(s => s.toUpperCase().trim()),
  orderTotal: z.number().int().min(0),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ valid: false, error: 'Datos inválidos' }, { status: 400 })

  const { code, orderTotal } = parsed.data
  const admin = createAdminClient()

  const { data: gc } = await admin
    .from('gift_cards')
    .select('*')
    .eq('code', code)
    .eq('status', 'active')
    .single()

  if (!gc) return NextResponse.json({ valid: false, error: 'Giftcard no encontrada o inactiva' })

  const now = new Date()
  if (gc.expires_at && new Date(gc.expires_at) < now) {
    // Mark as expired
    await admin.from('gift_cards').update({ status: 'expired' }).eq('id', gc.id)
    return NextResponse.json({ valid: false, error: 'La giftcard ha vencido' })
  }

  if (gc.balance <= 0) {
    return NextResponse.json({ valid: false, error: 'La giftcard no tiene saldo disponible' })
  }

  // Applicable amount is min(balance, orderTotal)
  const applicableAmount = Math.min(gc.balance, orderTotal)

  return NextResponse.json({
    valid: true,
    giftCard: gc,
    applicableAmount,
  })
}
