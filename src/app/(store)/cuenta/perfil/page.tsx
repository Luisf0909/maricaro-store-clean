import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { formatCLP } from '@/lib/utils'
import { AccountProfileForm } from '@/components/store/AccountProfileForm'
import { User, ShoppingBag, Heart, Download, Star, LogOut } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mi perfil | Maria Caro Store' }

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cuenta/login?redirect=/cuenta/perfil')

  const admin = createAdminClient()

  const [{ data: profile }, { data: stats }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', user.id).single(),
    admin
      .from('orders')
      .select('total, status')
      .eq('user_id', user.id)
      .eq('payment_status', 'paid'),
  ])

  const totalSpent = stats?.reduce((s, o) => s + o.total, 0) ?? 0
  const orderCount = stats?.length ?? 0

  const [{ count: wishlistCount }, loyaltyAccount] = await Promise.all([
    admin.from('wishlists').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    admin.from('loyalty_accounts').select('points_balance').eq('user_id', user.id).maybeSingle(),
  ])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-cormorant font-light text-3xl text-gray-900">Mi cuenta</h1>
        <p className="text-sm text-gray-500 mt-1">{user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Pedidos',   value: String(orderCount),                     icon: ShoppingBag, href: '/cuenta/pedidos',   color: 'text-blue-600' },
          { label: 'Gastado',   value: formatCLP(totalSpent),                  icon: Star,        href: '/cuenta/pedidos',   color: 'text-emerald-600' },
          { label: 'Favoritos', value: String(wishlistCount ?? 0),              icon: Heart,       href: '/cuenta/favoritos', color: 'text-pink-500' },
          { label: 'Puntos',    value: String(loyaltyAccount?.data?.points_balance ?? 0), icon: Star, href: '/cuenta/puntos', color: 'text-amber-500' },
        ].map(s => (
          <Link key={s.label} href={s.href}
            className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow group"
          >
            <s.icon className={`h-4 w-4 mb-2 ${s.color}`} />
            <p className="text-lg font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {[
          { href: '/cuenta/pedidos',   icon: ShoppingBag, label: 'Mis pedidos',      desc: 'Historial y estado de tus compras' },
          { href: '/cuenta/favoritos', icon: Heart,       label: 'Favoritos',        desc: 'Productos que guardaste' },
          { href: '/cuenta/descargas', icon: Download,    label: 'Mis descargas',    desc: 'Accede a tus productos digitales' },
          { href: '/cuenta/puntos',    icon: Star,        label: 'Puntos y premios', desc: 'Consulta tu saldo de fidelización' },
        ].map(link => (
          <Link key={link.href} href={link.href}
            className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-warm-200 hover:shadow-sm transition-all group"
          >
            <div className="p-2 rounded-lg bg-warm-50 group-hover:bg-warm-100 transition-colors">
              <link.icon className="h-4 w-4 text-warm-600" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-800">{link.label}</p>
              <p className="text-xs text-gray-400">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-4 w-4 text-warm-600" />
          <h2 className="font-semibold text-gray-900">Datos personales</h2>
        </div>
        <AccountProfileForm
          userId={user.id}
          email={user.email ?? ''}
          initialData={profile}
        />
      </div>

      {/* Logout */}
      <form action="/auth/signout" method="POST" className="mt-6 text-center">
        <button
          type="submit"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </form>
    </div>
  )
}
