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
