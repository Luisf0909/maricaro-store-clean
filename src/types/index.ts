export type CartItem = {
  productId: string
  variantId?: string
  name: string
  variantName?: string
  price: number
  imageUrl?: string
  quantity: number
  slug: string
  isDigital?: boolean
}

export type CLPAmount = number

export type ProductWithImages = {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  compare_price: number | null
  stock: number
  made_to_order: boolean
  is_digital: boolean
  digital_file_path: string | null
  digital_file_name: string | null
  video_url: string | null
  sku: string | null
  is_featured: boolean
  is_active: boolean
  category_id: string | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  product_images: ProductImage[]
  categories: Category | null
}

export type ProductWithVariants = ProductWithImages & {
  product_variants: ProductVariant[]
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
}

export type ProductImage = {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
}

export type ProductVariant = {
  id: string
  product_id: string
  name: string
  value: string
  price_modifier: number
  stock: number
  sku: string | null
  is_active: boolean
}

export type Order = {
  id: string
  order_number: string
  user_id: string | null
  is_guest: boolean
  customer_rut: string | null
  customer_email: string | null
  shipping_full_name: string
  shipping_phone: string | null
  shipping_address: string
  shipping_apartment: string | null
  shipping_city: string
  shipping_region: string
  shipping_zip: string | null
  subtotal: number
  shipping_cost: number
  discount: number
  coupon_id: string | null
  coupon_code: string | null
  coupon_discount: number
  tax_amount: number
  total: number
  payment_method: 'mercadopago' | 'flow_webpay' | null
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_id: string | null
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  customer_notes: string | null
  admin_notes: string | null
  paid_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  product_name: string
  variant_name: string | null
  product_sku: string | null
  product_image_url: string | null
  quantity: number
  unit_price: number
  subtotal: number
}

export type OrderWithItems = Order & {
  order_items: OrderItem[]
}

export type ChileRegion = {
  id: number
  name: string
  code: string
}

export type Coupon = {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_uses: number | null
  uses_count: number
  one_per_customer: boolean
  expires_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CouponValidationResult =
  | { valid: true; coupon: Coupon; discountAmount: number }
  | { valid: false; error: string }

export type DownloadToken = {
  id: string
  order_id: string
  product_id: string
  token: string
  download_count: number
  max_downloads: number
  expires_at: string
  created_at: string
  products?: { name: string; digital_file_name: string | null }
}

export type SiteConfig = {
  key: string
  value: string
  label: string
  type: 'text' | 'textarea' | 'image_url'
  section: string
  updated_at: string
}

// ── Order with full relations ──────────────────────────────────────────────
export type OrderWithFull = Order & {
  order_items: OrderItem[]
  order_status_history?: OrderStatusHistory[]
  profiles?: { full_name: string | null; phone: string | null } | null
}

export type OrderStatusHistory = {
  id: string
  order_id: string
  previous_status: string | null
  new_status: string
  previous_payment_status: string | null
  new_payment_status: string | null
  changed_by_user_id: string | null
  changed_by_name: string | null
  comment: string | null
  customer_notified: boolean
  tracking_code: string | null
  tracking_url: string | null
  carrier: string | null
  created_at: string
}

// ── GiftCards ──────────────────────────────────────────────────────────────
export type GiftCard = {
  id: string
  code: string
  initial_amount: number
  balance: number
  currency: string
  status: 'active' | 'used' | 'expired' | 'cancelled'
  expires_at: string | null
  issued_by: string | null
  issued_to_email: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export type GiftCardTransaction = {
  id: string
  gift_card_id: string
  order_id: string | null
  amount: number
  balance_after: number
  description: string
  created_at: string
}

export type GiftCardValidationResult =
  | { valid: true; giftCard: GiftCard; applicableAmount: number }
  | { valid: false; error: string }

// ── Loyalty ────────────────────────────────────────────────────────────────
export type LoyaltyAccount = {
  id: string
  user_id: string
  points_balance: number
  points_earned: number
  points_redeemed: number
  points_expired: number
  created_at: string
  updated_at: string
}

export type LoyaltyTransaction = {
  id: string
  account_id: string
  user_id: string
  order_id: string | null
  type: 'earn' | 'redeem' | 'expire' | 'adjust' | 'refund'
  points: number
  balance_after: number
  description: string
  expires_at: string | null
  created_at: string
}

export type LoyaltyConfig = {
  id: number
  points_per_clp: number
  clp_per_point: number
  min_points_redeem: number
  points_expiry_days: number | null
  is_active: boolean
  updated_at: string
}

// ── Reviews ────────────────────────────────────────────────────────────────
export type ProductReview = {
  id: string
  product_id: string
  user_id: string | null
  order_id: string | null
  is_verified: boolean
  rating: number
  title: string | null
  body: string | null
  status: 'pending' | 'approved' | 'rejected'
  guest_name: string | null
  guest_email: string | null
  helpful_votes: number
  created_at: string
  updated_at: string
  profiles?: { full_name: string | null } | null
}

export type ProductRatingSummary = {
  product_id: string
  review_count: number
  avg_rating: number
  five_star: number
  four_star: number
  three_star: number
  two_star: number
  one_star: number
}

// ── Wishlist ───────────────────────────────────────────────────────────────
export type WishlistItem = {
  id: string
  user_id: string
  product_id: string
  created_at: string
  products?: ProductWithImages
}

// ── Banners / CMS ──────────────────────────────────────────────────────────
export type Banner = {
  id: string
  title: string
  subtitle: string | null
  cta_text: string | null
  cta_url: string | null
  image_url: string | null
  image_url_mobile: string | null
  bg_color: string
  text_color: string
  position: 'hero' | 'strip' | 'promo' | 'sidebar'
  sort_order: number
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}

export type HomepageSection = {
  id: string
  type: 'hero_banner' | 'category_grid' | 'featured_products' | 'new_arrivals' | 'promo_banner' | 'inspiration' | 'newsletter' | 'custom_html'
  title: string | null
  subtitle: string | null
  config: Record<string, unknown>
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── Analytics ─────────────────────────────────────────────────────────────
export type SalesAnalytics = {
  period: string
  total_revenue: number
  order_count: number
  avg_ticket: number
  physical_revenue: number
  digital_revenue: number
}

export type ProductAnalytics = {
  product_id: string
  product_name: string
  units_sold: number
  revenue: number
  category: string | null
}

export type CustomerSegment = {
  user_id: string
  full_name: string | null
  email: string
  order_count: number
  total_spent: number
  last_order_at: string | null
  accepts_marketing: boolean
}

// ── Email log ─────────────────────────────────────────────────────────────
export type EmailNotification = {
  id: string
  to_email: string
  to_name: string | null
  subject: string
  template: string
  order_id: string | null
  user_id: string | null
  status: 'sent' | 'failed' | 'pending'
  provider_id: string | null
  error: string | null
  created_at: string
}

// ── Extended Order type with new fields ───────────────────────────────────
export type OrderExtended = Order & {
  gift_card_id: string | null
  gift_card_code: string | null
  gift_card_discount: number
  loyalty_points_used: number
  loyalty_discount: number
  tracking_code: string | null
  tracking_url: string | null
  carrier: string | null
  accepts_marketing: boolean
}
