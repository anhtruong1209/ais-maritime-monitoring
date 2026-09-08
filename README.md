# AIS Maritime Monitoring

A maritime vessel monitoring and trajectory-intelligence platform built on AIS
(Automatic Identification System) data, focused on Vietnamese waters (Gulf of
Tonkin, East Sea / South China Sea, Hoang Sa, Truong Sa, and the country's
major seaports).

This is the MVP / product-demo phase for a Master's thesis on **ship
maritime monitoring and trajectory prediction based on AIS data and
Artificial Intelligence**. AI prediction is stubbed with a clearly-labeled
mock service today; the architecture is built so a real Python/FastAPI ML
service can be dropped in later without touching the UI.

## 1. Overview

- Live-style fleet map centered on Vietnam, with 1,000 synthetic demo vessels
  and ~300k AIS positions moving along realistic coastal and international
  sea lanes (multiple chained voyage legs per vessel, not just one trip).
- Vessel monitoring, search, filtering, and a shared vessel-detail modal
  (opened from any table, the map, or a fleet roster) with historical AIS
  trajectories and paginated raw AIS message history.
- Fleet management: vessels are grouped into named fleets (by corridor —
  Hai Phong, Central VN, Vung Tau/HCMC — plus fishing and international
  fleets); `/fleets` lists them, `/fleets/[id]` shows a fleet's roster + map.
- Voyage history per vessel and fleet-wide.
- AI trajectory + ETA prediction screen, backed by a swappable
  `PredictionService` provider (mock today, FastAPI later), including an
  arbitrary "what's the ETA if headed to port X" picker.
- Alerts/anomalies screen with a schema ready for real anomaly detection,
  drawn directly on the map as warning markers.

## 2. Features

| Page | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Fleet KPIs, vessel-type breakdown, mini map, recent activity, recent alerts |
| Vessels | `/vessels` | Searchable/filterable/paginated vessel table |
| Vessel Detail | `/vessels/[mmsi]` (also a modal) | Vessel info, current AIS, voyages, historical trajectory map, paginated AIS messages |
| Fleets | `/fleets`, `/fleets/[id]` | Fleet list + roster/map for one fleet |
| Full Map | `/map` | Full operational map: clustering, filters, historical/predicted trajectory toggles, anomaly markers, basemap switch |
| Voyages | `/voyages`, `/voyages/[id]` | Voyage list + detail with trajectory replay |
| Predictions | `/predictions` | DEMO/MOCK AI trajectory + ETA prediction per vessel, with a destination-port picker |
| Alerts | `/alerts` | Anomaly list (route deviation, abnormal speed, course change, AIS gap, long stationary) |

Vessel detail is a **modal**, not a separate navigation, everywhere it's
triggered from inside the app (`VesselDetailProvider` /
`useVesselDetailDialog()` in `src/providers/vessel-detail-provider.tsx`).
The `/vessels/[mmsi]` route still exists and renders the same content, so
direct links / bookmarks / shares keep working.

## 3. Architecture

```
Next.js App Router
├── app/(app)/…            Pages (Server Components fetch via lib/data)
├── app/api/…               Route Handlers (Zod-validated, thin controllers)
├── components/             UI only — layout, map, vessels, voyages, predictions, alerts
├── hooks/                  TanStack Query hooks for client-side data (map, live widgets)
├── lib/
│   ├── data/                Server-only data-access layer (Supabase queries + mapping)
│   ├── supabase/             Browser/server clients, DB row types, row→domain mappers
│   ├── ai/                   PredictionService interface + Mock/Http implementations
│   ├── map/                  Tile-provider config, vessel icon factory, ship-type metadata
│   └── validation/            Zod schemas for API query params
├── types/                   Domain types (Vessel, AISPosition, Voyage, Prediction, Anomaly, Port)
└── providers/               React Query provider

supabase/
├── migrations/              Numbered SQL migrations (source of truth)
├── schema.sql                Generated: all migrations concatenated (SQL Editor paste target)
└── seed/                     Ports seed + generated demo AIS dataset

scripts/
├── build-schema.mjs          Concatenates migrations → supabase/schema.sql
└── generate-seed.mjs         Generates the demo fleet (deterministic RNG)
```

Design decisions:
- **No business logic in components.** Pages call `lib/data/*` (server) or
  `hooks/use-*` (client); components only render props.
- **AI is a swappable provider**, not a Next.js feature. See §12.
- **The basemap and AIS data are independent layers** — see §4 and
  `lib/map/config.ts` — so the tile provider can change without touching any
  map component.
- **RLS-first security.** The browser only ever holds the public anon key;
  every table is read-only to `anon`/`authenticated` via Row Level Security
  (see `supabase/migrations/20260901000008_row_level_security.sql`). There is
  no service-role key anywhere in this codebase.

## 4. Tech Stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS · shadcn/ui (Base
UI) · Leaflet + React Leaflet, with a MapLibre GL vector basemap bridged in
via `@maplibre/maplibre-gl-leaflet` for label-language control (no Google
Maps, no paid Mapbox styles) · Supabase (Postgres + PostGIS) · Zod ·
date-fns · TanStack Query · Recharts.

### Map / GIS note

Default basemap: **OpenFreeMap** (`tiles.openfreemap.org`, OpenMapTiles
schema) — free, keyless vector tiles, rendered via MapLibre GL. Two plain
OpenStreetMap raster layers (standard + Humanitarian) are also selectable
from the basemap dropdown as keyless fallbacks. See `src/lib/map/config.ts`.

CARTO's `basemaps.cartocdn.com` raster tiles were deliberately removed:
they now return a `200 OK` PNG watermarked "API KEY REQUIRED" for
unauthenticated requests instead of a clean error — worth remembering if
re-evaluating tile providers later, since a plain reachability check won't
catch it.

**Label language:** the vector basemap's style is rewritten client-side
(`src/lib/map/vietnamese-style.ts`, `preferVietnameseLabels()`) so every
label prefers the `name:vi` OSM tag over the generic `name` tag, falling
back to `name:en`. This does not rewrite or invent any place name — it only
selects a different *existing* tag already present on the same feature when
one is present in the open dataset. Where a feature (e.g. a reef in the
East Sea) has no `name:vi` tag upstream in OSM, its original label is what
still shows; that's a gap in third-party OSM tagging this app has no
authority to fabricate data over.

No sovereignty or maritime-boundary geometry is fabricated by this
codebase; if a boundary overlay is added later it must live in its own
GeoJSON layer with a documented source, independent of the basemap and of
AIS data. The default map view is centered on Vietnam/the East Sea (not
China), and covers Hoang Sa and Truong Sa.

## 5. Folder Structure

See the tree in §3. Notable files:
- `src/lib/map/config.ts` — tile providers, default Vietnam viewport.
- `src/lib/ai/index.ts` — `getPredictionService()`, the one switch point
  between mock and real AI.
- `src/lib/vessel-status.ts` — derives moving/anchored/stopped/offline from
  the latest AIS fix (not stored, always consistent).
- `supabase/migrations/20260901000009_views.sql` — `vessels_with_latest_position`,
  a `security_invoker` view used for the fleet table/map/dashboard.

## 6. Supabase Setup

1. Create a Supabase project (or use an existing one).
2. In **Project Settings → API**, copy the Project URL and the `anon` /
   publishable key.
3. Run the schema and seed data — see §9/§10 below.

## 7. Environment Variables

Copy `.env.example` to `.env.local` and fill in your project's values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key

# Optional — future Python FastAPI AI service. Leave unset to keep using
# the mock predictor.
# AI_SERVICE_URL=http://localhost:8000
```

Only `NEXT_PUBLIC_*` variables are exposed to the browser. There is no
service-role key in this project — every table is safe to read publicly and
protected by Row Level Security, not by key secrecy.

## 8. Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/dashboard`. Until the
database is seeded (§9–10) pages will show an error, since the tables don't
exist yet.

## 9. Database Migration

Migrations live in `supabase/migrations/`, applied in filename order. Two
ways to run them:

**Option A — Supabase CLI** (if you have it linked to this project):
```bash
supabase db push
```

**Option B — SQL Editor** (no CLI needed): open
`supabase/schema.sql` (all migrations concatenated) and run it once in your
project's SQL Editor. Regenerate it after editing a migration:
```bash
npm run db:build-schema
```

## 10. Seed Data

Seed files live in `supabase/seed/`, run **after** the schema:

1. `supabase/seed/01_ports.sql` — 8 major Vietnamese ports.
2. `supabase/seed/02_vessels_and_ais.sql` — 1,000 vessels, each with several
   chained voyage legs (not just one trip) giving ~300k AIS positions and
   ~4,300 voyages total, plus demo predictions, anomalies, and 5 fleets.
   Generated by a seeded (deterministic) RNG — regenerate with:
   ```bash
   npm run db:generate-seed
   ```
   This file is large (~50MB). The Supabase SQL Editor can choke pasting
   something that size — if it does, run it via `psql`/a Postgres client
   against your project's connection string instead:
   ```bash
   psql "postgresql://postgres.<project-ref>:<password>@<pooler-host>:5432/postgres" \
     -f supabase/seed/02_vessels_and_ais.sql
   ```
   (Use the **Session pooler** connection string from the dashboard's
   "Connect" button — the direct connection is IPv6-only.)

Re-running the seed script adds another batch of vessels rather than
replacing the old ones. To start clean first:
```sql
truncate public.fleets, public.vessels restart identity cascade;
```
(`ports` is static reference data and isn't touched by this.)

Paste/run each file in order — ports before vessels, since AIS destinations
reference port names.

The anon key used by the app is read-only (§13), so seeding is a deliberate
SQL Editor step rather than something the running app does.

## 11. Vercel Deployment

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import it in Vercel.
3. Set the environment variables from §7 in the Vercel project settings
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `AI_SERVICE_URL` once the AI service exists).
4. Deploy — no other configuration is required (Vercel auto-detects Next.js).

## 12. Future AI Architecture

```
Next.js  →  PredictionService interface  →  Python FastAPI  →  ML/DL model
```

- `src/lib/ai/prediction-service.ts` — the interface (`predictTrajectory`,
  `predictEta`).
- `src/lib/ai/mock-prediction-service.ts` — today's implementation: linear
  extrapolation of the last known course/speed with decaying confidence.
  Always returns `isMock: true`, and the UI renders a **DEMO / MOCK AI
  PREDICTION** badge whenever that flag is set (`EtaCard`, `PredictionPanel`).
- `src/lib/ai/http-prediction-service.ts` — ready-to-use stub that calls a
  FastAPI service over HTTP with the same request/response shapes.
- `src/lib/ai/index.ts` — `getPredictionService()` picks the implementation
  based on whether `AI_SERVICE_URL` is set. No other code changes when the
  real service comes online.

## 13. Future Python FastAPI Integration

When the FastAPI service exists:

1. Implement `POST /predict/trajectory` and `POST /predict/eta` matching the
   request/response shapes in `src/lib/ai/prediction-service.ts`
   (`TrajectoryPredictionInput`/`Result`, `EtaPredictionInput`/`Result`).
2. Set `AI_SERVICE_URL` (server-side only — never `NEXT_PUBLIC_*`) in the
   Next.js deployment.
3. Nothing else changes: `getPredictionService()` switches to
   `HttpPredictionService` automatically, and every page consuming
   predictions (`/predictions`, `/map`) keeps working unmodified.

This keeps model training and inference entirely out of the Next.js app —
Next.js only ever talks to the FastAPI service's HTTP contract, which is
exactly what a thesis experiment platform (trajectory reconstruction,
prediction, ETA, anomaly detection) needs: a stable data/API layer that the
ML side can iterate against independently.
