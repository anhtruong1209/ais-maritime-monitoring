import { COLLISION_CPA_THRESHOLDS_KM, COLLISION_TCPA_HORIZON_MINUTES } from "@/lib/constants";
import { destinationPoint, type LatLng } from "@/lib/geo";

export type CollisionRiskLevel = "low" | "medium" | "high" | "critical";

export interface VesselKinematics extends LatLng {
  /** Speed over ground, knots. */
  sog: number;
  /** Course over ground, degrees clockwise from true north. */
  cog: number;
}

export interface CpaTcpaResult {
  /** Predicted closest distance the two vessels will reach, holding each
   * one's current SOG/COG constant (km). */
  cpaKm: number;
  /** Minutes until that closest approach. `null` when the pair isn't on a
   * closing course at all (parallel/diverging tracks) — `cpaKm` is then
   * just the current distance between them. */
  tcpaMinutes: number | null;
}

export interface CollisionRiskAssessment extends CpaTcpaResult {
  /** 0..1, provisional — see COLLISION_CPA_THRESHOLDS_KM. */
  riskScore: number;
  riskLevel: CollisionRiskLevel;
}

const KM_PER_DEG_LAT = 111.32;
const KNOTS_TO_KMH = 1.852;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Flat-earth (equirectangular) projection around `origin`, in km. Only
 * valid at the short ranges (tens of km) collision-risk pairing is
 * meaningful at — NOT a general-purpose projection (see
 * haversineDistanceKm in geo.ts for the great-circle version used
 * everywhere else in the app). */
function toLocalXYKm(origin: LatLng, point: LatLng): { x: number; y: number } {
  const kmPerDegLon = KM_PER_DEG_LAT * Math.cos(toRad(origin.latitude));
  return {
    x: (point.longitude - origin.longitude) * kmPerDegLon,
    y: (point.latitude - origin.latitude) * KM_PER_DEG_LAT,
  };
}

function velocityKmh(sogKnots: number, cogDeg: number): { vx: number; vy: number } {
  const speed = sogKnots * KNOTS_TO_KMH;
  const rad = toRad(cogDeg);
  // COG is bearing from true north, so vx is the eastward component.
  return { vx: speed * Math.sin(rad), vy: speed * Math.cos(rad) };
}

/**
 * Deterministic CPA/TCPA baseline: assumes both vessels hold their current
 * SOG/COG constant and finds when/where their straight-line paths come
 * closest. This is the non-AI baseline the Phase 2 research design calls
 * for — a future trajectory-informed or ML collision-risk model is meant
 * to be compared against this, not to replace it outright.
 */
export function calculateCpaTcpa(a: VesselKinematics, b: VesselKinematics): CpaTcpaResult {
  const posB = toLocalXYKm(a, b);
  const velA = velocityKmh(a.sog, a.cog);
  const velB = velocityKmh(b.sog, b.cog);

  const dx = posB.x;
  const dy = posB.y;
  const dvx = velB.vx - velA.vx;
  const dvy = velB.vy - velA.vy;
  const relSpeedSq = dvx * dvx + dvy * dvy;

  // Same velocity vector (or both stationary) — distance never changes.
  if (relSpeedSq < 1e-6) {
    return { cpaKm: Math.sqrt(dx * dx + dy * dy), tcpaMinutes: null };
  }

  const tcpaHours = -(dx * dvx + dy * dvy) / relSpeedSq;
  if (tcpaHours <= 0) {
    // Closest approach was in the past on the current heading — not a
    // forward-looking risk.
    return { cpaKm: Math.sqrt(dx * dx + dy * dy), tcpaMinutes: null };
  }

  const cpaX = dx + dvx * tcpaHours;
  const cpaY = dy + dvy * tcpaHours;
  return { cpaKm: Math.sqrt(cpaX * cpaX + cpaY * cpaY), tcpaMinutes: tcpaHours * 60 };
}

/**
 * Classifies a CPA/TCPA pair into a risk level/score. Thresholds are a
 * demo starting point, not a validated maritime safety standard — see
 * COLLISION_CPA_THRESHOLDS_KM/COLLISION_TCPA_HORIZON_MINUTES in
 * lib/constants.ts, flagged in the architecture audit as a future
 * domain-validation question rather than a settled rule.
 */
export function assessCollisionRisk(result: CpaTcpaResult): CollisionRiskAssessment {
  const { cpaKm, tcpaMinutes } = result;

  if (tcpaMinutes == null || tcpaMinutes > COLLISION_TCPA_HORIZON_MINUTES) {
    return { ...result, riskScore: 0.1, riskLevel: "low" };
  }
  if (cpaKm <= COLLISION_CPA_THRESHOLDS_KM.critical) {
    return { ...result, riskScore: 0.95, riskLevel: "critical" };
  }
  if (cpaKm <= COLLISION_CPA_THRESHOLDS_KM.high) {
    return { ...result, riskScore: 0.75, riskLevel: "high" };
  }
  if (cpaKm <= COLLISION_CPA_THRESHOLDS_KM.medium) {
    return { ...result, riskScore: 0.5, riskLevel: "medium" };
  }
  return { ...result, riskScore: 0.2, riskLevel: "low" };
}

/** Where `vessel` would be after `minutes`, holding its current SOG/COG
 * constant — the same straight-line assumption calculateCpaTcpa makes, so
 * the two agree (used to draw the predicted path up to CPA on the map). */
export function projectPosition(vessel: VesselKinematics, minutes: number): LatLng {
  const speedKmh = vessel.sog * KNOTS_TO_KMH;
  const distanceKm = speedKmh * (minutes / 60);
  return destinationPoint(vessel, vessel.cog, distanceKm);
}
