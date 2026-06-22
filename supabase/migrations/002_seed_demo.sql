-- Demo seed data for MājasBalss.lv (use for development / demo only)
-- After running schema, insert a house + connect later to a real user.

-- 1. Demo house
insert into public.houses (id, address, city, street, house_number, postal_code, apartment_count)
values (
  '11111111-1111-1111-1111-111111111111',
  'Rīga, Brīvības iela 123',
  'Rīga',
  'Brīvības iela',
  '123',
  'LV-1010',
  48
) on conflict (id) do nothing;

-- Note: After you create a user via Supabase Auth UI or signup flow,
-- INSERT a resident manually linking user_id to the house.
-- Example (replace the user_id after signup):
--
-- insert into public.residents (user_id, house_id, apartment_number, full_name, role)
-- values ('<paste-auth-user-uuid-here>', '11111111-1111-1111-1111-111111111111', '12', 'Anna Kalniņa', 'owner');

-- Demo problems (will be visible after a resident exists)
insert into public.problems (house_id, title, description, category, priority, status)
values
  ('11111111-1111-1111-1111-111111111111', 'Протечка в подъезде 2 этаж', 'На 2-м этаже течет потолок после дождя. Срочно нужно.', 'roof', 'high', 'open'),
  ('11111111-1111-1111-1111-111111111111', 'Не работает домофон', 'Домофон не реагирует уже 3 дня.', 'other', 'medium', 'in_progress'),
  ('11111111-1111-1111-1111-111111111111', 'Мусорный контейнер переполнен', 'Нужно заказать дополнительный вывоз.', 'other', 'low', 'resolved')
on conflict do nothing;

-- Demo poll
insert into public.polls (id, house_id, title, description, options, start_date, end_date, status)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Установка видеонаблюдения во дворе',
  'Предлагаем установить 4 камеры. Стоимость делим на всех собственников (~€35/квартира).',
  '[{"id":"yes","label":"Поддерживаю"},{"id":"no","label":"Против"},{"id":"abstain","label":"Воздерживаюсь"}]'::jsonb,
  now(),
  now() + interval '14 days',
  'active'
) on conflict (id) do nothing;

-- Demo protocols
insert into public.protocols (house_id, meeting_date, title, content)
values (
  '11111111-1111-1111-1111-111111111111',
  '2026-05-12',
  'Протокол общего собрания собственников от 12.05.2026',
  '1. Утверждён бюджет на 2026 год.\n2. Выбрана управляющая компания SIA "Māja".\n3. Решили отремонтировать крышу в 3 квартале.'
) on conflict do nothing;

comment on table public.houses is 'DEMO data included — replace IDs when connecting real residents.';
