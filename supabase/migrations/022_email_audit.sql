-- 022_email_audit.sql
-- Log de emails enviados + auditorÃ­a de acciones admin

create table email_notifications (
  id          uuid        primary key default gen_random_uuid(),
  to_email    text        not null,
  to_name     text,
  subject     text        not null,
  template    text        not null,   -- 'order_confirm', 'order_shipped', etc.
  order_id    uuid        references orders(id) on delete set null,
  user_id     uuid        references auth.users(id) on delete set null,
  status      text        not null default 'sent' check (status in ('sent','failed','pending')),
  provider_id text,                   -- ID del email en Resend
  error       text,
  created_at  timestamptz not null default now()
);

create index idx_email_notif_order on email_notifications(order_id);
create index idx_email_notif_email on email_notifications(to_email);

create table audit_logs (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete set null,
  user_email  text,
  action      text        not null,   -- 'create_product', 'update_order_status', etc.
  entity_type text        not null,   -- 'product', 'order', 'coupon', etc.
  entity_id   text,
  old_data    jsonb,
  new_data    jsonb,
  ip_address  text,
  created_at  timestamptz not null default now()
);

create index idx_audit_logs_user   on audit_logs(user_id);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);
create index idx_audit_logs_action on audit_logs(action);
create index idx_audit_logs_date   on audit_logs(created_at desc);

-- RLS
alter table email_notifications enable row level security;
alter table audit_logs          enable row level security;

create policy "admin_all_email_notif" on email_notifications for all using (is_admin());
create policy "admin_all_audit_logs"  on audit_logs          for all using (is_admin());

-- Tabla de abandonos de carrito (bÃ¡sico)
create table abandoned_carts (
  id          uuid        primary key default gen_random_uuid(),
  session_id  text        not null,
  user_id     uuid        references auth.users(id) on delete set null,
  email       text,
  cart_data   jsonb       not null default '[]',
  total       integer     not null default 0,
  recovered   boolean     not null default false,
  reminder_sent_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_abandoned_carts_email   on abandoned_carts(email);
create index idx_abandoned_carts_session on abandoned_carts(session_id);
create index idx_abandoned_carts_date    on abandoned_carts(created_at desc);

alter table abandoned_carts enable row level security;
create policy "admin_all_abandoned_carts" on abandoned_carts for all using (is_admin());

create trigger abandoned_carts_updated_at
  before update on abandoned_carts for each row execute procedure set_updated_at();

