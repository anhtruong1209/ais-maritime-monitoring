-- GENERATED FILE. Do not edit directly — edit files under
-- supabase/migrations/ and re-run: node scripts/build-schema.mjs
--
-- This is the full schema for ais-maritime-monitoring, in one file for
-- convenience (paste into Supabase SQL Editor and run once).

-- ===== 20260901000001_extensions.sql =====
-- Extensions used across the schema.
-- pgcrypto: gen_random_uuid() for primary keys.
-- postgis: geography type + spatial index for AIS position lookups.
create extension if not exists pgcrypto;
create extension if not exists postgis;

-- ===== 20260901000002_vessels.sql =====
create table if not exists public.vessels (
  id uuid primary key default gen_random_uuid(),
  mmsi text not null unique,
  imo text,
  name text not null,
  call_sign text,
  ship_type text not null default 'other'
    check (ship_type in ('cargo', 'tanker', 'passenger', 'fishing', 'tug', 'military', 'other')),
  flag text not null default 'VN',
  length numeric,
  width numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vessels_mmsi on public.vessels (mmsi);
create index if not exists idx_vessels_ship_type on public.vessels (ship_type);
create index if not exists idx_vessels_name on public.vessels using gin (to_tsvector('simple', name));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_vessels_updated_at on public.vessels;
create trigger trg_vessels_updated_at
  before update on public.vessels
  for each row
  execute function public.set_updated_at();

-- ===== 20260901000003_ports.sql =====
create table if not exists public.ports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  country text not null default 'VN',
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  created_at timestamptz not null default now()
);

create index if not exists idx_ports_country on public.ports (country);

-- ===== 20260901000004_ais_positions.sql =====
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

-- ===== 20260901000005_voyages.sql =====
create table if not exists public.voyages (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid not null references public.vessels (id) on delete cascade,
  departure_port text not null,
  destination_port text not null,
  departure_time timestamptz not null,
  estimated_arrival timestamptz,
  actual_arrival timestamptz,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_voyages_vessel_id on public.voyages (vessel_id);
create index if not exists idx_voyages_status on public.voyages (status);
create index if not exists idx_voyages_departure_time on public.voyages (departure_time desc);
create index if not exists idx_voyages_destination_port on public.voyages (destination_port);

-- ===== 20260901000006_predictions.sql =====
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid not null references public.vessels (id) on delete cascade,
  prediction_type text not null
    check (prediction_type in ('trajectory', 'eta', 'destination', 'anomaly')),
  created_at timestamptz not null default now(),
  horizon_minutes integer not null default 60,
  predicted_latitude double precision,
  predicted_longitude double precision,
  predicted_eta timestamptz,
  confidence double precision not null default 0 check (confidence between 0 and 1),
  metadata jsonb
);

create index if not exists idx_predictions_vessel_id on public.predictions (vessel_id);
create index if not exists idx_predictions_type on public.predictions (prediction_type);
create index if not exists idx_predictions_created_at on public.predictions (created_at desc);

-- ===== 20260901000007_anomalies.sql =====
create table if not exists public.anomalies (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid not null references public.vessels (id) on delete cascade,
  detected_at timestamptz not null default now(),
  type text not null
    check (type in ('route_deviation', 'abnormal_speed', 'sudden_course_change', 'ais_signal_gap', 'long_stationary')),
  severity text not null default 'low'
    check (severity in ('low', 'medium', 'high', 'critical')),
  score double precision not null default 0 check (score between 0 and 1),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  description text not null,
  status text not null default 'open'
    check (status in ('open', 'acknowledged', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_anomalies_vessel_id on public.anomalies (vessel_id);
create index if not exists idx_anomalies_status on public.anomalies (status);
create index if not exists idx_anomalies_severity on public.anomalies (severity);
create index if not exists idx_anomalies_detected_at on public.anomalies (detected_at desc);

-- ===== 20260901000008_row_level_security.sql =====
-- MVP security posture: all demo data is publicly readable (this is a
-- product demo, not production fleet data), nothing is publicly writable.
-- Writes happen via the SQL Editor / migrations while there is no auth
-- system yet. When internal users are added later, replace the `true`
-- USING clauses below with real authorization checks.

alter table public.vessels enable row level security;
alter table public.ais_positions enable row level security;
alter table public.voyages enable row level security;
alter table public.predictions enable row level security;
alter table public.anomalies enable row level security;
alter table public.ports enable row level security;

drop policy if exists "Public read access" on public.vessels;
create policy "Public read access" on public.vessels for select using (true);

drop policy if exists "Public read access" on public.ais_positions;
create policy "Public read access" on public.ais_positions for select using (true);

drop policy if exists "Public read access" on public.voyages;
create policy "Public read access" on public.voyages for select using (true);

drop policy if exists "Public read access" on public.predictions;
create policy "Public read access" on public.predictions for select using (true);

drop policy if exists "Public read access" on public.anomalies;
create policy "Public read access" on public.anomalies for select using (true);

drop policy if exists "Public read access" on public.ports;
create policy "Public read access" on public.ports for select using (true);

-- ===== 20260901000009_views.sql =====
-- Flattened view: one row per vessel with its latest AIS fix (if any).
-- security_invoker = true means the view enforces RLS using the *calling*
-- role's policies on the underlying tables, not the view owner's — so the
-- same "public read" policies from 20260901000008 apply here too.
create or replace view public.vessels_with_latest_position
with (security_invoker = true) as
select
  v.id,
  v.mmsi,
  v.imo,
  v.name,
  v.call_sign,
  v.ship_type,
  v.flag,
  v.length,
  v.width,
  v.created_at,
  v.updated_at,
  lp."timestamp" as latest_timestamp,
  lp.latitude as latest_latitude,
  lp.longitude as latest_longitude,
  lp.sog as latest_sog,
  lp.cog as latest_cog,
  lp.heading as latest_heading,
  lp.nav_status as latest_nav_status,
  lp.destination as latest_destination
from public.vessels v
left join lateral (
  select p.*
  from public.ais_positions p
  where p.vessel_id = v.id
  order by p."timestamp" desc
  limit 1
) lp on true;

grant select on public.vessels_with_latest_position to anon, authenticated;

-- ===== 20260901000010_fleets.sql =====
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

-- ===== 20260908000001_anomaly_collision_risk.sql =====
-- Adds "collision_risk" as an anomaly type: two vessels on a closing/too-
-- close course. Modeled as a normal single-vessel anomaly (the other
-- vessel involved is named in the description) rather than a new table,
-- consistent with every other anomaly type here.
alter table public.anomalies drop constraint if exists anomalies_type_check;
alter table public.anomalies add constraint anomalies_type_check
  check (type in (
    'route_deviation',
    'abnormal_speed',
    'sudden_course_change',
    'ais_signal_gap',
    'long_stationary',
    'collision_risk'
  ));

-- ===== 20260908000002_predictions_evaluation_fields.sql =====
-- Evaluation fields for the predictions table: nothing populates these
-- yet (there's no trained model producing predictions worth evaluating,
-- and "actual" outcomes for a trajectory/ETA prediction only exist once
-- real time catches up to the prediction). Added now so a future model +
-- evaluation job has schema to write into without another migration —
-- see EtaComparisonCard for the UI-side version of this same comparison
-- (currently computed live from the voyage record, not read from here).
alter table public.predictions
  add column if not exists model_name text,
  add column if not exists actual_latitude double precision,
  add column if not exists actual_longitude double precision,
  add column if not exists actual_eta timestamptz,
  add column if not exists error_minutes double precision;

comment on column public.predictions.model_name is
  'Which model produced this prediction, e.g. "Demo AI Trajectory Model" or a real model/version once trained models exist.';
comment on column public.predictions.actual_eta is
  'Observed arrival time, filled in once the vessel actually arrives — null until then.';
comment on column public.predictions.error_minutes is
  'abs(actual_eta - predicted_eta) in minutes, for MAE/RMSE/MAPE aggregation later. Null until actual_eta is known.';
