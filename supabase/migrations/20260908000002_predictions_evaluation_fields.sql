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
