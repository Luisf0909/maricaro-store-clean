-- 018_order_tracking.sql
-- Historial de estados de Ã³rdenes (auditorÃ­a completa)

create table order_status_history (
  id              uuid        primary key default gen_random_uuid(),
  order_id        uuid        not null references orders(id) on delete cascade,
  -- Estados
  previous_status text,
  new_status      text        not null,
  -- Pago
  previous_payment_status text,
  new_payment_status      text,
  -- Metadata
  changed_by_user_id uuid    references auth.users(id) on delete set null,
  changed_by_name    text,   -- snapshot del nombre
  comment            text,
  customer_notified  boolean not null default false,
  -- Tracking de envÃ­o
  tracking_code      text,
  tracking_url       text,
  carrier            text,
  -- Timestamp
  created_at         timestamptz not null default now()
);

create index idx_order_history_order   on order_status_history(order_id);
create index idx_order_history_created on order_status_history(created_at desc);

-- RLS
alter table order_status_history enable row level security;

create policy "admin_all_order_history"
  on order_status_history for all using (is_admin());

create policy "user_own_order_history"
  on order_status_history for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_status_history.order_id
        and orders.user_id = auth.uid()
    )
  );

-- AÃ±adir campos de tracking a orders
alter table orders
  add column if not exists tracking_code text,
  add column if not exists tracking_url  text,
  add column if not exists carrier       text;

-- FunciÃ³n para insertar automÃ¡ticamente en historial cuando cambia status
create or replace function log_order_status_change()
returns trigger language plpgsql as $$
begin
  if OLD.status IS DISTINCT FROM NEW.status
  or OLD.payment_status IS DISTINCT FROM NEW.payment_status then
    insert into order_status_history (
      order_id,
      previous_status,
      new_status,
      previous_payment_status,
      new_payment_status,
      comment
    ) values (
      NEW.id,
      OLD.status,
      NEW.status,
      OLD.payment_status,
      NEW.payment_status,
      null
    );
  end if;
  return NEW;
end;
$$;

create trigger orders_status_history_trigger
  after update on orders
  for each row execute procedure log_order_status_change();

