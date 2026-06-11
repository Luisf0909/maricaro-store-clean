import { createAdminClient } from '@/lib/supabase/admin'
import { SiteConfigEditor } from '@/components/admin/SiteConfigEditor'
import type { SiteConfig } from '@/types'

export const dynamic  = 'force-dynamic'
export const metadata = { title: 'Admin — Configuración de contenido' }

export default async function ConfiguracionPage() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('site_config')
    .select('*')
    .order('section')
    .order('key')

  return (
    <div className="space-y-6">
      <SiteConfigEditor initialConfig={(data ?? []) as SiteConfig[]} />
    </div>
  )
}
