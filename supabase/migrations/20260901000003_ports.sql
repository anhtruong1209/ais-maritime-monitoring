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
