-- 010_coupons.sql

create type coupon_discount_type as enum ('percentage', 'fixed');

create table coupons (
  id                uuid primary key default uuid_generate_v4(),
  code              text unique not null,
  description       text,
  discount_type     coupon_discount_type not null,
  discount_value    integer not null check (discount_value > 0),
  min_order_amount  integer not null default 0,
  max_uses          integer,          -- null = ilimitado
  uses_count        integer not null default 0,
  one_per_customer  boolean not null default true,
  expires_at        timestamptz,      -- null = sin vencimiento
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table coupon_uses (
  id              uuid primary key default uuid_generate_v4(),
  coupon_id       uuid not null references coupons(id) on delete cascade,
  order_id        uuid references orders(id) on delete set null,
  user_id         uuid references auth.users(id) on delete set null,
  customer_email  text not null,
  customer_rut    text not null,
  used_at         timestamptz not null default now()
);

create index idx_coupon_uses_coupon  on coupon_uses(coupon_id);
create index idx_coupon_uses_email   on coupon_uses(customer_email);
create index idx_coupon_uses_rut     on coupon_uses(customer_rut);
create index idx_coupons_code        on coupons(code);

create trigger coupons_updated_at
  before update on coupons for each row execute procedure set_updated_at();

-- RLS
alter table coupons     enable row level security;
alter table coupon_uses enable row level security;

create policy "admin_all_coupons"        on coupons     for all  using (is_admin());
create policy "public_read_coupons"      on coupons     for select using (is_active = true);
create policy "admin_all_coupon_uses"    on coupon_uses for all  using (is_admin());
create policy "user_own_coupon_uses"     on coupon_uses for select using (user_id = auth.uid());
