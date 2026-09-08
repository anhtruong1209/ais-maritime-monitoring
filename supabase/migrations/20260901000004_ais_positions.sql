create table if not exists public.ais_positions (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid not null references public.vessels (id) on delete cascade,
  "timestamp" timestamptz not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  sog double precision not null default 0,
  cog double precision not null default 0,
  heading double precision,
  nav_status text,
  destination text,
  created_at timestamptz not null default now(),
  geom geography(Point, 4326)
);

create index if not exists idx_ais_positions_vessel_id on public.ais_positions (vessel_id);
create index if not exists idx_ais_positions_timestamp on public.ais_positions ("timestamp" desc);
create index if not exists idx_ais_positions_vessel_timestamp
  on public.ais_positions (vessel_id, "timestamp" desc);
create index if not exists idx_ais_positions_geom on public.ais_positions using gist (geom);

-- geom is kept in sync via trigger (rather than a generated column) so the
-- PostGIS cast doesn't have to satisfy generated-column immutability rules.
create or replace function public.set_ais_position_geom()
returns trigger
language plpgsql
as $$
begin
  new.geom = st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  return new;
end;
$$;

drop trigger if exists trg_ais_positions_geom on public.ais_positions;
create trigger trg_ais_positions_geom
  before insert or update on public.ais_positions
  for each row
  execute function public.set_ais_position_geom();
