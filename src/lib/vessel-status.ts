import { OFFLINE_THRESHOLD_MINUTES, STATIONARY_SOG_KNOTS } from "@/lib/constants";
import type { AISPositionSummary, VesselStatus } from "@/types";

/**
 * Derives display status from the latest AIS fix. Kept as a pure function
 * (not stored) so "moving/anchored/stopped/offline" is always consistent
 * with how stale/slow the data actually is.
 */
export function deriveVesselStatus(
  latestPosition: AISPositionSummary | null,
  now: Date = new Date()
): VesselStatus {
  if (!latestPosition) return "offline";

  const ageMinutes =
    (now.getTime() - new Date(latestPosition.timestamp).getTime()) / 60_000;
  if (ageMinutes > OFFLINE_THRESHOLD_MINUTES) return "offline";

  if (latestPosition.sog < STATIONARY_SOG_KNOTS) {
    return latestPosition.navStatus === "at anchor" ? "anchored" : "stopped";
  }

  return "moving";
}
