-- Profiles for OAuth users + demo map houses

-- ============================================
-- PROFILES (linked to auth.users)
-- ============================================
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
create policy "Profiles: view own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles: update own" on public.profiles;
create policy "Profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Profiles: insert own" on public.profiles;
create policy "Profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup (Google / email)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
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

-- ============================================
-- DEMO MAP HOUSES (Pļavnieki)
-- ============================================
insert into public.houses (
  id, address, city, street, house_number, postal_code, apartment_count,
  slug, lat, lng, district, year_built, floors, building_type
)
values
  (
    '33333333-3333-3333-3333-333333333333',
    'Rīga, Zemes iela 1',
    'Rīga',
    'Zemes iela',
    '1',
    'LV-1082',
    35,
    'zemes-iela-1',
    56.9420456,
    24.1961964,
    'Pļavnieki',
    1985,
    9,
    'panel'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Rīga, Zemes iela 3',
    'Rīga',
    'Zemes iela',
    '3',
    'LV-1082',
    108,
    'zemes-iela-3',
    56.9422744,
    24.1971483,
    'Pļavnieki',
    1987,
    9,
    'panel'
  )
on conflict (id) do update set
  slug = excluded.slug,
  lat = excluded.lat,
  lng = excluded.lng,
  district = excluded.district,
  year_built = excluded.year_built,
  floors = excluded.floors,
  building_type = excluded.building_type;

comment on table public.profiles is 'User profile (Google / email auth)';