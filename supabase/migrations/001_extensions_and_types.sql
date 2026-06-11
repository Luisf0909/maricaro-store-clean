-- 001_extensions_and_types.sql
create extension if not exists "uuid-ossp";

create type order_status as enum (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

create type payment_status as enum (
  'pending',
  'paid',
  'failed',
  'refunded'
);

create type payment_method as enum (
  'mercadopago',
  'flow_webpay'
);

create type user_role as enum (
  'customer',
  'admin'
);
