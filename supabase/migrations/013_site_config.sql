-- Dynamic site content managed from admin CMS
create table if not exists site_config (
  key        text        primary key,
  value      text        not null default '',
  label      text        not null default '',
  type       text        not null default 'text',  -- 'text' | 'textarea' | 'image_url'
  section    text        not null default 'general',
  updated_at timestamptz not null default now()
);

alter table site_config enable row level security;

-- Anyone can read (used by SSR pages)
create policy "Public read site_config"
  on site_config for select using (true);

-- Only service_role (admin API) can write
create policy "Service role write site_config"
  on site_config for all
  to service_role
  using (true)
  with check (true);

-- Default content
insert into site_config (key, value, label, type, section) values
  ('hero_title',
   'Organiza tu vida',
   'Título principal del Hero',
   'text',
   'hero'),

  ('hero_subtitle',
   'con fe',
   'Subtítulo en cursiva',
   'text',
   'hero'),

  ('hero_description',
   'Cuadernos devocionales, planners y agendas diseñados para acompañar tu caminar de fe, con estética minimalista y momentos de reflexión en cada página.',
   'Descripción del Hero',
   'textarea',
   'hero'),

  ('inspiration_title',
   '¿Qué nos inspiró?',
   'Título sección Inspiración',
   'text',
   'inspiration'),

  ('inspiration_body',
   'Todo comenzó con el deseo de caminar con Dios cada día, con intención y belleza. Creemos que la fe se vive también en los pequeños detalles: en cómo escribimos nuestras metas, en cómo reflexionamos cada mañana, en cómo organizamos el tiempo que Él nos ha dado. Cada producto nace de ese lugar íntimo de búsqueda, devoción y amor por lo que hacemos.',
   'Texto de Inspiración (cuerpo)',
   'textarea',
   'inspiration'),

  ('inspiration_verse',
   'Todo lo que hagan, háganlo de todo corazón, como si fuera para el Señor y no para los hombres.',
   'Versículo principal de Inspiración',
   'textarea',
   'inspiration'),

  ('inspiration_verse_ref',
   'Colosenses 3:23',
   'Referencia bíblica',
   'text',
   'inspiration')
on conflict (key) do nothing;
