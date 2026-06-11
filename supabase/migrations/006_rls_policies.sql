-- 006_rls_policies.sql

alter table profiles enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table products enable row level security;
alter table categories enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;

create or replace function is_admin()
returns boolean language plpgsql security definer
as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- PROFILES
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles"
  on profiles for select using (is_admin());

-- PRODUCTS (lectura pública sin auth)
create policy "Products are publicly readable"
  on products for select using (is_active = true);
create policy "Admins can manage products"
  on products for all using (is_admin());

-- CATEGORIES (lectura pública)
create policy "Categories are publicly readable"
  on categories for select using (is_active = true);
create policy "Admins can manage categories"
  on categories for all using (is_admin());

-- PRODUCT_IMAGES
create policy "Product images are publicly readable"
  on product_images for select using (true);
create policy "Admins can manage product images"
  on product_images for all using (is_admin());

-- PRODUCT_VARIANTS
create policy "Variants are publicly readable"
  on product_variants for select using (is_active = true);
create policy "Admins can manage variants"
  on product_variants for all using (is_admin());

-- ADDRESSES
create policy "Users can manage own addresses"
  on addresses for all using (auth.uid() = user_id);
create policy "Admins can view all addresses"
  on addresses for select using (is_admin());

-- ORDERS
create policy "Users can view own orders"
  on orders for select using (auth.uid() = user_id);
create policy "Authenticated users can create orders"
  on orders for insert with check (auth.uid() = user_id);
create policy "Admins can manage all orders"
  on orders for all using (is_admin());

-- ORDER_ITEMS
create policy "Users can view own order items"
  on order_items for select
  using (exists (select 1 from orders where id = order_id and user_id = auth.uid()));
create policy "Admins can manage all order items"
  on order_items for all using (is_admin());
