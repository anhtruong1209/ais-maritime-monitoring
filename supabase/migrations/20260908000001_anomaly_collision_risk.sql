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
