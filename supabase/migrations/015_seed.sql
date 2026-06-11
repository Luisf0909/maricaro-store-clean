-- ================================================================
-- 015_seed.sql — Test products for MariaCaroStore
-- Safe to run multiple times (ON CONFLICT DO NOTHING / DO UPDATE)
-- ================================================================

-- ── 1. CATEGORIES ────────────────────────────────────────────────
INSERT INTO categories (id, name, slug, description, sort_order, is_active)
VALUES
  (gen_random_uuid(), 'Devocionales', 'devocionales', 'Cuadernos para tu tiempo con Dios cada mañana', 1, true),
  (gen_random_uuid(), 'Planners',     'planners',     'Planificadores semanales y mensuales con propósito', 2, true),
  (gen_random_uuid(), 'Agendas',      'agendas',      'Agendas para organizar tu año con fe', 3, true)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      is_active = true;

-- ── 2. DEVOCIONALES ──────────────────────────────────────────────

INSERT INTO products (id, name, slug, description, price, compare_price, stock, is_digital, is_featured, is_active, category_id, sku, made_to_order)
SELECT gen_random_uuid(),
  'Cuaderno Devocional Amanecer',
  'cuaderno-devocional-amanecer',
  'Cuaderno de 120 páginas con tapa dura premium diseñado para guiar tu tiempo devocional matutino. Incluye espacio para versículo del día, oración, reflexión personal y lista de agradecimientos. Papel de 90g sin sangrado para plumas y marcadores.',
  12990, 15990, 50, false, true, true, c.id, 'DEV-001', false
FROM categories c WHERE c.slug = 'devocionales'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_price, stock, is_digital, is_featured, is_active, category_id, sku, made_to_order)
SELECT gen_random_uuid(),
  'Diario de Oración Paz Profunda',
  'diario-de-oracion-paz-profunda',
  'Un diario íntimo de 96 páginas para registrar tus conversaciones con Dios. Diseño minimalista en tonos agua con secciones para peticiones, respuestas recibidas y memorias de fe. El compañero perfecto para tu crecimiento espiritual.',
  9990, NULL, 30, false, true, true, c.id, 'DEV-002', false
FROM categories c WHERE c.slug = 'devocionales'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_price, stock, is_digital, is_featured, is_active, category_id, sku, made_to_order)
SELECT gen_random_uuid(),
  'Devocional 365 Días de Gracia',
  'devocional-365-dias-de-gracia',
  'Un devocional completo de 200 páginas para un año entero de crecimiento espiritual. Con reflexiones profundas, versículos seleccionados, preguntas para la reflexión y espacio para tus propias notas. Diseño premium con marcapáginas integrado.',
  15990, 19990, 25, false, true, true, c.id, 'DEV-003', false
FROM categories c WHERE c.slug = 'devocionales'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_price, stock, is_digital, is_featured, is_active, category_id, sku, made_to_order)
SELECT gen_random_uuid(),
  'Cuaderno de Versículos Luz',
  'cuaderno-de-versiculos-luz',
  'Cuaderno especial de 80 páginas para memorizar y meditar en versículos bíblicos. Con secciones organizadas por tema (fe, esperanza, amor, propósito) y espacio para colorear e ilustrar cada pasaje. Tapa blanda con acabado mate premium.',
  8990, NULL, 60, false, false, true, c.id, 'DEV-004', false
FROM categories c WHERE c.slug = 'devocionales'
ON CONFLICT (slug) DO NOTHING;

-- ── 3. PLANNERS ──────────────────────────────────────────────────

INSERT INTO products (id, name, slug, description, price, compare_price, stock, is_digital, is_featured, is_active, category_id, sku, made_to_order)
SELECT gen_random_uuid(),
  'Planner Mensual Propósito',
  'planner-mensual-proposito',
  'Planner mensual de 12 meses diseñado para vivir con intención y fe. Incluye vista mensual y semanal, sección de metas del mes, versículo inspiracional, espacio para reflexión y seguimiento de hábitos espirituales. 160 páginas, tapa dura.',
  14990, 18990, 40, false, true, true, c.id, 'PLN-001', false
FROM categories c WHERE c.slug = 'planners'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_price, stock, is_digital, is_featured, is_active, category_id, sku, made_to_order)
SELECT gen_random_uuid(),
  'Agenda Semanal de Fe 2025',
  'agenda-semanal-de-fe-2025',
  'Planificador semanal para todo el año 2025 con perspectiva cristiana. Cada semana inicia con un versículo motivacional y espacio para tus prioridades de fe. Vista semanal expandida, seguimiento de hábitos y sección de reflexión mensual. 180 páginas.',
  11990, NULL, 35, false, true, true, c.id, 'PLN-002', false
FROM categories c WHERE c.slug = 'planners'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_price, stock, is_digital, is_featured, is_active, category_id, sku, made_to_order)
SELECT gen_random_uuid(),
  'Planner Devocional Premium',
  'planner-devocional-premium',
  'La experiencia de planificación más completa. Combina planificador ejecutivo de alta calidad con momentos devocionales integrados. Incluye vista diaria detallada, planning semanal, metas mensuales y trimestrales, y sección de crecimiento espiritual. 220 páginas, tapa dura con elástico.',
  18990, 23990, 20, false, true, true, c.id, 'PLN-003', false
FROM categories c WHERE c.slug = 'planners'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_price, stock, is_digital, is_featured, is_active, category_id, sku, made_to_order)
SELECT gen_random_uuid(),
  'Cuaderno Bullet Journal Cristiano',
  'cuaderno-bullet-journal-cristiano',
  'Cuaderno dotted de 160 páginas para tu sistema Bullet Journal con perspectiva de fe. Páginas numeradas, índice, plantillas de inicio incluidas y guía de símbolos para tracking espiritual. Cubierta texturizada en verde agua, tamaño A5.',
  13990, NULL, 45, false, false, true, c.id, 'PLN-004', false
FROM categories c WHERE c.slug = 'planners'
ON CONFLICT (slug) DO NOTHING;

-- ── 4. AGENDAS ──────────────────────────────────────────────────

INSERT INTO products (id, name, slug, description, price, compare_price, stock, is_digital, is_featured, is_active, category_id, sku, made_to_order)
SELECT gen_random_uuid(),
  'Agenda Anual Discernimiento',
  'agenda-anual-discernimiento',
  'Agenda anual de 200 páginas con diseño premium para el profesional cristiano que busca integrar fe y trabajo. Vista mensual y semanal, sección de metas anuales, reflexiones de discernimiento y espacio para oración intercesora. Con registro de citas y contactos.',
  16990, 21990, 30, false, true, true, c.id, 'AGN-001', false
FROM categories c WHERE c.slug = 'agendas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_price, stock, is_digital, is_featured, is_active, category_id, sku, made_to_order)
SELECT gen_random_uuid(),
  'Agenda Compacta de Fe',
  'agenda-compacta-de-fe',
  'La agenda perfecta para llevar siempre contigo. Formato compacto (A6), 140 páginas, con planificación semanal y espacio para una oración breve cada día. Tapa blanda resistente, ideal para quienes tienen una agenda activa y quieren mantener su fe en el centro.',
  12990, NULL, 55, false, false, true, c.id, 'AGN-002', false
FROM categories c WHERE c.slug = 'agendas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_price, stock, is_digital, is_featured, is_active, category_id, sku, made_to_order)
SELECT gen_random_uuid(),
  'Planificador de Vida Cristiana',
  'planificador-de-vida-cristiana',
  'Más que una agenda: un sistema completo de planificación de vida basado en principios bíblicos. Incluye sección de visión de vida, metas en las 7 áreas clave (fe, familia, finanzas, salud, amistades, carrera, ocio), planificación anual, trimestral, mensual y semanal. 240 páginas, tapa dura premium.',
  19990, 25990, 15, false, true, true, c.id, 'AGN-003', false
FROM categories c WHERE c.slug = 'agendas'
ON CONFLICT (slug) DO NOTHING;

-- ── 5. PRODUCTOS DIGITALES ──────────────────────────────────────

INSERT INTO products (id, name, slug, description, price, compare_price, stock, is_digital, is_featured, is_active, category_id, sku, made_to_order)
SELECT gen_random_uuid(),
  'Pack PDF Devocionales para Imprimir',
  'pack-pdf-devocionales-para-imprimir',
  'Pack de 30 hojas devocionales en PDF listas para imprimir en casa. Incluye: hoja de oración diaria, tracker de gratitud semanal, hoja de versículo para memorizar y mini planner de fe mensual. Diseños minimalistas en tonos agua y rosa pastel. Formato A4 y carta.',
  4990, 7990, 999, true, true, true, c.id, 'DIG-001', false
FROM categories c WHERE c.slug = 'devocionales'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_price, stock, is_digital, is_featured, is_active, category_id, sku, made_to_order)
SELECT gen_random_uuid(),
  'Planner Digital Mi Tiempo con Dios',
  'planner-digital-mi-tiempo-con-dios',
  'Planner digital interactivo en PDF para usar en tablet (compatible con GoodNotes, Notability y Xodo). Incluye dashboard anual, vista mensual, planificador semanal, tracker de versículos y espacio devocional diario. Hipervinculado y con links de navegación.',
  5990, 8990, 999, true, true, true, c.id, 'DIG-002', false
FROM categories c WHERE c.slug = 'planners'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, description, price, compare_price, stock, is_digital, is_featured, is_active, category_id, sku, made_to_order)
SELECT gen_random_uuid(),
  'Pack Fondos de Pantalla Devocionales',
  'pack-fondos-de-pantalla-devocionales',
  'Colección de 20 fondos de pantalla para celular y computador con versículos bíblicos y diseños espirituales minimalistas. Colores en paleta agua, rosa y dorado. Resolución HD y 4K. Perfectos para recordarte la Palabra durante el día.',
  2990, 4990, 999, true, false, true, c.id, 'DIG-003', false
FROM categories c WHERE c.slug = 'devocionales'
ON CONFLICT (slug) DO NOTHING;

-- ── 6. PRODUCT IMAGES ──────────────────────────────────────────
-- Uses ?auto=format&fit=crop&w=600&q=80 for optimized Unsplash images

-- DEV-001 Cuaderno Devocional Amanecer
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), p.id,
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  'Cuaderno Devocional Amanecer - tapa dura con diseño minimalista',
  1, true
FROM products p WHERE p.slug = 'cuaderno-devocional-amanecer'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

-- DEV-002 Diario de Oración
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), p.id,
  'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=600&q=80',
  'Diario de Oración Paz Profunda - manos escribiendo en diario',
  1, true
FROM products p WHERE p.slug = 'diario-de-oracion-paz-profunda'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

-- DEV-003 Devocional 365 Días
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), p.id,
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80',
  'Devocional 365 Días de Gracia - colección de libros',
  1, true
FROM products p WHERE p.slug = 'devocional-365-dias-de-gracia'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

-- DEV-004 Cuaderno Versículos Luz
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), p.id,
  'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=600&q=80',
  'Cuaderno de Versículos Luz - pluma escribiendo en cuaderno',
  1, true
FROM products p WHERE p.slug = 'cuaderno-de-versiculos-luz'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

-- PLN-001 Planner Mensual Propósito
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), p.id,
  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
  'Planner Mensual Propósito - planificador organizado en escritorio',
  1, true
FROM products p WHERE p.slug = 'planner-mensual-proposito'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

-- PLN-002 Agenda Semanal de Fe
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), p.id,
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
  'Agenda Semanal de Fe 2025 - planificador con bolígrafo',
  1, true
FROM products p WHERE p.slug = 'agenda-semanal-de-fe-2025'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

-- PLN-003 Planner Devocional Premium
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), p.id,
  'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?auto=format&fit=crop&w=600&q=80',
  'Planner Devocional Premium - cuadernos apilados con café',
  1, true
FROM products p WHERE p.slug = 'planner-devocional-premium'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

-- PLN-004 Bullet Journal Cristiano
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), p.id,
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=600&q=80',
  'Cuaderno Bullet Journal Cristiano - cuadernos dotted en escritorio',
  1, true
FROM products p WHERE p.slug = 'cuaderno-bullet-journal-cristiano'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

-- AGN-001 Agenda Anual Discernimiento
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), p.id,
  'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=600&q=80',
  'Agenda Anual Discernimiento - persona escribiendo en agenda',
  1, true
FROM products p WHERE p.slug = 'agenda-anual-discernimiento'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

-- AGN-002 Agenda Compacta de Fe
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), p.id,
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
  'Agenda Compacta de Fe - pluma y agenda pequeña',
  1, true
FROM products p WHERE p.slug = 'agenda-compacta-de-fe'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

-- AGN-003 Planificador de Vida Cristiana
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), p.id,
  'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80',
  'Planificador de Vida Cristiana - laptop con cuadernos organizados',
  1, true
FROM products p WHERE p.slug = 'planificador-de-vida-cristiana'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

-- DIG-001 Pack PDF Devocionales
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), p.id,
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80',
  'Pack PDF Devocionales - setup minimalista con tablet',
  1, true
FROM products p WHERE p.slug = 'pack-pdf-devocionales-para-imprimir'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

-- DIG-002 Planner Digital
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), p.id,
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80',
  'Planner Digital - tablet con aplicación de planificación',
  1, true
FROM products p WHERE p.slug = 'planner-digital-mi-tiempo-con-dios'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

-- DIG-003 Fondos de Pantalla
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), p.id,
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
  'Pack Fondos de Pantalla Devocionales - diseño minimalista naturaleza',
  1, true
FROM products p WHERE p.slug = 'pack-fondos-de-pantalla-devocionales'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);
