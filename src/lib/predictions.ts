import { haversineDistanceKm } from "@/lib/geo";
import { DEFAULT_PREDICTION_HORIZON_MINUTES, PREDICTION_HORIZON_OPTIONS } from "@/lib/constants";
import type { Port } from "@/types";

const ALLOWED_HORIZONS: Set<number> = new Set(PREDICTION_HORIZON_OPTIONS.map((o) => o.minutes));

export function resolveHorizonMinutes(raw: string | null): number {
  const parsed = raw ? Number(raw) : NaN;
  return ALLOWED_HORIZONS.has(parsed) ? parsed : DEFAULT_PREDICTION_HORIZON_MINUTES;
}

export function resolveDestinationPort(
  ports: Port[],
  destinationName: string | null,
  from: { latitude: number; longitude: number }
): Port {
  const byName = destinationName
    ? ports.find((p) => p.name.toUpperCase() === destinationName.toUpperCase())
    : undefined;
  if (byName) return byName;

  // Demo fallback: if the reported destination isn't one of our seeded
  // Vietnamese ports (e.g. a foreign port name), approximate with the
  // nearest known port so the ETA card still has something to show.
  return ports.reduce((closest, port) =>
    haversineDistanceKm(from, { latitude: port.latitude, longitude: port.longitude }) <
    haversineDistanceKm(from, { latitude: closest.latitude, longitude: closest.longitude })
      ? port
      : closest
  );
}
