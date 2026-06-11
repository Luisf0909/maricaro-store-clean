import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const schema = z.object({
  pointsToRedeem: z.number().int().min(1),
  orderTotal:     z.number().int().min(0),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ valid: false, error: 'Debes iniciar sesión para canjear puntos' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ valid: false, error: 'Datos inválidos' }, { status: 400 })

  const { pointsToRedeem, orderTotal } = parsed.data
  const admin = createAdminClient()

  const [{ data: account }, { data: config }] = await Promise.all([
    admin.from('loyalty_accounts').select('*').eq('user_id', user.id).single(),
    admin.from('loyalty_config').select('*').single(),
  ])

  if (!config?.is_active) return NextResponse.json({ valid: false, error: 'El programa de puntos no está activo' })
  if (!account) return NextResponse.json({ valid: false, error: 'No tienes cuenta de puntos' })
  if (account.points_balance < pointsToRedeem) {
    return NextResponse.json({ valid: false, error: `Saldo insuficiente. Tienes ${account.points_balance} puntos` })
  }
  if (pointsToRedeem < config.min_points_redeem) {
    return NextResponse.json({ valid: false, error: `Mínimo para canjear: ${config.min_points_redeem} puntos` })
  }

  const discountAmount = Math.min(pointsToRedeem * config.clp_per_point, orderTotal)

  return NextResponse.json({
    valid: true,
    discountAmount,
    pointsBalance: account.points_balance,
    clpPerPoint:   config.clp_per_point,
  })
}
