-- Digital products support
alter table products
  add column if not exists is_digital       boolean not null default false,
  add column if not exists digital_file_path text,
  add column if not exists digital_file_name text;

-- Secure download tokens generated after successful payment
create table if not exists order_download_tokens (
  id              uuid        primary key default uuid_generate_v4(),
  order_id        uuid        not null references orders(id) on delete cascade,
  product_id      uuid        not null references products(id) on delete cascade,
  token           text        unique not null default encode(gen_random_bytes(32), 'hex'),
  download_count  integer     not null default 0,
  max_downloads   integer     not null default 5,
  expires_at      timestamptz not null default (now() + interval '72 hours'),
  created_at      timestamptz not null default now()
);

alter table order_download_tokens enable row level security;

-- Authenticated users can view tokens for their own orders
create policy "Users view own download tokens"
  on order_download_tokens for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_download_tokens.order_id
        and orders.user_id = auth.uid()
    )
  );

-- Guest access will be handled via service_role (server-side only)

-- Private bucket for digital product files (no direct public access)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'digital-products',
  'digital-products',
  false,
  104857600, -- 100 MB limit
  array[
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do nothing;
