-- 021_banners_cms.sql
-- CMS visual: banners + secciones dinÃ¡micas del home

create table banners (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  subtitle    text,
  cta_text    text,
  cta_url     text,
  image_url   text,
  image_url_mobile text,
  bg_color    text        default '#FAF7F2',
  text_color  text        default '#2C2C2C',
  position    text        not null default 'hero' check (position in ('hero','strip','promo','sidebar')),
  sort_order  integer     not null default 0,
  is_active   boolean     not null default true,
  starts_at   timestamptz,
  ends_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_banners_position on banners(position, is_active, sort_order);

-- Secciones configurables del home
create table homepage_sections (
  id          uuid        primary key default gen_random_uuid(),
  type        text        not null check (type in (
    'hero_banner',
    'category_grid',
    'featured_products',
    'new_arrivals',
    'promo_banner',
    'inspiration',
    'newsletter',
    'custom_html'
  )),
  title       text,
  subtitle    text,
  config      jsonb       not null default '{}',  -- config especÃ­fica del tipo
  sort_order  integer     not null default 0,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_homepage_sections_order on homepage_sections(sort_order, is_active);

-- Seed: secciones iniciales del home
insert into homepage_sections (type, title, sort_order, config) values
  ('hero_banner',        'Hero Principal',        10, '{"banner_position":"hero"}'),
  ('category_grid',      'Explora por categorÃ­a', 20, '{"show_all":true,"limit":6}'),
  ('featured_products',  'MÃ¡s vendidos',          30, '{"limit":8,"tag":"featured"}'),
  ('promo_banner',       'Banner promocional',    40, '{"style":"full_width"}'),
  ('new_arrivals',       'Nuevos lanzamientos',   50, '{"limit":10,"carousel":true}'),
  ('inspiration',        'InspiraciÃ³n',           60, '{"show_verse":true}'),
  ('newsletter',         'SuscripciÃ³n',           70, '{}')
on conflict do nothing;

-- RLS
alter table banners           enable row level security;
alter table homepage_sections enable row level security;

create policy "public_read_banners"           on banners           for select using (is_active = true);
create policy "admin_all_banners"             on banners           for all using (is_admin());
create policy "public_read_homepage_sections" on homepage_sections for select using (is_active = true);
create policy "admin_all_homepage_sections"   on homepage_sections for all using (is_admin());

-- Triggers
create trigger banners_updated_at
  before update on banners for each row execute procedure set_updated_at();
create trigger homepage_sections_updated_at
  before update on homepage_sections for each row execute procedure set_updated_at();

