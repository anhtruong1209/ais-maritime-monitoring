// Generates realistic demo AIS data for ais-maritime-monitoring and writes
// it as plain SQL INSERT statements to supabase/seed/02_vessels_and_ais.sql.
//
// This is a standalone script (no TS/app imports) so it can run with plain
// `node` and stays reproducible independent of the Next.js build. Run it
// with a fixed RNG seed so re-generating produces a stable demo dataset.
//
//   node scripts/generate-seed.mjs
//
// Then paste the generated file's contents into the Supabase SQL Editor
// (after schema.sql / migrations have been applied), same as the ports
// seed. The anon key used by the app has read-only RLS access, so seeding
// is deliberately a SQL-editor step rather than something the app does.

import { writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32) so the generated dataset is stable across
// runs/machines — useful for demos and reproducible thesis experiments.
// ---------------------------------------------------------------------------
function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260907);
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const randFloat = (min, max) => rand() * (max - min) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];
const uuid = () => crypto.randomUUID();

// ---------------------------------------------------------------------------
// Geo helpers (duplicated from src/lib/geo.ts on purpose — this script must
// run standalone without depending on the app's TS module graph).
// ---------------------------------------------------------------------------
const EARTH_RADIUS_KM = 6371;
const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;

function haversineKm(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

function bearing(a, b) {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLon = toRad(b.lon - a.lon);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function destPoint(origin, bearingDeg, distanceKm) {
  const ang = distanceKm / EARTH_RADIUS_KM;
  const brg = toRad(bearingDeg);
  const lat1 = toRad(origin.lat);
  const lon1 = toRad(origin.lon);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(ang) + Math.cos(lat1) * Math.sin(ang) * Math.cos(brg)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brg) * Math.sin(ang) * Math.cos(lat1),
      Math.cos(ang) - Math.sin(lat1) * Math.sin(lat2)
    );
  return { lat: toDeg(lat2), lon: toDeg(lon2) };
}

// ---------------------------------------------------------------------------
// Ports (must match supabase/seed/01_ports.sql)
// ---------------------------------------------------------------------------
const PORTS = {
  HAI_PHONG: { name: "Hai Phong", lat: 20.8449, lon: 106.6881 },
  CAI_LAN: { name: "Cai Lan", lat: 20.97, lon: 107.045 },
  DA_NANG: { name: "Da Nang", lat: 16.1067, lon: 108.2208 },
  QUY_NHON: { name: "Quy Nhon", lat: 13.782, lon: 109.234 },
  NHA_TRANG: { name: "Nha Trang", lat: 12.2388, lon: 109.1967 },
  HCMC: { name: "Ho Chi Minh City", lat: 10.7769, lon: 106.7009 },
  VUNG_TAU: { name: "Vung Tau", lat: 10.346, lon: 107.0843 },
  CAN_THO: { name: "Can Tho", lat: 10.0333, lon: 105.7833 },
};

// Named offshore waypoints, used as route endpoints/anchors that are not
// ports (fishing grounds, patrol areas, international approach lanes).
const WAYPOINTS = {
  HOANG_SA: { name: "Hoang Sa waters", lat: 16.5, lon: 112.0 },
  TRUONG_SA: { name: "Truong Sa waters", lat: 9.5, lon: 114.0 },
  GULF_OF_TONKIN: { name: "Gulf of Tonkin", lat: 19.8, lon: 107.6 },
  HONG_KONG_APPROACH: { name: "Hong Kong", lat: 21.9, lon: 114.5 },
  SINGAPORE_APPROACH: { name: "Singapore", lat: 2.5, lon: 105.0 },
};

// ---------------------------------------------------------------------------
// Routes: coastal sea-lane waypoint chains connecting ports/areas. Points
// are offshore approximations of the real shipping lanes along Vietnam's
// coastline, not literal straight lines through land.
// ---------------------------------------------------------------------------
const ROUTES = [
  {
    id: "haiphong-danang",
    from: PORTS.HAI_PHONG,
    to: PORTS.DA_NANG,
    fromName: "Hai Phong",
    toName: "Da Nang",
    waypoints: [
      { lat: 20.85, lon: 106.95 },
      { lat: 19.6, lon: 106.85 },
      { lat: 18.1, lon: 106.55 },
      { lat: 17.0, lon: 107.1 },
      { lat: 16.25, lon: 108.05 },
      { lat: 16.11, lon: 108.25 },
    ],
  },
  {
    id: "danang-quynhon",
    from: PORTS.DA_NANG,
    to: PORTS.QUY_NHON,
    fromName: "Da Nang",
    toName: "Quy Nhon",
    waypoints: [
      { lat: 16.11, lon: 108.25 },
      { lat: 15.0, lon: 109.15 },
      { lat: 13.95, lon: 109.32 },
      { lat: 13.78, lon: 109.28 },
    ],
  },
  {
    id: "quynhon-nhatrang",
    from: PORTS.QUY_NHON,
    to: PORTS.NHA_TRANG,
    fromName: "Quy Nhon",
    toName: "Nha Trang",
    waypoints: [
      { lat: 13.78, lon: 109.28 },
      { lat: 12.9, lon: 109.42 },
      { lat: 12.24, lon: 109.28 },
    ],
  },
  {
    id: "nhatrang-vungtau",
    from: PORTS.NHA_TRANG,
    to: PORTS.VUNG_TAU,
    fromName: "Nha Trang",
    toName: "Vung Tau",
    waypoints: [
      { lat: 12.24, lon: 109.28 },
      { lat: 11.0, lon: 108.85 },
      { lat: 10.45, lon: 107.6 },
      { lat: 10.35, lon: 107.1 },
    ],
  },
  {
    id: "vungtau-hcmc",
    from: PORTS.VUNG_TAU,
    to: PORTS.HCMC,
    fromName: "Vung Tau",
    toName: "Ho Chi Minh City",
    waypoints: [
      { lat: 10.35, lon: 107.1 },
      { lat: 10.6, lon: 106.98 },
      { lat: 10.72, lon: 106.82 },
      { lat: 10.78, lon: 106.71 },
    ],
  },
  {
    id: "vungtau-cantho",
    from: PORTS.VUNG_TAU,
    to: PORTS.CAN_THO,
    fromName: "Vung Tau",
    toName: "Can Tho",
    waypoints: [
      { lat: 10.35, lon: 107.1 },
      { lat: 9.85, lon: 106.55 },
      { lat: 9.4, lon: 105.95 },
      { lat: 9.85, lon: 105.82 },
      { lat: 10.03, lon: 105.78 },
    ],
  },
  {
    id: "haiphong-cailan",
    from: PORTS.HAI_PHONG,
    to: PORTS.CAI_LAN,
    fromName: "Hai Phong",
    toName: "Cai Lan",
    waypoints: [
      { lat: 20.85, lon: 106.9 },
      { lat: 20.92, lon: 106.98 },
      { lat: 20.97, lon: 107.045 },
    ],
  },
  {
    id: "gulf-of-tonkin-transit",
    from: PORTS.CAI_LAN,
    to: PORTS.HAI_PHONG,
    fromName: "Cai Lan",
    toName: "Hai Phong",
    waypoints: [
      { lat: 20.97, lon: 107.045 },
      { lat: 20.3, lon: 108.1 },
      { lat: 19.5, lon: 107.4 },
      { lat: 20.85, lon: 106.9 },
    ],
  },
  {
    id: "eastsea-crossing-truongsa",
    from: PORTS.DA_NANG,
    to: PORTS.QUY_NHON,
    fromName: "Da Nang",
    toName: "Quy Nhon",
    waypoints: [
      { lat: 16.11, lon: 108.25 },
      { lat: 13.5, lon: 111.5 },
      { lat: WAYPOINTS.TRUONG_SA.lat, lon: WAYPOINTS.TRUONG_SA.lon },
      { lat: 12.0, lon: 111.0 },
      { lat: 13.78, lon: 109.28 },
    ],
  },
  {
    id: "intl-hongkong-haiphong",
    from: WAYPOINTS.HONG_KONG_APPROACH,
    to: PORTS.HAI_PHONG,
    fromName: "Hong Kong",
    toName: "Hai Phong",
    waypoints: [
      { lat: 21.9, lon: 114.5 },
      { lat: 21.2, lon: 111.5 },
      { lat: 20.7, lon: 108.5 },
      { lat: 20.85, lon: 106.9 },
    ],
  },
  {
    id: "intl-singapore-vungtau",
    from: WAYPOINTS.SINGAPORE_APPROACH,
    to: PORTS.VUNG_TAU,
    fromName: "Singapore",
    toName: "Vung Tau",
    waypoints: [
      { lat: 2.5, lon: 105.0 },
      { lat: 5.5, lon: 106.2 },
      { lat: 8.0, lon: 107.0 },
      { lat: 10.0, lon: 107.05 },
      { lat: 10.35, lon: 107.1 },
    ],
  },
  {
    id: "intl-singapore-hcmc",
    from: WAYPOINTS.SINGAPORE_APPROACH,
    to: PORTS.HCMC,
    fromName: "Singapore",
    toName: "Ho Chi Minh City",
    waypoints: [
      { lat: 2.5, lon: 105.0 },
      { lat: 6.0, lon: 105.8 },
      { lat: 9.0, lon: 106.3 },
      { lat: 10.4, lon: 106.6 },
      { lat: 10.78, lon: 106.71 },
    ],
  },
];

// Fishing grounds: short loop routes that stay close to shore or around
// Hoang Sa / Truong Sa, used for the "fishing" ship type.
const FISHING_GROUNDS = [
  { name: "Hoang Sa fishing ground", waypoints: [
    { lat: 16.6, lon: 111.9 }, { lat: 16.9, lon: 112.2 }, { lat: 16.4, lon: 112.4 }, { lat: 16.6, lon: 111.9 },
  ] },
  { name: "Truong Sa fishing ground", waypoints: [
    { lat: 9.6, lon: 113.8 }, { lat: 9.9, lon: 114.2 }, { lat: 9.3, lon: 114.3 }, { lat: 9.6, lon: 113.8 },
  ] },
  { name: "Central coast fishing ground", waypoints: [
    { lat: 15.9, lon: 108.9 }, { lat: 15.6, lon: 109.3 }, { lat: 15.3, lon: 108.95 }, { lat: 15.9, lon: 108.9 },
  ] },
  { name: "Gulf of Tonkin fishing ground", waypoints: [
    { lat: 20.2, lon: 107.6 }, { lat: 20.5, lon: 108.0 }, { lat: 19.9, lon: 108.1 }, { lat: 20.2, lon: 107.6 },
  ] },
];

// ---------------------------------------------------------------------------
// Vessel identity generation
// ---------------------------------------------------------------------------
const SHIP_TYPES_WEIGHTED = [
  ...Array(38).fill("cargo"),
  ...Array(16).fill("tanker"),
  ...Array(24).fill("fishing"),
  ...Array(6).fill("passenger"),
  ...Array(8).fill("tug"),
  ...Array(3).fill("military"),
  ...Array(8).fill("other"),
];

const VN_NAME_PREFIXES = [
  "VIETSUN", "BIEN DONG", "HAI AN", "PHU MY", "GEMADEPT", "VOSCO", "PVTRANS",
  "TAN CANG", "SAI GON", "DONG DO", "VIET THUAN", "GREEN", "HOANG SA",
  "TRUONG SA", "DAI DUONG", "PHUONG DONG", "VIET PHAT", "NAM TRIEU",
];
const INTL_NAME_PREFIXES = [
  "OCEAN", "PACIFIC", "GLOBAL", "ATLANTIC", "ORIENT", "STAR", "MARINER",
  "HORIZON", "EVER", "APL", "MAERSK", "COSCO", "SITC", "WAN HAI",
];
const NAME_SUFFIXES = ["STAR", "PIONEER", "TRADER", "HORIZON", "GLORY", "SPIRIT", "VOYAGER", "EXPRESS", "GALAXY", "SUN"];

const FLAG_POOL = [
  { flag: "VN", mid: "574" },
  { flag: "PA", mid: "353" },
  { flag: "LR", mid: "636" },
  { flag: "MH", mid: "538" },
  { flag: "HK", mid: "477" },
  { flag: "SG", mid: "563" },
  { flag: "JP", mid: "431" },
  { flag: "KR", mid: "440" },
];

const usedMmsi = new Set();
function generateMmsi(isVietnamese) {
  const pool = isVietnamese ? FLAG_POOL.filter((f) => f.flag === "VN") : FLAG_POOL;
  const { flag, mid } = pick(pool);
  let mmsi;
  do {
    mmsi = mid + String(randInt(100000, 999999));
  } while (usedMmsi.has(mmsi));
  usedMmsi.add(mmsi);
  return { mmsi, flag };
}

function generateImo() {
  return String(randInt(9100000, 9899999));
}

function generateCallSign(flag) {
  const letterPool = flag === "VN" ? "XV" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const l1 = letterPool[randInt(0, letterPool.length - 1)];
  const l2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[randInt(0, 25)];
  return `${l1}${l2}${randInt(1000, 9999)}`;
}

function generateVesselName(isVietnamese, shipType) {
  if (shipType === "fishing" && isVietnamese) {
    return `TAU CA ${pick(["QNg", "BDh", "KH", "TG", "BTh"])}-${randInt(10000, 99999)}`;
  }
  const prefix = isVietnamese ? pick(VN_NAME_PREFIXES) : pick(INTL_NAME_PREFIXES);
  return `${prefix} ${pick(NAME_SUFFIXES)} ${randInt(1, 99)}`;
}

// ---------------------------------------------------------------------------
// Trajectory generation along a waypoint chain
// ---------------------------------------------------------------------------
function routeTotalDistanceKm(waypoints) {
  let total = 0;
  for (let i = 1; i < waypoints.length; i++) {
    total += haversineKm(
      { lat: waypoints[i - 1].lat, lon: waypoints[i - 1].lon },
      { lat: waypoints[i].lat, lon: waypoints[i].lon }
    );
  }
  return total;
}

/** Point at cumulative distance `distKm` along a waypoint chain. */
function pointAtDistance(waypoints, distKm) {
  let remaining = distKm;
  for (let i = 1; i < waypoints.length; i++) {
    const a = { lat: waypoints[i - 1].lat, lon: waypoints[i - 1].lon };
    const b = { lat: waypoints[i].lat, lon: waypoints[i].lon };
    const segKm = haversineKm(a, b);
    if (remaining <= segKm || i === waypoints.length - 1) {
      const t = segKm === 0 ? 0 : Math.min(1, remaining / segKm);
      return {
        lat: a.lat + (b.lat - a.lat) * t,
        lon: a.lon + (b.lon - a.lon) * t,
      };
    }
    remaining -= segKm;
  }
  const last = waypoints[waypoints.length - 1];
  return { lat: last.lat, lon: last.lon };
}

// Anchored to the actual run time (not a hardcoded date) so a freshly
// generated/reseeded dataset always has its "latest" AIS fix be recent —
// a fixed past date here means every vessel silently ages into "offline"
// (see OFFLINE_THRESHOLD_MINUTES) the further real time drifts past it.
// The RNG seed above is still fixed, so the scenario itself (routes,
// voyage states, anomaly placement) stays reproducible across runs; only
// its position in time shifts to "now".
const NOW = Date.now();

/**
 * Builds a sequence of AIS fixes for one voyage leg along `waypoints`,
 * from `progressStart` to `progressEnd` (fractions 0..1 of total distance),
 * ending at `endTimeMs`. Cruise speed varies by ship type; positions get a
 * small perpendicular jitter so tracks don't look laser-straight.
 */
function buildTrajectory({ waypoints, progressStart, progressEnd, endTimeMs, cruiseSpeedKn, intervalMinutes, jitterKm }) {
  const totalKm = routeTotalDistanceKm(waypoints);
  const startKm = totalKm * progressStart;
  const endKm = totalKm * progressEnd;
  const distanceKm = Math.max(1, endKm - startKm);
  const speedKmPerMin = (cruiseSpeedKn * 1.852) / 60;
  const totalMinutes = Math.max(intervalMinutes, distanceKm / speedKmPerMin);
  const steps = Math.max(2, Math.round(totalMinutes / intervalMinutes));
  const startTimeMs = endTimeMs - steps * intervalMinutes * 60_000;

  const fixes = [];
  for (let i = 0; i <= steps; i++) {
    const frac = i / steps;
    const distKm = startKm + (endKm - startKm) * frac;
    const base = pointAtDistance(waypoints, distKm);
    const jitterBearing = randFloat(0, 360);
    const jitterDist = randFloat(0, jitterKm);
    const jittered = jitterKm > 0 ? destPoint(base, jitterBearing, jitterDist) : base;

    const nextDistKm = startKm + (endKm - startKm) * Math.min(1, (i + 1) / steps);
    const nextPoint = pointAtDistance(waypoints, nextDistKm);
    const cog = bearing(jittered, nextPoint);

    const sog =
      i === steps
        ? Math.max(0, cruiseSpeedKn * randFloat(0, 0.15))
        : Math.max(0.2, cruiseSpeedKn * randFloat(0.85, 1.12));

    fixes.push({
      timestamp: new Date(startTimeMs + i * intervalMinutes * 60_000).toISOString(),
      lat: jittered.lat,
      lon: jittered.lon,
      sog: Number(sog.toFixed(1)),
      cog: Number(cog.toFixed(1)),
    });
  }
  return fixes;
}

// ---------------------------------------------------------------------------
// SQL escaping helpers
// ---------------------------------------------------------------------------
const sqlStr = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const sqlNum = (v) => (v === null || v === undefined ? "null" : Number(v));

// ---------------------------------------------------------------------------
// Main generation
// ---------------------------------------------------------------------------
const TOTAL_VESSELS = 1000;
const NAV_STATUS = {
  underway: "under way using engine",
  anchored: "at anchor",
  moored: "moored",
  fishing: "engaged in fishing",
  restricted: "restricted manoeuvrability",
};

// Demo fleets: a fixed set of named groupings a fleet-manager view can
// filter by, assigned deterministically from each vessel's ship type,
// flag, and route — not stored per-vessel elsewhere, so this is the one
// source of truth for fleet membership.
const FLEETS = [
  { id: uuid(), name: "Doi tau Hai Phong - Cai Lan", description: "Vessels operating the Hai Phong / Cai Lan / Gulf of Tonkin corridor." },
  { id: uuid(), name: "Doi tau Mien Trung", description: "Vessels operating between Da Nang, Quy Nhon, and Nha Trang." },
  { id: uuid(), name: "Doi tau Vung Tau - TP.HCM", description: "Vessels operating the Vung Tau / Ho Chi Minh City / Can Tho corridor." },
  { id: uuid(), name: "Doi tau Danh Ca", description: "Vietnamese fishing vessels, including grounds near Hoang Sa and Truong Sa." },
  { id: uuid(), name: "Doi tau Quoc Te", description: "Foreign-flagged vessels approaching Vietnamese ports." },
];
const [FLEET_HAIPHONG, FLEET_MIENTRUNG, FLEET_VUNGTAU, FLEET_FISHING, FLEET_INTL] = FLEETS;
const HAIPHONG_PORTS = new Set(["Hai Phong", "Cai Lan"]);
const MIENTRUNG_PORTS = new Set(["Da Nang", "Quy Nhon", "Nha Trang"]);
const VUNGTAU_PORTS = new Set(["Vung Tau", "Ho Chi Minh City", "Can Tho"]);

function classifyFleet({ shipType, isVietnamese, fromName, toName }) {
  if (shipType === "fishing") return FLEET_FISHING;
  if (!isVietnamese) return FLEET_INTL;
  if (HAIPHONG_PORTS.has(fromName) || HAIPHONG_PORTS.has(toName)) return FLEET_HAIPHONG;
  if (MIENTRUNG_PORTS.has(fromName) || MIENTRUNG_PORTS.has(toName)) return FLEET_MIENTRUNG;
  if (VUNGTAU_PORTS.has(fromName) || VUNGTAU_PORTS.has(toName)) return FLEET_VUNGTAU;
  return FLEET_VUNGTAU;
}

const vessels = [];
const positionRows = [];
const voyageRows = [];
const predictionRows = [];
const anomalyRows = [];
const fleetVesselRows = [];

for (let i = 0; i < TOTAL_VESSELS; i++) {
  const shipType = pick(SHIP_TYPES_WEIGHTED);
  const isVietnamese = shipType === "fishing" ? true : rand() < 0.7;
  const { mmsi, flag } = generateMmsi(isVietnamese);
  const name = generateVesselName(isVietnamese, shipType);
  const imo = shipType === "fishing" ? null : generateImo();
  const callSign = generateCallSign(flag);

  const dims =
    shipType === "cargo" ? [randInt(120, 300), randInt(18, 45)] :
    shipType === "tanker" ? [randInt(130, 330), randInt(20, 48)] :
    shipType === "passenger" ? [randInt(40, 180), randInt(10, 28)] :
    shipType === "fishing" ? [randInt(8, 35), randInt(3, 8)] :
    shipType === "tug" ? [randInt(15, 40), randInt(5, 12)] :
    shipType === "military" ? [randInt(60, 140), randInt(9, 18)] :
    [randInt(20, 90), randInt(6, 16)];

  const vessel = {
    id: uuid(),
    mmsi,
    imo,
    name,
    callSign,
    shipType,
    flag,
    length: dims[0],
    width: dims[1],
  };
  vessels.push(vessel);

  // --- Trajectory + voyage -------------------------------------------------
  let waypoints;
  let fromName;
  let toName;
  let cruiseSpeedKn;
  let jitterKm;

  if (shipType === "fishing") {
    const ground = pick(FISHING_GROUNDS);
    waypoints = ground.waypoints;
    fromName = ground.name;
    toName = ground.name;
    cruiseSpeedKn = randFloat(3, 7);
    jitterKm = 1.5;
  } else {
    const route = pick(ROUTES);
    const reversed = rand() < 0.5;
    waypoints = reversed ? [...route.waypoints].reverse() : route.waypoints;
    fromName = reversed ? route.toName : route.fromName;
    toName = reversed ? route.fromName : route.toName;
    cruiseSpeedKn =
      shipType === "tanker" ? randFloat(10, 14) :
      shipType === "cargo" ? randFloat(12, 18) :
      shipType === "passenger" ? randFloat(14, 22) :
      shipType === "tug" ? randFloat(6, 10) :
      shipType === "military" ? randFloat(12, 16) :
      randFloat(8, 14);
    jitterKm = 2.5;
  }

  const fleet = classifyFleet({ shipType, isVietnamese, fromName, toName });
  fleetVesselRows.push({ fleetId: fleet.id, vesselId: vessel.id });

  // Voyage progress: some still departing, some mid-transit, some arrived.
  const voyageState = pick(["departing", "transit", "transit", "arrived", "anchored_dest"]);
  let progressEnd;
  if (voyageState === "departing") progressEnd = randFloat(0.03, 0.15);
  else if (voyageState === "transit") progressEnd = randFloat(0.25, 0.85);
  else progressEnd = randFloat(0.97, 1.0);

  const progressStart = Math.max(0, progressEnd - randFloat(0.35, 0.6));
  const intervalMinutes = shipType === "fishing" ? 20 : 15;
  const legEndOffsetMin = randInt(0, 180); // stagger "now" across the fleet
  const legEndMs = NOW - legEndOffsetMin * 60_000;

  const fixes = buildTrajectory({
    waypoints,
    progressStart,
    progressEnd,
    endTimeMs: legEndMs,
    cruiseSpeedKn,
    intervalMinutes,
    jitterKm,
  });

  function fixesToPositionRows(legFixes, destinationName, forceArrivalStatus) {
    return legFixes.map((fix, idx) => {
      const isLast = idx === legFixes.length - 1;
      let navStatus = shipType === "fishing" ? NAV_STATUS.fishing : NAV_STATUS.underway;
      if (isLast && forceArrivalStatus) {
        navStatus = fix.sog < 0.5 ? NAV_STATUS.anchored : navStatus;
      }
      return {
        vesselId: vessel.id,
        timestamp: fix.timestamp,
        latitude: fix.lat,
        longitude: fix.lon,
        sog: navStatus === NAV_STATUS.anchored ? 0 : fix.sog,
        cog: fix.cog,
        heading: Math.round((fix.cog + randFloat(-3, 3) + 360) % 360),
        navStatus,
        destination: destinationName.toUpperCase(),
      };
    });
  }

  const forceCurrentArrival = voyageState === "arrived" || voyageState === "anchored_dest";
  positionRows.push(...fixesToPositionRows(fixes, toName, forceCurrentArrival));

  const departureTime = fixes[0].timestamp;
  const lastFix = fixes[fixes.length - 1];
  // Recorded for the collision-risk pass below, which needs every vessel's
  // final position/course after the whole fleet has been generated.
  vessel.lastLat = lastFix.lat;
  vessel.lastLon = lastFix.lon;
  vessel.lastCog = lastFix.cog;
  vessel.lastTimestamp = lastFix.timestamp;
  vessel.isMoving = lastFix.sog >= 0.5; // mirrors STATIONARY_SOG_KNOTS in src/lib/constants.ts
  const totalKm = routeTotalDistanceKm(waypoints);
  const remainingKm = totalKm * (1 - progressEnd);
  const etaMs = new Date(lastFix.timestamp).getTime() + (remainingKm / ((cruiseSpeedKn * 1.852) || 1)) * 3_600_000;

  voyageRows.push({
    vesselId: vessel.id,
    departurePort: fromName,
    destinationPort: toName,
    departureTime,
    estimatedArrival: new Date(etaMs).toISOString(),
    actualArrival: forceCurrentArrival ? lastFix.timestamp : null,
    status: forceCurrentArrival ? "completed" : "in_progress",
  });

  // Chain several earlier, fully completed voyages backward in time along
  // the same corridor (alternating direction — a return trip, then the
  // next voyage out, etc.) so each vessel has real trajectory depth for
  // paginated AIS message history and longer trajectory-window views, not
  // just its current leg.
  const numHistoricalLegs = shipType === "fishing" ? randInt(3, 6) : randInt(2, 4);
  let chainEndMs = new Date(fixes[0].timestamp).getTime();
  let sameDirectionAsCurrent = true;

  for (let h = 0; h < numHistoricalLegs; h++) {
    sameDirectionAsCurrent = !sameDirectionAsCurrent;
    const legWaypoints = sameDirectionAsCurrent ? waypoints : [...waypoints].reverse();
    const legFromName = sameDirectionAsCurrent ? fromName : toName;
    const legToName = sameDirectionAsCurrent ? toName : fromName;

    const portGapHours = randInt(2, 14);
    chainEndMs -= portGapHours * 3_600_000;

    const legFixes = buildTrajectory({
      waypoints: legWaypoints,
      progressStart: 0,
      progressEnd: 1,
      endTimeMs: chainEndMs,
      cruiseSpeedKn,
      intervalMinutes,
      jitterKm,
    });

    positionRows.push(...fixesToPositionRows(legFixes, legToName, true));

    voyageRows.push({
      vesselId: vessel.id,
      departurePort: legFromName,
      destinationPort: legToName,
      departureTime: legFixes[0].timestamp,
      estimatedArrival: legFixes[legFixes.length - 1].timestamp,
      actualArrival: legFixes[legFixes.length - 1].timestamp,
      status: "completed",
    });

    chainEndMs = new Date(legFixes[0].timestamp).getTime();
  }

  // --- Predictions (subset of moving vessels) ------------------------------
  if (voyageState === "transit" && rand() < 0.4) {
    const horizon = pick([30, 60, 120, 180]);
    const steps = 4;
    const predictedPoints = [];
    let cursor = { lat: lastFix.lat, lon: lastFix.lon };
    for (let s = 1; s <= steps; s++) {
      const stepMin = horizon / steps;
      const distKm = ((cruiseSpeedKn * 1.852) / 60) * stepMin;
      cursor = destPoint(cursor, lastFix.cog + randFloat(-5, 5), distKm);
      predictedPoints.push({
        timestamp: new Date(new Date(lastFix.timestamp).getTime() + s * stepMin * 60_000).toISOString(),
        latitude: cursor.lat,
        longitude: cursor.lon,
        confidence: Number(Math.max(0.4, 0.92 - s * 0.12).toFixed(2)),
      });
    }
    predictionRows.push({
      vesselId: vessel.id,
      predictionType: "trajectory",
      horizonMinutes: horizon,
      predictedLatitude: predictedPoints[predictedPoints.length - 1].latitude,
      predictedLongitude: predictedPoints[predictedPoints.length - 1].longitude,
      predictedEta: null,
      confidence: predictedPoints[predictedPoints.length - 1].confidence,
      metadata: { isMock: true, points: predictedPoints },
    });

    predictionRows.push({
      vesselId: vessel.id,
      predictionType: "eta",
      horizonMinutes: horizon,
      predictedLatitude: null,
      predictedLongitude: null,
      predictedEta: new Date(etaMs).toISOString(),
      confidence: Number(randFloat(0.6, 0.93).toFixed(2)),
      metadata: { isMock: true, destinationPort: toName, errorMarginMinutes: randInt(15, 90) },
    });
  }

  // --- Anomalies (demo-only, small subset) --------------------------------
  const anomalyRoll = rand();
  if (anomalyRoll < 0.08) {
    const type = pick(["route_deviation", "abnormal_speed", "sudden_course_change", "ais_signal_gap", "long_stationary"]);
    const severity = pick(["low", "medium", "high", "critical"]);
    const descriptions = {
      route_deviation: `Vessel deviated ~${randInt(5, 25)} km from its historical route toward ${toName}.`,
      abnormal_speed: `Reported SOG of ${randInt(28, 40)} kn exceeds the expected range for a ${shipType} vessel.`,
      sudden_course_change: `COG changed by ${randInt(60, 150)}° within a single reporting interval.`,
      ais_signal_gap: `No AIS reports received for ${randInt(3, 12)} hours before this fix.`,
      long_stationary: `Vessel has remained stationary for over ${randInt(12, 48)} hours outside a designated anchorage.`,
    };
    anomalyRows.push({
      vesselId: vessel.id,
      detectedAt: lastFix.timestamp,
      type,
      severity,
      score: Number(randFloat(0.4, 0.98).toFixed(2)),
      latitude: lastFix.lat,
      longitude: lastFix.lon,
      description: `DEMO/MOCK: ${descriptions[type]}`,
      status: pick(["open", "open", "acknowledged", "resolved"]),
    });
  }
}

// --- Collision-risk anomalies (needs the whole fleet's final positions) ----
// Anomalies are single-vessel rows (see schema), so a close-quarters
// situation between two vessels is recorded against one of them, naming
// the other in the description — same shape as every other anomaly type,
// no schema change needed for a "vessel pair".
{
  const COLLISION_RISK_KM = 1.5; // ~0.8 nm — a genuinely tight CPA for two ships
  const MAX_COLLISION_ANOMALIES = 3;
  const candidates = [];

  for (let a = 0; a < vessels.length; a++) {
    const va = vessels[a];
    if (!va.isMoving || va.lastLat == null) continue;
    for (let b = a + 1; b < vessels.length; b++) {
      const vb = vessels[b];
      if (!vb.isMoving || vb.lastLat == null) continue;
      const distKm = haversineKm(
        { lat: va.lastLat, lon: va.lastLon },
        { lat: vb.lastLat, lon: vb.lastLon }
      );
      if (distKm <= COLLISION_RISK_KM) candidates.push({ va, vb, distKm });
    }
  }

  candidates.sort((x, y) => x.distKm - y.distKm);

  for (const { va, vb, distKm } of candidates.slice(0, MAX_COLLISION_ANOMALIES)) {
    const midLat = (va.lastLat + vb.lastLat) / 2;
    const midLon = (va.lastLon + vb.lastLon) / 2;
    const detectedAt = va.lastTimestamp > vb.lastTimestamp ? va.lastTimestamp : vb.lastTimestamp;
    anomalyRows.push({
      vesselId: va.id,
      detectedAt,
      type: "collision_risk",
      severity: distKm < 0.5 ? "critical" : "high",
      score: Number(Math.max(0.7, 1 - distKm / COLLISION_RISK_KM).toFixed(2)),
      latitude: midLat,
      longitude: midLon,
      description: `DEMO/MOCK: Closing to ${distKm.toFixed(2)} km of ${vb.name} (MMSI ${vb.mmsi}) on a converging course.`,
      status: "open",
    });
  }
}

// ---------------------------------------------------------------------------
// Emit SQL
// ---------------------------------------------------------------------------
const lines = [];
lines.push("-- GENERATED FILE. Regenerate with: node scripts/generate-seed.mjs");
lines.push("-- Demo AIS dataset for ais-maritime-monitoring. All data is synthetic.");
lines.push("");

lines.push(`-- ${vessels.length} vessels`);
lines.push("insert into public.vessels (id, mmsi, imo, name, call_sign, ship_type, flag, length, width) values");
lines.push(
  vessels
    .map(
      (v) =>
        `  (${sqlStr(v.id)}, ${sqlStr(v.mmsi)}, ${sqlStr(v.imo)}, ${sqlStr(v.name)}, ${sqlStr(v.callSign)}, ${sqlStr(v.shipType)}, ${sqlStr(v.flag)}, ${sqlNum(v.length)}, ${sqlNum(v.width)})`
    )
    .join(",\n") + ";"
);
lines.push("");

lines.push(`-- ${FLEETS.length} fleets`);
lines.push("insert into public.fleets (id, name, description) values");
lines.push(
  FLEETS.map((f) => `  (${sqlStr(f.id)}, ${sqlStr(f.name)}, ${sqlStr(f.description)})`).join(",\n") + ";"
);
lines.push("");

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

lines.push(`-- ${positionRows.length} AIS positions`);
for (const batch of chunk(positionRows, 500)) {
  lines.push(
    "insert into public.ais_positions (vessel_id, \"timestamp\", latitude, longitude, sog, cog, heading, nav_status, destination) values"
  );
  lines.push(
    batch
      .map(
        (p) =>
          `  (${sqlStr(p.vesselId)}, ${sqlStr(p.timestamp)}, ${sqlNum(p.latitude)}, ${sqlNum(p.longitude)}, ${sqlNum(p.sog)}, ${sqlNum(p.cog)}, ${sqlNum(p.heading)}, ${sqlStr(p.navStatus)}, ${sqlStr(p.destination)})`
      )
      .join(",\n") + ";"
  );
}
lines.push("");

lines.push(`-- ${voyageRows.length} voyages`);
for (const batch of chunk(voyageRows, 500)) {
  lines.push(
    "insert into public.voyages (vessel_id, departure_port, destination_port, departure_time, estimated_arrival, actual_arrival, status) values"
  );
  lines.push(
    batch
      .map(
        (v) =>
          `  (${sqlStr(v.vesselId)}, ${sqlStr(v.departurePort)}, ${sqlStr(v.destinationPort)}, ${sqlStr(v.departureTime)}, ${sqlStr(v.estimatedArrival)}, ${sqlStr(v.actualArrival)}, ${sqlStr(v.status)})`
      )
      .join(",\n") + ";"
  );
}
lines.push("");

if (predictionRows.length > 0) {
  lines.push(`-- ${predictionRows.length} predictions (DEMO/MOCK)`);
  for (const batch of chunk(predictionRows, 500)) {
    lines.push(
      "insert into public.predictions (vessel_id, prediction_type, horizon_minutes, predicted_latitude, predicted_longitude, predicted_eta, confidence, metadata) values"
    );
    lines.push(
      batch
        .map(
          (p) =>
            `  (${sqlStr(p.vesselId)}, ${sqlStr(p.predictionType)}, ${sqlNum(p.horizonMinutes)}, ${sqlNum(p.predictedLatitude)}, ${sqlNum(p.predictedLongitude)}, ${sqlStr(p.predictedEta)}, ${sqlNum(p.confidence)}, ${sqlStr(JSON.stringify(p.metadata))}::jsonb)`
        )
        .join(",\n") + ";"
    );
  }
  lines.push("");
}

if (anomalyRows.length > 0) {
  lines.push(`-- ${anomalyRows.length} anomalies (DEMO/MOCK)`);
  for (const batch of chunk(anomalyRows, 500)) {
    lines.push(
      "insert into public.anomalies (vessel_id, detected_at, type, severity, score, latitude, longitude, description, status) values"
    );
    lines.push(
      batch
        .map(
          (a) =>
            `  (${sqlStr(a.vesselId)}, ${sqlStr(a.detectedAt)}, ${sqlStr(a.type)}, ${sqlStr(a.severity)}, ${sqlNum(a.score)}, ${sqlNum(a.latitude)}, ${sqlNum(a.longitude)}, ${sqlStr(a.description)}, ${sqlStr(a.status)})`
        )
        .join(",\n") + ";"
    );
  }
  lines.push("");
}

lines.push(`-- ${fleetVesselRows.length} fleet memberships`);
for (const batch of chunk(fleetVesselRows, 500)) {
  lines.push("insert into public.fleet_vessels (fleet_id, vessel_id) values");
  lines.push(
    batch.map((r) => `  (${sqlStr(r.fleetId)}, ${sqlStr(r.vesselId)})`).join(",\n") + ";"
  );
}
lines.push("");

const outPath = join(process.cwd(), "supabase", "seed", "02_vessels_and_ais.sql");
writeFileSync(outPath, lines.join("\n"), "utf8");

console.log(`Generated ${vessels.length} vessels, ${positionRows.length} positions, ${voyageRows.length} voyages, ${predictionRows.length} predictions, ${anomalyRows.length} anomalies, ${FLEETS.length} fleets`);
console.log(`Wrote ${outPath}`);
