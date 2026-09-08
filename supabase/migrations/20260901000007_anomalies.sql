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
