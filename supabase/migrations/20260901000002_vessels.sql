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
