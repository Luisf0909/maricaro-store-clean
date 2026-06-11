import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maricarostore.cl'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: appUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${appUrl}/productos`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${appUrl}/productos?categoria=devocionales`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${appUrl}/productos?categoria=planners`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${appUrl}/productos?categoria=agendas`, changeFrequency: 'weekly', priority: 0.7 },
  ]

  // Si no hay URL de Supabase configurada, retornar solo rutas estáticas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return staticRoutes
  }

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()
    const { data: products } = await admin
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)

    const productUrls: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
      url: `${appUrl}/producto/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [...staticRoutes, ...productUrls]
  } catch {
    return staticRoutes
  }
}
