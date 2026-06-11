-- Marketing opt-in tracking
alter table orders
  add column if not exists accepts_marketing boolean not null default false;

alter table profiles
  add column if not exists accepts_marketing boolean not null default false,
  add column if not exists phone            text;
