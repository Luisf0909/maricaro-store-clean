-- 008_seed.sql — Datos iniciales

insert into categories (name, slug, description, sort_order) values
  ('Devocionales', 'devocionales', 'Cuadernos para devocional diario con versículos y reflexiones', 1),
  ('Planners', 'planners', 'Planners semanales y mensuales con inspiración cristiana', 2),
  ('Agendas', 'agendas', 'Agendas anuales con propósito y fe', 3);

-- Después de crear la cuenta admin en Supabase Auth, ejecutar:
-- UPDATE profiles SET role = 'admin' WHERE id = 'uuid-del-usuario-admin';
