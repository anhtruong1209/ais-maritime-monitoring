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
