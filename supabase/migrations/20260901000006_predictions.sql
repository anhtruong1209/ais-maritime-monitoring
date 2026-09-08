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
