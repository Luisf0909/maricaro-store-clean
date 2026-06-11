import { createClient } from '@/lib/supabase/server'
import type { ProductWithImages, ProductWithVariants, Category } from '@/types'

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return data ?? []
}

export async function getProducts(params?: {
  categorySlug?: string
  categoryId?: string
  featured?: boolean
  limit?: number
  search?: string
  digital?: boolean
  inStock?: boolean
  madeToOrder?: boolean
  minPrice?: number
  maxPrice?: number
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'featured' | 'name'
}): Promise<ProductWithImages[]> {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(`
      *,
      product_images(*),
      categories(*)
    `)
    .eq('is_active', true)

  if (params?.featured) query = query.eq('is_featured', true)
  if (params?.limit) query = query.limit(params.limit)
  if (params?.categoryId) query = query.eq('category_id', params.categoryId)
  if (params?.search) query = query.ilike('name', `%${params.search}%`)
  if (params?.digital !== undefined) query = query.eq('is_digital', params.digital)
  if (params?.inStock) query = query.gt('stock', 0)
  if (params?.madeToOrder !== undefined) query = query.eq('made_to_order', params.madeToOrder)
  if (params?.minPrice !== undefined) query = query.gte('price', params.minPrice)
  if (params?.maxPrice !== undefined) query = query.lte('price', params.maxPrice)

  switch (params?.sortBy) {
    case 'price_asc':  query = query.order('price', { ascending: true });  break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'featured':   query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false }); break
    case 'name':       query = query.order('name', { ascending: true });   break
    default:           query = query.order('created_at', { ascending: false })
  }

  const { data } = await query
  let results = (data ?? []) as ProductWithImages[]

  // Filter by category slug (join filtering)
  if (params?.categorySlug) {
    results = results.filter(p => p.categories?.slug === params.categorySlug)
  }

  return results
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      product_images(*),
      categories(*),
      product_variants(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data as ProductWithVariants | null
}

export async function getFeaturedProducts(limit = 4): Promise<ProductWithImages[]> {
  return getProducts({ featured: true, limit })
}

export async function getNewProducts(limit = 8): Promise<ProductWithImages[]> {
  return getProducts({ limit })
}

export async function getSiteConfig(): Promise<Record<string, string>> {
  const supabase = await createClient()
  const { data } = await supabase.from('site_config').select('key, value')
  if (!data) return {}
  return Object.fromEntries(data.map((r) => [r.key, r.value]))
}
