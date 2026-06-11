-- 020_wishlist.sql
-- Lista de favoritos / wishlist

create table wishlists (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  product_id  uuid        not null references products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index idx_wishlist_user    on wishlists(user_id);
create index idx_wishlist_product on wishlists(product_id);

-- RLS
alter table wishlists enable row level security;

create policy "user_manage_own_wishlist"
  on wishlists for all using (user_id = auth.uid());

create policy "admin_view_wishlists"
  on wishlists for select using (is_admin());

