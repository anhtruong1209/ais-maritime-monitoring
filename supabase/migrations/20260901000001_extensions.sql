-- Extensions used across the schema.
-- pgcrypto: gen_random_uuid() for primary keys.
-- postgis: geography type + spatial index for AIS position lookups.
create extension if not exists pgcrypto;
create extension if not exists postgis;
