-- 016_giftcards.sql
-- Sistema de tarjetas de regalo (GiftCards)

create table gift_cards (
  id              uuid        primary key default gen_random_uuid(),
  code            text        unique not null,
  initial_amount  integer     not null check (initial_amount > 0),
  balance         integer     not null check (balance >= 0),
  currency        text        not null default 'CLP',
  -- Estado
  status          text        not null default 'active' check (status in ('active','used','expired','cancelled')),
  expires_at      timestamptz,
  -- EmisiÃ³n
  issued_by       uuid        references auth.users(id) on delete set null,
  issued_to_email text,
  note            text,
  -- Timestamps
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_giftcards_code    on gift_cards(code);
create index idx_giftcards_status  on gift_cards(status);
create index idx_giftcards_email   on gift_cards(issued_to_email);

create table gift_card_transactions (
  id              uuid        primary key default gen_random_uuid(),
  gift_card_id    uuid        not null references gift_cards(id) on delete cascade,
  order_id        uuid        references orders(id) on delete set null,
  amount          integer     not null,            -- positivo = carga, negativo = uso
  balance_after   integer     not null,
  description     text        not null default '',
  created_at      timestamptz not null default now()
);

create index idx_gc_transactions_card  on gift_card_transactions(gift_card_id);
create index idx_gc_transactions_order on gift_card_transactions(order_id);

-- Columna en orders para descuento por giftcard
alter table orders
  add column if not exists gift_card_id       uuid references gift_cards(id) on delete set null,
  add column if not exists gift_card_code     text,
  add column if not exists gift_card_discount integer not null default 0;

-- RLS
alter table gift_cards             enable row level security;
alter table gift_card_transactions enable row level security;

create policy "admin_all_gift_cards"
  on gift_cards for all using (is_admin());

create policy "public_check_gift_card_by_code"
  on gift_cards for select using (status = 'active');

create policy "admin_all_gc_transactions"
  on gift_card_transactions for all using (is_admin());

-- Trigger updated_at
create trigger gift_cards_updated_at
  before update on gift_cards for each row execute procedure set_updated_at();

