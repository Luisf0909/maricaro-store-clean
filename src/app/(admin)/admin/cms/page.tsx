import { createAdminClient } from '@/lib/supabase/admin'
import { HomepageSectionsEditor } from '@/components/admin/HomepageSectionsEditor'
import { BannersManager } from '@/components/admin/BannersManager'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'CMS Visual | Admin' }

export default async function CmsPage() {
  const admin = createAdminClient()

  const [{ data: sections }, { data: banners }] = await Promise.all([
    admin
      .from('homepage_sections')
      .select('*')
      .order('sort_order'),
    admin
      .from('banners')
      .select('*')
      .order('sort_order'),
  ])

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Constructor visual</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Administra el contenido del home y los banners sin tocar código
        </p>
      </div>

      {/* Banners */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-4">Banners</h2>
        <BannersManager initialBanners={banners ?? []} />
      </section>

      {/* Sections */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-4">Secciones del Home</h2>
        <p className="text-xs text-gray-400 mb-4">
          Activa, desactiva o reordena las secciones de la página principal. Los cambios se aplican inmediatamente.
        </p>
        <HomepageSectionsEditor initialSections={sections ?? []} />
      </section>
    </div>
  )
}
