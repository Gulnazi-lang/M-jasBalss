-- MājasBalss.lv — Supabase Database Schema
-- Run this in Supabase SQL Editor (or via supabase CLI migration)

-- Enable required extensions (usually already on)
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
create type resident_role as enum ('owner', 'tenant', 'admin');
create type problem_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type problem_priority as enum ('low', 'medium', 'high');
create type poll_status as enum ('draft', 'active', 'closed');

-- ============================================
-- TABLES
-- ============================================

-- Houses (многоквартирные дома)
create table if not exists public.houses (
  id uuid primary key default uuid_generate_v4(),
  address text not null,                 -- Full address: "Rīga, Brīvības iela 123"
  city text,
  street text,
  house_number text,
  postal_code text,
  apartment_count integer default 0,
  manager_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Residents (профиль жильца, связан с auth.users)
create table if not exists public.residents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  house_id uuid not null references public.houses(id) on delete cascade,
  apartment_number text not null,        -- "12", "5A"
  full_name text not null,
  phone text,
  role resident_role not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Problems / Issues reported by residents
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

-- Polls (голосования жителей дома)
create table if not exists public.polls (
  id uuid primary key default uuid_generate_v4(),
  house_id uuid not null references public.houses(id) on delete cascade,
  created_by uuid references public.residents(id) on delete set null,
  title text not null,
  description text,
  options jsonb not null,                -- [{ "id": "opt1", "label": "Да" }, ...]
  start_date timestamptz not null default now(),
  end_date timestamptz,
  status poll_status not null default 'draft',
  created_at timestamptz not null default now()
);

-- Votes (голоса — один житель = один голос)
create table if not exists public.votes (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  resident_id uuid not null references public.residents(id) on delete cascade,
  option_id text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, resident_id)
);

-- Protocols (протоколы собраний жильцов)
create table if not exists public.protocols (
  id uuid primary key default uuid_generate_v4(),
  house_id uuid not null references public.houses(id) on delete cascade,
  created_by uuid references public.residents(id) on delete set null,
  meeting_date date not null,
  title text not null,
  content text,                          -- Markdown or plain text
  file_url text,                         -- optional uploaded PDF
  created_at timestamptz not null default now()
);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger houses_updated_at before update on public.houses
  for each row execute function public.handle_updated_at();

create trigger residents_updated_at before update on public.residents
  for each row execute function public.handle_updated_at();

create trigger problems_updated_at before update on public.problems
  for each row execute function public.handle_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
alter table public.houses enable row level security;
alter table public.residents enable row level security;
alter table public.problems enable row level security;
alter table public.polls enable row level security;
alter table public.votes enable row level security;
alter table public.protocols enable row level security;

-- Policies: user can only see data for their own house
-- (Simplest version: join via residents)

-- Houses: visible if you are a resident of it
create policy "Users can view their own house"
  on public.houses for select
  using (
    id in (
      select house_id from public.residents where user_id = auth.uid()
    )
  );

-- Residents: can view residents of their house
create policy "Residents can view house residents"
  on public.residents for select
  using (
    house_id in (
      select house_id from public.residents where user_id = auth.uid()
    )
  );

create policy "Residents can update own profile"
  on public.residents for update
  using (user_id = auth.uid());

-- Problems
create policy "View problems in own house"
  on public.problems for select
  using (
    house_id in (select house_id from public.residents where user_id = auth.uid())
  );

create policy "Create own problems"
  on public.problems for insert
  with check (
    resident_id in (select id from public.residents where user_id = auth.uid())
  );

create policy "Update own problems or admin"
  on public.problems for update
  using (
    resident_id in (select id from public.residents where user_id = auth.uid())
    or exists (
      select 1 from public.residents 
      where user_id = auth.uid() and role = 'admin' and house_id = problems.house_id
    )
  );

-- Polls + Votes
create policy "View polls in house"
  on public.polls for select
  using (house_id in (select house_id from public.residents where user_id = auth.uid()));

create policy "Create polls (admin)"
  on public.polls for insert
  with check (
    exists (
      select 1 from public.residents 
      where user_id = auth.uid() and role = 'admin' and house_id = polls.house_id
    )
  );

create policy "View votes in own house"
  on public.votes for select
  using (
    poll_id in (
      select id from public.polls where house_id in (
        select house_id from public.residents where user_id = auth.uid()
      )
    )
  );

create policy "Vote once (as resident)"
  on public.votes for insert
  with check (
    resident_id in (select id from public.residents where user_id = auth.uid())
  );

-- Protocols
create policy "View protocols of own house"
  on public.protocols for select
  using (house_id in (select house_id from public.residents where user_id = auth.uid()));

-- ============================================
-- HELPER: auto-create resident profile after signup (optional trigger)
-- You can also create resident manually in UI after first login.
-- ============================================

-- Useful seed comment
comment on table public.houses is 'Многоквартирные дома';
comment on table public.residents is 'Жильцы дома (связь auth + house)';
comment on table public.problems is 'Заявки/проблемы от жильцов';
comment on table public.polls is 'Голосования и опросы';
comment on table public.votes is 'Голоса жителей';
comment on table public.protocols is 'Протоколы собраний собственников';

-- Done. After running, go to Authentication > Providers > Email enabled.
-- Add your first test user, then INSERT a house + resident manually to bootstrap.
