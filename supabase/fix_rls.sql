-- Run in Supabase SQL Editor if residents/polls tables show "infinite recursion" errors
-- Dashboard → SQL Editor → paste → Run

create or replace function public.user_house_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select house_id from public.residents where user_id = auth.uid();
$$;

create or replace function public.user_resident_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.residents where user_id = auth.uid();
$$;

create or replace function public.user_is_house_admin(target_house_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.residents
    where user_id = auth.uid() and role = 'admin' and house_id = target_house_id
  );
$$;

drop policy if exists "Residents can view house residents" on public.residents;
create policy "Residents can view house residents"
  on public.residents for select
  using (house_id in (select public.user_house_ids()));

drop policy if exists "View problems in own house" on public.problems;
create policy "View problems in own house"
  on public.problems for select
  using (house_id in (select public.user_house_ids()));

drop policy if exists "Create own problems" on public.problems;
create policy "Create own problems"
  on public.problems for insert
  with check (resident_id in (select public.user_resident_ids()));

drop policy if exists "Update own problems or admin" on public.problems;
create policy "Update own problems or admin"
  on public.problems for update
  using (
    resident_id in (select public.user_resident_ids())
    or public.user_is_house_admin(house_id)
  );

drop policy if exists "View polls in house" on public.polls;
create policy "View polls in house"
  on public.polls for select
  using (house_id in (select public.user_house_ids()));

drop policy if exists "Create polls (admin)" on public.polls;
create policy "Create polls (admin)"
  on public.polls for insert
  with check (public.user_is_house_admin(house_id));

drop policy if exists "View votes in own house" on public.votes;
create policy "View votes in own house"
  on public.votes for select
  using (
    poll_id in (
      select id from public.polls where house_id in (select public.user_house_ids())
    )
  );

drop policy if exists "Vote once (as resident)" on public.votes;
create policy "Vote once (as resident)"
  on public.votes for insert
  with check (resident_id in (select public.user_resident_ids()));

drop policy if exists "View protocols of own house" on public.protocols;
create policy "View protocols of own house"
  on public.protocols for select
  using (house_id in (select public.user_house_ids()));