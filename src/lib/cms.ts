import { createClient } from '@/lib/supabase/server'
import type { HomepageSection, Banner } from '@/types'

/** Fetch active homepage sections ordered by sort_order */
export async function getActiveSections(): Promise<HomepageSection[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('homepage_sections')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return (data ?? []) as HomepageSection[]
}

/** Fetch all homepage sections (admin use) */
export async function getAllSections(): Promise<HomepageSection[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('homepage_sections')
    .select('*')
    .order('sort_order')
  return (data ?? []) as HomepageSection[]
}

/** Fetch active banners for a position */
export async function getActiveBanners(position?: string): Promise<Banner[]> {
  const supabase = await createClient()
  let query = supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (position) query = query.eq('position', position)

  const now = new Date().toISOString()
  // Filter by date range if set
  const { data } = await query

  return ((data ?? []) as Banner[]).filter(b => {
    if (b.starts_at && new Date(b.starts_at) > new Date(now)) return false
    if (b.ends_at   && new Date(b.ends_at)   < new Date(now)) return false
    return true
  })
}

/** Get a single section's config value with fallback */
export function getSectionConfig<T>(
  section: HomepageSection,
  key: string,
  fallback: T
): T {
  const config = section.config as Record<string, unknown>
  if (config && key in config && config[key] !== null && config[key] !== undefined && config[key] !== '') {
    return config[key] as T
  }
  return fallback
}
