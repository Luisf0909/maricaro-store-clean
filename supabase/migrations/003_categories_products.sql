-- 003_categories_products.sql

create table categories (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  slug         text not null unique,
  description  text,
  image_url    text,
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_categories_slug on categories(slug);

create table products (
  id              uuid primary key default uuid_generate_v4(),
  category_id     uuid references categories(id) on delete set null,
  slug            text not null unique,
  name            text not null,
  description     text,
  -- Precios en CLP (pesos chilenos enteros, sin decimales)
  price           integer not null check (price >= 0),
  compare_price   integer check (compare_price >= 0),
  stock           integer not null default 0 check (stock >= 0),
  sku             text unique,
  weight_grams    integer,
  is_active       boolean not null default true,
  is_featured     boolean not null default false,
  meta_title      text,
  meta_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_products_slug on products(slug);
create index idx_products_category on products(category_id);
create index idx_products_active_featured on products(is_active, is_featured);

create table product_images (
  id           uuid primary key default uuid_generate_v4(),
  product_id   uuid not null references products(id) on delete cascade,
  url          text not null,
  alt_text     text,
  sort_order   integer not null default 0,
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now()
);

create index idx_product_images_product on product_images(product_id, sort_order);

create table product_variants (
  id              uuid primary key default uuid_generate_v4(),
  product_id      uuid not null references products(id) on delete cascade,
  name            text not null,
  value           text not null,
  price_modifier  integer not null default 0,
  stock           integer not null default 0 check (stock >= 0),
  sku             text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_variants_product on product_variants(product_id);

create trigger categories_updated_at
  before update on categories for each row execute procedure set_updated_at();

create trigger products_updated_at
  before update on products for each row execute procedure set_updated_at();

create trigger variants_updated_at
  before update on product_variants for each row execute procedure set_updated_at();
