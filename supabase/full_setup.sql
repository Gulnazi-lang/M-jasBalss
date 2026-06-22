-- MājasBalss.lv — Full database setup (run once in Supabase SQL Editor)
-- Dashboard → SQL Editor → New query → paste & Run

-- === 001_init_schema.sql ===
create extension if not exists "uuid-ossp";

create type resident_role as enum ('owner', 'tenant', 'admin');
create type problem_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type problem_priority as enum ('low', 'medium', 'high');
create type poll_status as enum ('draft', 'active', 'closed');

create table if not exists public.houses (
  id uuid primary key default uuid_generate_v4(),
  address text not null,
  city text,
  street text,
  house_number text,
  postal_code text,
  apartment_count integer default 0,
  manager_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.residents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  house_id uuid not null references public.houses(id) on delete cascade,
  apartment_number text not null,
  full_name text not null,
  phone text,
  role resident_role not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.problems (
  id uuid primary key default uuid_generate_v4(),
  house_id uuid not null references public.houses(id) on delete cascade,
  resident_id uuid references public.residents(id) on delete set null,
  title text not null,
  description text,
  category text not null default 'other',
  priority problem_priority not null default 'medium',
  status problem_status not null default 'open',
  photo_urls text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.polls (
  id uuid primary key default uuid_generate_v4(),
  house_id uuid not null references public.houses(id) on delete cascade,
  created_by uuid references public.residents(id) on delete set null,
  title text not null,
  description text,
  options jsonb not null,
  start_date timestamptz not null default now(),
  end_date timestamptz,
  status poll_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  resident_id uuid not null references public.residents(id) on delete cascade,
  option_id text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, resident_id)
);

create table if not exists public.protocols (
  id uuid primary key default uuid_generate_v4(),
  house_id uuid not null references public.houses(id) on delete cascade,
  created_by uuid references public.residents(id) on delete set null,
  meeting_date date not null,
  title text not null,
  content text,
  file_url text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists houses_updated_at on public.houses;
create trigger houses_updated_at before update on public.houses
  for each row execute function public.handle_updated_at();

drop trigger if exists residents_updated_at on public.residents;
create trigger residents_updated_at before update on public.residents
  for each row execute function public.handle_updated_at();

drop trigger if exists problems_updated_at on public.problems;
create trigger problems_updated_at before update on public.problems
  for each row execute function public.handle_updated_at();

alter table public.houses enable row level security;
alter table public.residents enable row level security;
alter table public.problems enable row level security;
alter table public.polls enable row level security;
alter table public.votes enable row level security;
alter table public.protocols enable row level security;

drop policy if exists "Users can view their own house" on public.houses;
create policy "Users can view their own house"
  on public.houses for select
  using (id in (select house_id from public.residents where user_id = auth.uid()));

drop policy if exists "Residents can view house residents" on public.residents;
create policy "Residents can view house residents"
  on public.residents for select
  using (house_id in (select house_id from public.residents where user_id = auth.uid()));

drop policy if exists "Residents can update own profile" on public.residents;
create policy "Residents can update own profile"
  on public.residents for update
  using (user_id = auth.uid());

drop policy if exists "View problems in own house" on public.problems;
create policy "View problems in own house"
  on public.problems for select
  using (house_id in (select house_id from public.residents where user_id = auth.uid()));

drop policy if exists "Create own problems" on public.problems;
create policy "Create own problems"
  on public.problems for insert
  with check (resident_id in (select id from public.residents where user_id = auth.uid()));

drop policy if exists "Update own problems or admin" on public.problems;
create policy "Update own problems or admin"
  on public.problems for update
  using (
    resident_id in (select id from public.residents where user_id = auth.uid())
    or exists (
      select 1 from public.residents
      where user_id = auth.uid() and role = 'admin' and house_id = problems.house_id
    )
  );

drop policy if exists "View polls in house" on public.polls;
create policy "View polls in house"
  on public.polls for select
  using (house_id in (select house_id from public.residents where user_id = auth.uid()));

drop policy if exists "Create polls (admin)" on public.polls;
create policy "Create polls (admin)"
  on public.polls for insert
  with check (
    exists (
      select 1 from public.residents
      where user_id = auth.uid() and role = 'admin' and house_id = polls.house_id
    )
  );

drop policy if exists "View votes in own house" on public.votes;
create policy "View votes in own house"
  on public.votes for select
  using (
    poll_id in (
      select id from public.polls where house_id in (
        select house_id from public.residents where user_id = auth.uid()
      )
    )
  );

drop policy if exists "Vote once (as resident)" on public.votes;
create policy "Vote once (as resident)"
  on public.votes for insert
  with check (resident_id in (select id from public.residents where user_id = auth.uid()));

drop policy if exists "View protocols of own house" on public.protocols;
create policy "View protocols of own house"
  on public.protocols for select
  using (house_id in (select house_id from public.residents where user_id = auth.uid()));

-- === 003_house_map_fields.sql ===
alter table public.houses
  add column if not exists slug text,
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists district text,
  add column if not exists year_built integer,
  add column if not exists floors integer,
  add column if not exists building_type text;

create unique index if not exists houses_slug_unique on public.houses (slug) where slug is not null;

drop policy if exists "Users can view their own house" on public.houses;
drop policy if exists "Anyone can view houses" on public.houses;
create policy "Anyone can view houses"
  on public.houses for select using (true);

drop policy if exists "Anyone can create houses" on public.houses;
create policy "Anyone can create houses"
  on public.houses for insert with check (true);

-- === 004_profiles_and_map_seed.sql ===
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  apartment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles: view own" on public.profiles;
create policy "Profiles: view own" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Profiles: update own" on public.profiles;
create policy "Profiles: update own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Profiles: insert own" on public.profiles;
create policy "Profiles: insert own" on public.profiles for insert with check (auth.uid() = id);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Demo data
insert into public.houses (id, address, city, street, house_number, postal_code, apartment_count)
values (
  '11111111-1111-1111-1111-111111111111',
  'Rīga, Brīvības iela 123', 'Rīga', 'Brīvības iela', '123', 'LV-1010', 48
) on conflict (id) do nothing;

insert into public.houses (
  id, address, city, street, house_number, postal_code, apartment_count,
  slug, lat, lng, district, year_built, floors, building_type
) values
  ('33333333-3333-3333-3333-333333333333', 'Rīga, Zemes iela 1', 'Rīga', 'Zemes iela', '1', 'LV-1082', 35,
   'zemes-iela-1', 56.9420456, 24.1961964, 'Pļavnieki', 1985, 9, 'panel'),
  ('44444444-4444-4444-4444-444444444444', 'Rīga, Zemes iela 3', 'Rīga', 'Zemes iela', '3', 'LV-1082', 108,
   'zemes-iela-3', 56.9422744, 24.1971483, 'Pļavnieki', 1987, 9, 'panel')
on conflict (id) do update set
  slug = excluded.slug, lat = excluded.lat, lng = excluded.lng;

insert into public.problems (house_id, title, description, category, priority, status) values
  ('11111111-1111-1111-1111-111111111111', 'Plūdums 2. stāvā', 'Pēc lietus noplūst griesti.', 'roof', 'high', 'open'),
  ('11111111-1111-1111-1111-111111111111', 'Domofons nedarbojas', 'Jau 3 dienas.', 'other', 'medium', 'in_progress')
on conflict do nothing;

insert into public.polls (id, house_id, title, description, options, start_date, end_date, status) values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'Videonovērošana pagalmā', '4 kameras, ~€35/dzīvoklis.',
   '[{"id":"yes","label":"Par"},{"id":"no","label":"Pret"},{"id":"abstain","label":"Atturas"}]'::jsonb,
   now(), now() + interval '14 days', 'active')
on conflict (id) do nothing;

insert into public.protocols (house_id, meeting_date, title, content) values
  ('11111111-1111-1111-1111-111111111111', '2026-05-12', 'Īpašnieku sapulces protokols',
   '1. Apstiprināts budžets 2026. gadam.\n2. Izvēlēta pārvaldnieks SIA "Māja".')
on conflict do nothing;

-- Done ✓