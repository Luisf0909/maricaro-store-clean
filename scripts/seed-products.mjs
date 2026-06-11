/**
 * seed-products.mjs
 * Carga los productos iniciales de Maria Caro Store en Supabase.
 * Uso: node scripts/seed-products.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─────────────────────────────────────────────────────────────
// DATOS DE PRODUCTOS
// ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    name: 'Devocionales',
    slug: 'devocionales',
    description: 'Cuadernos para tu tiempo con Dios cada mañana',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    sort_order: 1,
  },
  {
    name: 'Planners',
    slug: 'planners',
    description: 'Planificadores semanales y mensuales con propósito',
    image_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80',
    sort_order: 2,
  },
  {
    name: 'Agendas',
    slug: 'agendas',
    description: 'Agendas para organizar tu año con fe y propósito',
    image_url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&q=80',
    sort_order: 3,
  },
  {
    name: 'Digitales',
    slug: 'digitales',
    description: 'PDFs, planners digitales y recursos para descargar al instante',
    image_url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80',
    sort_order: 4,
  },
]

// Función auxiliar para construir el objeto de producto
function product(categorySlug, {
  name, slug, description, price, compare_price = null,
  stock = 0, is_digital = false, is_featured = false, sku,
  made_to_order = false, meta_title = null, meta_description = null,
}) {
  return {
    _categorySlug: categorySlug,
    name, slug, description, price, compare_price,
    stock, is_digital, is_featured, sku,
    is_active: true, made_to_order,
    meta_title: meta_title ?? name,
    meta_description: meta_description ?? description?.slice(0, 155),
  }
}

// Imágenes por slug (Unsplash — reemplazar con fotos reales del negocio)
const PRODUCT_IMAGES = {
  // ── DEVOCIONALES ──────────────────────────────────────────────
  'devocional-amanecer-con-dios': [
    { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=85', alt: 'Devocional Amanecer con Dios - tapa dura beige con estampado', is_primary: true },
    { url: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=85', alt: 'Páginas interiores del devocional con espacio para escritura', is_primary: false },
    { url: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&q=85', alt: 'Detalle de la portada minimalista del devocional', is_primary: false },
  ],
  'diario-de-oracion-paz-profunda': [
    { url: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&q=85', alt: 'Diario de Oración Paz Profunda - manos escribiendo', is_primary: true },
    { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=85', alt: 'Interior del diario de oración con secciones guiadas', is_primary: false },
  ],
  'devocional-365-dias-de-gracia': [
    { url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=85', alt: 'Devocional 365 Días de Gracia - colección premium', is_primary: true },
    { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=85', alt: 'Detalle de la encuadernación premium del devocional', is_primary: false },
    { url: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=85', alt: 'Vista de páginas interiores con versículos bíblicos', is_primary: false },
  ],
  'cuaderno-de-versiculos-luz': [
    { url: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=85', alt: 'Cuaderno de Versículos Luz - pluma sobre páginas', is_primary: true },
    { url: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&q=85', alt: 'Ejemplo de página con versículo decorado', is_primary: false },
  ],

  // ── PLANNERS ──────────────────────────────────────────────────
  'planner-mensual-proposito-2025': [
    { url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=85', alt: 'Planner Mensual Propósito 2025 - organizado sobre escritorio', is_primary: true },
    { url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=85', alt: 'Vista mensual del planner con sección de metas', is_primary: false },
    { url: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&q=85', alt: 'Detalle de la tapa dura del planner con marcapáginas', is_primary: false },
  ],
  'planner-semanal-fe-y-orden': [
    { url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=85', alt: 'Planner Semanal Fe y Orden - vista semanal expandida', is_primary: true },
    { url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=85', alt: 'Interior del planner semanal con tracker de hábitos', is_primary: false },
  ],
  'planner-devocional-premium': [
    { url: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&q=85', alt: 'Planner Devocional Premium - cuadernos apilados con café', is_primary: true },
    { url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=85', alt: 'Doble página del planner con espacio devocional diario', is_primary: false },
    { url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=85', alt: 'Tapa dura con elástico del planner premium', is_primary: false },
  ],

  // ── AGENDAS ───────────────────────────────────────────────────
  'agenda-anual-discernimiento-2025': [
    { url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=85', alt: 'Agenda Anual Discernimiento 2025 - persona escribiendo', is_primary: true },
    { url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=85', alt: 'Sección de metas anuales con versículo guía', is_primary: false },
    { url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=85', alt: 'Vista general de la agenda con accesorios', is_primary: false },
  ],
  'agenda-compacta-de-fe': [
    { url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=85', alt: 'Agenda Compacta de Fe - formato A6 con pluma', is_primary: true },
    { url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=85', alt: 'Interior de la agenda compacta con versículo diario', is_primary: false },
  ],
  'agenda-de-vida-cristiana': [
    { url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=85', alt: 'Agenda de Vida Cristiana - sistema completo de planificación', is_primary: true },
    { url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=85', alt: 'Sección de visión de vida y metas anuales', is_primary: false },
    { url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=85', alt: 'Tapa premium de la agenda con acabado mate', is_primary: false },
  ],

  // ── DIGITALES ─────────────────────────────────────────────────
  'pack-devocional-printable-pdf': [
    { url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=85', alt: 'Pack Devocional PDF - vista previa de páginas imprimibles', is_primary: true },
    { url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=85', alt: 'Ejemplo de hoja devocional impresa en mesa de trabajo', is_primary: false },
  ],
  'planner-digital-tablet-2025': [
    { url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=85', alt: 'Planner Digital 2025 para tablet - interfaz en GoodNotes', is_primary: true },
    { url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=85', alt: 'Vista del planner digital con links de navegación activos', is_primary: false },
  ],
  'guia-de-estudio-biblico-digital': [
    { url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=85', alt: 'Guía de Estudio Bíblico - portada digital', is_primary: true },
    { url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=85', alt: 'Vista previa de las páginas de estudio bíblico', is_primary: false },
  ],
  'pack-fondos-versiculos-hd': [
    { url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=85', alt: 'Pack Fondos de Versículos HD - diseño minimalista botánico', is_primary: true },
    { url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=85', alt: 'Collage de fondos de pantalla con versículos bíblicos', is_primary: false },
  ],
}

// Definición de todos los productos
const PRODUCTS = [
  // ─── DEVOCIONALES (4 productos) ──────────────────────────────
  product('devocionales', {
    name:          'Devocional Amanecer con Dios',
    slug:          'devocional-amanecer-con-dios',
    description:   'Cuaderno devocional de 120 páginas con tapa dura premium en color beige arena. Diseñado para guiar tu tiempo matutino con Dios: incluye espacio para el versículo del día, oración personal, reflexión y lista de agradecimientos. Papel de 90g sin sangrado, perfecto para plumas y marcadores. Ideal para comenzar cada día con propósito y fe.',
    price:         12990,
    compare_price: 15990,
    stock:         0,
    is_featured:   true,
    sku:           'MC-DEV-001',
    made_to_order: true,
    meta_title:    'Devocional Amanecer con Dios | Maria Caro Store',
    meta_description: 'Cuaderno devocional de 120 páginas con tapa dura. Espacio para versículo, oración y reflexión diaria. Hecho a pedido en Chile.',
  }),
  product('devocionales', {
    name:          'Diario de Oración Paz Profunda',
    slug:          'diario-de-oracion-paz-profunda',
    description:   'Un diario íntimo de 96 páginas para registrar tus conversaciones con Dios. Diseño minimalista en tonos agua con secciones estructuradas para peticiones de oración, respuestas recibidas y memorias de fe. Tapa blanda con acabado mate resistente. El compañero perfecto para profundizar tu vida de oración.',
    price:         9990,
    compare_price: null,
    stock:         0,
    is_featured:   true,
    sku:           'MC-DEV-002',
    made_to_order: true,
    meta_description: 'Diario de oración de 96 páginas. Secciones para peticiones, respuestas y memorias de fe. Diseño minimalista en tonos agua.',
  }),
  product('devocionales', {
    name:          'Devocional 365 Días de Gracia',
    slug:          'devocional-365-dias-de-gracia',
    description:   'Un año completo de crecimiento espiritual en 200 páginas. Cada día incluye un versículo cuidadosamente seleccionado, reflexión profunda, preguntas para la meditación y espacio para tus propias notas. Encuadernación cosida premium, marcapáginas integrado y tapa dura con diseño exclusivo de Maria Caro Store.',
    price:         15990,
    compare_price: 19990,
    stock:         0,
    is_featured:   true,
    sku:           'MC-DEV-003',
    made_to_order: true,
    meta_description: 'Devocional anual de 200 páginas. Versículo, reflexión y espacio de notas cada día. Encuadernación premium con tapa dura.',
  }),
  product('devocionales', {
    name:          'Cuaderno de Versículos Luz',
    slug:          'cuaderno-de-versiculos-luz',
    description:   'Cuaderno especial de 80 páginas para memorizar y meditar en versículos bíblicos. Organizado por temas (fe, esperanza, amor, propósito, identidad) con espacio para escribir, colorear e ilustrar cada pasaje. Tapa blanda con acabado mate premium, formato A5. Perfecto para quienes disfrutan expresar su fe de forma creativa.',
    price:         8990,
    compare_price: null,
    stock:         0,
    is_featured:   false,
    sku:           'MC-DEV-004',
    made_to_order: true,
    meta_description: 'Cuaderno de 80 páginas para versículos bíblicos. Organizado por temas con espacio para escribir y colorear. Formato A5.',
  }),

  // ─── PLANNERS (3 productos) ───────────────────────────────────
  product('planners', {
    name:          'Planner Mensual Propósito 2025',
    slug:          'planner-mensual-proposito-2025',
    description:   'Planificador mensual de 12 meses diseñado para vivir 2025 con intención y fe. Vista mensual y semanal, sección de metas del mes con filtro espiritual, versículo inspiracional mensual, tracker de hábitos y espacio para gratitud semanal. 160 páginas, tapa dura con elástico de cierre. Formato A5.',
    price:         14990,
    compare_price: 18990,
    stock:         0,
    is_featured:   true,
    sku:           'MC-PLN-001',
    made_to_order: true,
    meta_description: 'Planner mensual 2025 de 160 páginas. Vista mensual/semanal, metas, tracker de hábitos y espacio devocional. Tapa dura A5.',
  }),
  product('planners', {
    name:          'Planner Semanal Fe y Orden',
    slug:          'planner-semanal-fe-y-orden',
    description:   'Un planificador semanal sin fechas para usar cuando quieras. Cada semana inicia con un versículo motivacional y espacio para tus tres prioridades de fe. Vista semanal expandida con bloques de tiempo, tracker de hábitos espirituales y sección de reflexión semanal. 180 páginas, tapa blanda resistente.',
    price:         11990,
    compare_price: null,
    stock:         0,
    is_featured:   true,
    sku:           'MC-PLN-002',
    made_to_order: true,
    meta_description: 'Planner semanal sin fechas. Vista expandida con versículo, prioridades de fe y tracker de hábitos. 180 páginas tapa blanda.',
  }),
  product('planners', {
    name:          'Planner Devocional Premium',
    slug:          'planner-devocional-premium',
    description:   'La experiencia de planificación más completa de Maria Caro Store. Combina un planner ejecutivo con momentos devocionales integrados cada día. Vista diaria detallada, planning semanal y mensual, metas trimestrales y sección de crecimiento espiritual. 220 páginas, tapa dura con elástico y bolsillo interior.',
    price:         18990,
    compare_price: 23990,
    stock:         0,
    is_featured:   true,
    sku:           'MC-PLN-003',
    made_to_order: true,
    meta_description: 'Planner premium con momentos devocionales diarios. Vista diaria + semanal + mensual. 220 páginas tapa dura con bolsillo interior.',
  }),

  // ─── AGENDAS (3 productos) ─────────────────────────────────────
  product('agendas', {
    name:          'Agenda Anual Discernimiento 2025',
    slug:          'agenda-anual-discernimiento-2025',
    description:   'Agenda anual 2025 de 200 páginas para el profesional cristiano que integra fe y trabajo. Vista mensual y semanal para todo el año, sección de metas anuales con reflexión de discernimiento, espacio para oración intercesora semanal y registro de citas. Tapa dura premium con marcapáginas de seda. Formato A5.',
    price:         16990,
    compare_price: 21990,
    stock:         0,
    is_featured:   true,
    sku:           'MC-AGN-001',
    made_to_order: true,
    meta_description: 'Agenda anual 2025 para el profesional cristiano. 200 páginas con metas, oración intercesora y registro de citas. Tapa dura A5.',
  }),
  product('agendas', {
    name:          'Agenda Compacta de Fe',
    slug:          'agenda-compacta-de-fe',
    description:   'La agenda perfecta para llevar siempre contigo. Formato compacto A6, 140 páginas con planificación semanal, espacio para una oración breve cada día y versículo semanal. Tapa blanda resistente con cantos redondeados. Disponible en colores: beige arena, verde agua y rosa polvos.',
    price:         12990,
    compare_price: null,
    stock:         0,
    is_featured:   false,
    sku:           'MC-AGN-002',
    made_to_order: true,
    meta_description: 'Agenda compacta A6 de 140 páginas. Planificación semanal con oración diaria y versículo. Disponible en 3 colores.',
  }),
  product('agendas', {
    name:          'Agenda de Vida Cristiana',
    slug:          'agenda-de-vida-cristiana',
    description:   'Más que una agenda: un sistema completo de planificación de vida basado en principios bíblicos. Incluye sección de visión de vida, metas en 7 áreas clave (fe, familia, finanzas, salud, amistades, carrera, descanso), planificación anual, trimestral, mensual y semanal. 240 páginas, tapa dura con textura premium. El regalo de fe más completo.',
    price:         19990,
    compare_price: 25990,
    stock:         0,
    is_featured:   true,
    sku:           'MC-AGN-003',
    made_to_order: true,
    meta_description: 'Sistema completo de planificación de vida cristiana. Metas en 7 áreas, visión de vida y planificación anual/mensual/semanal. 240 páginas.',
  }),

  // ─── DIGITALES (4 productos) ──────────────────────────────────
  product('digitales', {
    name:          'Pack Devocional Imprimible PDF',
    slug:          'pack-devocional-printable-pdf',
    description:   'Pack de 30 hojas devocionales en PDF listas para imprimir en casa. Incluye: hoja de oración diaria, tracker de gratitud semanal, hoja de versículo para memorizar y mini planner de fe mensual. Diseños minimalistas en paleta cálida (beige, terracota y verde agua). Formato A4 y carta. Descarga inmediata tras el pago.',
    price:         4990,
    compare_price: 7990,
    stock:         999,
    is_digital:    true,
    is_featured:   true,
    sku:           'MC-DIG-001',
    made_to_order: false,
    meta_description: 'Pack 30 hojas devocionales en PDF para imprimir. Oración diaria, tracker de gratitud y planner mensual. Descarga inmediata.',
  }),
  product('digitales', {
    name:          'Planner Digital 2025 para Tablet',
    slug:          'planner-digital-tablet-2025',
    description:   'Planner digital interactivo en PDF para usar en tu tablet con GoodNotes, Notability o Xodo. Incluye dashboard anual, vista mensual, planificador semanal, tracker de versículos, espacio devocional diario y páginas de notas. Completamente hipervinculado con tabs de navegación. Compatible con iPad, Android y Surface. Descarga inmediata.',
    price:         5990,
    compare_price: 8990,
    stock:         999,
    is_digital:    true,
    is_featured:   true,
    sku:           'MC-DIG-002',
    made_to_order: false,
    meta_description: 'Planner digital 2025 para tablet. Compatible con GoodNotes y Notability. Hipervinculado con tracker de versículos. Descarga inmediata.',
  }),
  product('digitales', {
    name:          'Guía de Estudio Bíblico Digital',
    slug:          'guia-de-estudio-biblico-digital',
    description:   'Guía completa de 40 páginas en PDF para estudiar la Biblia de forma estructurada. Incluye método SOAP, plantillas de observación, interpretación y aplicación, páginas para perfil de personajes bíblicos, estudio de palabras en contexto y guía de oración interactiva. Perfecta para grupos pequeños o estudio personal. Descarga inmediata.',
    price:         3990,
    compare_price: 5990,
    stock:         999,
    is_digital:    true,
    is_featured:   false,
    sku:           'MC-DIG-003',
    made_to_order: false,
    meta_description: 'Guía de estudio bíblico en PDF. Método SOAP, plantillas de observación y aplicación. Para uso personal o grupos. Descarga inmediata.',
  }),
  product('digitales', {
    name:          'Pack Fondos Versículos HD',
    slug:          'pack-fondos-versiculos-hd',
    description:   'Colección de 20 fondos de pantalla para celular y computador con versículos bíblicos en diseño minimalista. Paleta botánica en beige, verde y dorado suave. Resoluciones HD (1080×1920) y Full HD (1920×1080) incluidas. Perfectos para recordarte la Palabra a lo largo del día. Compatible con iPhone, Android y escritorio. Descarga inmediata.',
    price:         2990,
    compare_price: 4990,
    stock:         999,
    is_digital:    true,
    is_featured:   false,
    sku:           'MC-DIG-004',
    made_to_order: false,
    meta_description: '20 fondos de pantalla con versículos bíblicos en diseño minimalista. Resolución HD para celular y computador. Descarga inmediata.',
  }),
]

// ─────────────────────────────────────────────────────────────
// FUNCIONES DE INSERCIÓN
// ─────────────────────────────────────────────────────────────

async function upsertCategories() {
  console.log('\n📦  Cargando categorías...')
  const { data, error } = await supabase
    .from('categories')
    .upsert(CATEGORIES, { onConflict: 'slug', ignoreDuplicates: false })
    .select('id, slug, name')

  if (error) {
    console.error('  ❌ Error en categorías:', error.message)
    throw error
  }
  console.log(`  ✅ ${data.length} categorías cargadas`)
  return Object.fromEntries(data.map(c => [c.slug, c.id]))
}

async function upsertProducts(categoryIds) {
  console.log('\n🛍️  Cargando productos...')
  const results = { ok: 0, skip: 0, fail: 0 }

  for (const p of PRODUCTS) {
    const { _categorySlug, ...productData } = p
    const category_id = categoryIds[_categorySlug]
    if (!category_id) {
      console.warn(`  ⚠️  Sin categoría para ${p.slug}`)
      continue
    }

    const { data, error } = await supabase
      .from('products')
      .upsert({ ...productData, category_id }, { onConflict: 'slug', ignoreDuplicates: false })
      .select('id, slug, name')
      .single()

    if (error) {
      console.error(`  ❌ ${p.slug}: ${error.message}`)
      results.fail++
    } else {
      console.log(`  ✅ ${data.name}`)
      results.ok++

      // Insert images
      await insertImages(data.id, data.slug)
    }
  }

  console.log(`\n  📊 Resumen: ${results.ok} ok · ${results.skip} skip · ${results.fail} error`)
  return results
}

async function insertImages(productId, slug) {
  const images = PRODUCT_IMAGES[slug]
  if (!images?.length) return

  // Delete existing images first
  await supabase.from('product_images').delete().eq('product_id', productId)

  const rows = images.map((img, idx) => ({
    product_id: productId,
    url:        img.url,
    alt_text:   img.alt,
    sort_order: idx + 1,
    is_primary: img.is_primary,
  }))

  const { error } = await supabase.from('product_images').insert(rows)
  if (error) console.warn(`    ⚠️  Imágenes de ${slug}: ${error.message}`)
  else console.log(`    🖼️  ${rows.length} imagen(es) cargadas`)
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('   MARIA CARO STORE — Carga de productos iniciales')
  console.log(`   Supabase: ${SUPABASE_URL}`)
  console.log('═══════════════════════════════════════════════════════')

  try {
    const categoryIds = await upsertCategories()
    await upsertProducts(categoryIds)

    console.log('\n═══════════════════════════════════════════════════════')
    console.log('   ✅  Carga completada exitosamente')
    console.log('   📌  Los productos están en modo "A pedido" (made_to_order).')
    console.log('   💡  Actualiza el stock en el admin para cambiar disponibilidad.')
    console.log('═══════════════════════════════════════════════════════\n')
  } catch (err) {
    console.error('\n❌  Error fatal:', err)
    process.exit(1)
  }
}

main()
