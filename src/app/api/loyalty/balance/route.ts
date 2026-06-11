import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ balance: 0 })

  const admin = createAdminClient()
  const [{ data: account }, { data: config }] = await Promise.all([
    admin.from('loyalty_accounts').select('points_balance').eq('user_id', user.id).maybeSingle(),
    admin.from('loyalty_config').select('clp_per_point, min_points_redeem, is_active').single(),
  ])

  if (!config?.is_active) return NextResponse.json({ balance: 0, active: false })

  return NextResponse.json({
    balance:     account?.points_balance ?? 0,
    clpPerPoint: config?.clp_per_point   ?? 1,
    minRedeem:   config?.min_points_redeem ?? 100,
    active:      config?.is_active ?? false,
  })
}
