create table if not exists public.fleets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.fleet_vessels (
  fleet_id uuid not null references public.fleets (id) on delete cascade,
  vessel_id uuid not null references public.vessels (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (fleet_id, vessel_id)
);

create index if not exists idx_fleet_vessels_fleet_id on public.fleet_vessels (fleet_id);
create index if not exists idx_fleet_vessels_vessel_id on public.fleet_vessels (vessel_id);

alter table public.fleets enable row level security;
alter table public.fleet_vessels enable row level security;

drop policy if exists "Public read access" on public.fleets;
create policy "Public read access" on public.fleets for select using (true);

drop policy if exists "Public read access" on public.fleet_vessels;
create policy "Public read access" on public.fleet_vessels for select using (true);

-- Fleet roster with vessel + latest-position summary in one query.
create or replace view public.fleet_vessels_with_latest_position
with (security_invoker = true) as
select
  fv.fleet_id,
  v.*
from public.fleet_vessels fv
join public.vessels_with_latest_position v on v.id = fv.vessel_id;

grant select on public.fleet_vessels_with_latest_position to anon, authenticated;
