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
