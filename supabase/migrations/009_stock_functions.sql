-- 009_stock_functions.sql — Funciones para decrementar stock atómicamente

create or replace function decrement_product_stock(product_id uuid, qty integer)
returns void language plpgsql
as $$
begin
  update products
  set stock = stock - qty
  where id = product_id and stock >= qty;

  if not found then
    raise exception 'Stock insuficiente para producto %', product_id;
  end if;
end;
$$;

create or replace function decrement_variant_stock(variant_id uuid, qty integer)
returns void language plpgsql
as $$
begin
  update product_variants
  set stock = stock - qty
  where id = variant_id and stock >= qty;

  if not found then
    raise exception 'Stock insuficiente para variante %', variant_id;
  end if;
end;
$$;
