-- Map fields + public house discovery for MājasBalss.lv

alter table public.houses
  add column if not exists slug text,
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists district text,
  add column if not exists year_built integer,
  add column if not exists floors integer,
  add column if not exists building_type text;

create unique index if not exists houses_slug_unique on public.houses (slug) where slug is not null;

-- Map: anyone can browse houses
drop policy if exists "Users can view their own house" on public.houses;
create policy "Anyone can view houses"
  on public.houses for select
  using (true);

-- Map: allow creating a new house from the public map
create policy "Anyone can create houses"
  on public.houses for insert
  with check (true);

comment on column public.houses.slug is 'URL-friendly identifier, e.g. zemes-iela-1';
comment on column public.houses.lat is 'Latitude for map marker';
comment on column public.houses.lng is 'Longitude for map marker';
comment on column public.houses.year_built is 'Construction year';
comment on column public.houses.floors is 'Number of floors';
comment on column public.houses.building_type is 'panel, brick, wooden, etc.';