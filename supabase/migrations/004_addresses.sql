-- 004_addresses.sql

create table chile_regions (
  id      smallint primary key,
  name    text not null,
  code    text not null unique
);

insert into chile_regions (id, name, code) values
  (1,  'Región de Tarapacá', 'I'),
  (2,  'Región de Antofagasta', 'II'),
  (3,  'Región de Atacama', 'III'),
  (4,  'Región de Coquimbo', 'IV'),
  (5,  'Región de Valparaíso', 'V'),
  (6,  'Región del Libertador General Bernardo O''Higgins', 'VI'),
  (7,  'Región del Maule', 'VII'),
  (8,  'Región del Biobío', 'VIII'),
  (9,  'Región de La Araucanía', 'IX'),
  (10, 'Región de Los Lagos', 'X'),
  (11, 'Región de Aysén del General Carlos Ibáñez del Campo', 'XI'),
  (12, 'Región de Magallanes y de la Antártica Chilena', 'XII'),
  (13, 'Región Metropolitana de Santiago', 'RM'),
  (14, 'Región de Los Ríos', 'XIV'),
  (15, 'Región de Arica y Parinacota', 'XV'),
  (16, 'Región de Ñuble', 'XVI');

create table addresses (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  full_name    text not null,
  phone        text,
  address      text not null,
  apartment    text,
  city         text not null,
  region_id    smallint references chile_regions(id),
  zip_code     text,
  is_default   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_addresses_user on addresses(user_id);

create trigger addresses_updated_at
  before update on addresses for each row execute procedure set_updated_at();
