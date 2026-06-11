-- 017_loyalty.sql
-- Sistema de puntos de fidelizaciÃ³n

-- ConfiguraciÃ³n global del programa de puntos
create table if not exists loyalty_config (
  id                    integer     primary key default 1 check (id = 1), -- singleton
  points_per_clp        numeric(10,4) not null default 0.001, -- 1 punto cada $1.000 CLP
  clp_per_point         integer     not null default 1,        -- 1 punto = $1 CLP de descuento
  min_points_redeem     integer     not null default 100,      -- mÃ­nimo de puntos para canjear
  points_expiry_days    integer,                               -- null = no vencen
  is_active             boolean     not null default true,
  updated_at            timestamptz not null default now()
);

insert into loyalty_config default values on conflict do nothing;

-- Cuenta de puntos por usuario
create table loyalty_accounts (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        unique not null references auth.users(id) on delete cascade,
  points_balance  integer     not null default 0 check (points_balance >= 0),
  points_earned   integer     not null default 0,
  points_redeemed integer     not null default 0,
  points_expired  integer     not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_loyalty_accounts_user on loyalty_accounts(user_id);

-- Transacciones de puntos
create table loyalty_transactions (
  id              uuid        primary key default gen_random_uuid(),
  account_id      uuid        not null references loyalty_accounts(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  order_id        uuid        references orders(id) on delete set null,
  type            text        not null check (type in ('earn','redeem','expire','adjust','refund')),
  points          integer     not null,              -- positivo = ingreso, negativo = egreso
  balance_after   integer     not null,
  description     text        not null default '',
  expires_at      timestamptz,
  created_at      timestamptz not null default now()
);

create index idx_loyalty_tx_account on loyalty_transactions(account_id);
create index idx_loyalty_tx_user    on loyalty_transactions(user_id);
create index idx_loyalty_tx_order   on loyalty_transactions(order_id);
create index idx_loyalty_tx_type    on loyalty_transactions(type);

-- Columna en orders para canje de puntos
alter table orders
  add column if not exists loyalty_points_used     integer not null default 0,
  add column if not exists loyalty_discount        integer not null default 0;

-- RLS
alter table loyalty_config       enable row level security;
alter table loyalty_accounts     enable row level security;
alter table loyalty_transactions enable row level security;

create policy "public_read_loyalty_config"    on loyalty_config for select using (true);
create policy "admin_write_loyalty_config"    on loyalty_config for all using (is_admin());

create policy "user_own_loyalty_account"      on loyalty_accounts for select using (user_id = auth.uid());
create policy "admin_all_loyalty_accounts"    on loyalty_accounts for all using (is_admin());

create policy "user_own_loyalty_tx"           on loyalty_transactions for select using (user_id = auth.uid());
create policy "admin_all_loyalty_tx"          on loyalty_transactions for all using (is_admin());

-- FunciÃ³n: acreditar puntos al confirmar pago
create or replace function credit_loyalty_points(
  p_user_id   uuid,
  p_order_id  uuid,
  p_clp_amount integer
) returns void language plpgsql security definer as $$
declare
  v_config    loyalty_config%rowtype;
  v_account   loyalty_accounts%rowtype;
  v_points    integer;
  v_expires   timestamptz;
begin
  select * into v_config from loyalty_config limit 1;
  if not v_config.is_active then return; end if;

  v_points := floor(p_clp_amount * v_config.points_per_clp)::integer;
  if v_points <= 0 then return; end if;

  if v_config.points_expiry_days is not null then
    v_expires := now() + (v_config.points_expiry_days || ' days')::interval;
  end if;

  -- Upsert cuenta
  insert into loyalty_accounts (user_id) values (p_user_id)
  on conflict (user_id) do nothing;

  select * into v_account from loyalty_accounts where user_id = p_user_id;

  update loyalty_accounts
  set points_balance = points_balance + v_points,
      points_earned  = points_earned  + v_points,
      updated_at     = now()
  where user_id = p_user_id;

  insert into loyalty_transactions
    (account_id, user_id, order_id, type, points, balance_after, description, expires_at)
  values
    (v_account.id, p_user_id, p_order_id, 'earn', v_points,
     v_account.points_balance + v_points,
     'Puntos por compra #' || p_order_id,
     v_expires);
end;
$$;

-- FunciÃ³n: canjear puntos
create or replace function redeem_loyalty_points(
  p_user_id  uuid,
  p_order_id uuid,
  p_points   integer
) returns integer language plpgsql security definer as $$
declare
  v_config  loyalty_config%rowtype;
  v_account loyalty_accounts%rowtype;
  v_discount integer;
begin
  select * into v_config from loyalty_config limit 1;
  if not v_config.is_active then return 0; end if;

  select * into v_account from loyalty_accounts where user_id = p_user_id;
  if not found then return 0; end if;
  if v_account.points_balance < p_points then return 0; end if;
  if p_points < v_config.min_points_redeem then return 0; end if;

  v_discount := p_points * v_config.clp_per_point;

  update loyalty_accounts
  set points_balance  = points_balance  - p_points,
      points_redeemed = points_redeemed + p_points,
      updated_at      = now()
  where user_id = p_user_id;

  insert into loyalty_transactions
    (account_id, user_id, order_id, type, points, balance_after, description)
  values
    (v_account.id, p_user_id, p_order_id, 'redeem', -p_points,
     v_account.points_balance - p_points,
     'Canje de puntos â€” Orden #' || p_order_id);

  return v_discount;
end;
$$;

-- Triggers
create trigger loyalty_accounts_updated_at
  before update on loyalty_accounts for each row execute procedure set_updated_at();

