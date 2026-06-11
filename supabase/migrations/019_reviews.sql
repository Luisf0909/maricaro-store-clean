-- 019_reviews.sql
-- ReseÃ±as y calificaciones de productos

create table product_reviews (
  id          uuid        primary key default gen_random_uuid(),
  product_id  uuid        not null references products(id) on delete cascade,
  user_id     uuid        references auth.users(id) on delete set null,
  order_id    uuid        references orders(id) on delete set null,
  -- Solo compradores verificados pueden reseÃ±ar
  is_verified boolean     not null default false,
  -- Contenido
  rating      smallint    not null check (rating between 1 and 5),
  title       text,
  body        text,
  -- ModeraciÃ³n
  status      text        not null default 'pending' check (status in ('pending','approved','rejected')),
  -- Guest info (cuando no hay user_id)
  guest_name  text,
  guest_email text,
  -- Metadata
  helpful_votes integer   not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_reviews_product on product_reviews(product_id, status);
create index idx_reviews_user    on product_reviews(user_id);
create index idx_reviews_order   on product_reviews(order_id);

-- Vista materializada de promedios por producto (actualizable)
create or replace view product_rating_summary as
  select
    product_id,
    count(*)                              as review_count,
    round(avg(rating)::numeric, 1)        as avg_rating,
    count(*) filter (where rating = 5)    as five_star,
    count(*) filter (where rating = 4)    as four_star,
    count(*) filter (where rating = 3)    as three_star,
    count(*) filter (where rating = 2)    as two_star,
    count(*) filter (where rating = 1)    as one_star
  from product_reviews
  where status = 'approved'
  group by product_id;

-- RLS
alter table product_reviews enable row level security;

create policy "public_read_approved_reviews"
  on product_reviews for select using (status = 'approved');

create policy "user_insert_own_review"
  on product_reviews for insert with check (user_id = auth.uid());

create policy "user_update_own_review"
  on product_reviews for update using (user_id = auth.uid());

create policy "admin_all_reviews"
  on product_reviews for all using (is_admin());

-- Trigger
create trigger reviews_updated_at
  before update on product_reviews for each row execute procedure set_updated_at();

