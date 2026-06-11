-- 011_orders_products_updates.sql

-- Campos adicionales en orders para cupones y checkout como invitado
alter table orders
  add column coupon_id       uuid references coupons(id) on delete set null,
  add column coupon_code     text,
  add column coupon_discount integer not null default 0,
  add column is_guest        boolean not null default false,
  add column customer_rut    text,
  add column customer_email  text;   -- correo del invitado (usuarios registrados usan auth.users)

-- Campo made_to_order en products
-- true = se fabrica bajo pedido cuando no hay stock (48-72 h)
-- false = simplemente "Agotado" cuando stock = 0
alter table products
  add column made_to_order boolean not null default false;

-- Política de storage para que admins puedan subir imágenes de productos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

create policy "admin_upload_product_images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' AND is_admin());

create policy "admin_update_product_images"
  on storage.objects for update
  using (bucket_id = 'product-images' AND is_admin());

create policy "admin_delete_product_images"
  on storage.objects for delete
  using (bucket_id = 'product-images' AND is_admin());

create policy "public_read_product_images"
  on storage.objects for select
  using (bucket_id = 'product-images');
