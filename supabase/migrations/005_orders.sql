-- 005_orders.sql

create table orders (
  id                  uuid primary key default uuid_generate_v4(),
  order_number        text not null unique,
  user_id             uuid references auth.users(id) on delete set null,
  -- Snapshot de dirección (copia inmutable al momento del pedido)
  shipping_full_name  text not null,
  shipping_phone      text,
  shipping_address    text not null,
  shipping_apartment  text,
  shipping_city       text not null,
  shipping_region     text not null,
  shipping_zip        text,
  -- Totales en CLP (IVA 19% ya incluido en precio)
  subtotal            integer not null check (subtotal >= 0),
  shipping_cost       integer not null default 0 check (shipping_cost >= 0),
  discount            integer not null default 0 check (discount >= 0),
  tax_amount          integer not null default 0,
  total               integer not null check (total >= 0),
  -- Pago
  payment_method      payment_method,
  payment_status      payment_status not null default 'pending',
  payment_id          text,
  payment_data        jsonb,
  -- Estado
  status              order_status not null default 'pending',
  -- Notas
  customer_notes      text,
  admin_notes         text,
  -- Timestamps
  paid_at             timestamptz,
  shipped_at          timestamptz,
  delivered_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_orders_user on orders(user_id);
create index idx_orders_status on orders(status);
create index idx_orders_payment_status on orders(payment_status);
create index idx_orders_created on orders(created_at desc);
create index idx_orders_number on orders(order_number);

create sequence order_number_seq start 1000;

create or replace function generate_order_number()
returns text language plpgsql
as $$
begin
  return 'MCS-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 6, '0');
end;
$$;

create table order_items (
  id                uuid primary key default uuid_generate_v4(),
  order_id          uuid not null references orders(id) on delete cascade,
  product_id        uuid references products(id) on delete set null,
  variant_id        uuid references product_variants(id) on delete set null,
  -- Snapshot del producto al momento de compra
  product_name      text not null,
  variant_name      text,
  product_sku       text,
  product_image_url text,
  quantity          integer not null check (quantity > 0),
  unit_price        integer not null check (unit_price >= 0),
  subtotal          integer not null check (subtotal >= 0),
  created_at        timestamptz not null default now()
);

create index idx_order_items_order on order_items(order_id);

create trigger orders_updated_at
  before update on orders for each row execute procedure set_updated_at();
