import { interpolate } from "@/lib/geo";
import type { AISPosition } from "@/types";

export interface PlaybackPoint {
  latitude: number;
  longitude: number;
  cog: number;
  timestamp: string;
}

/**
 * Position (and course, for icon rotation) at a given fraction (0-1) of
 * the way through a loaded historical track — time-based, not index-based,
 * so playback speed reflects real elapsed time even when AIS fixes aren't
 * evenly spaced. Pure function over data that's already loaded (see
 * VesselHistoryPanel/PlaybackMarker) — playback never fetches anything.
 */
export function interpolateTrackPosition(
  positions: AISPosition[],
  progress: number
): PlaybackPoint | null {
  if (positions.length === 0) return null;
  if (positions.length === 1) {
    const p = positions[0];
    return { latitude: p.latitude, longitude: p.longitude, cog: p.cog, timestamp: p.timestamp };
  }

  const clamped = Math.min(1, Math.max(0, progress));
  const startMs = new Date(positions[0].timestamp).getTime();
  const endMs = new Date(positions[positions.length - 1].timestamp).getTime();
  const targetMs = startMs + (endMs - startMs) * clamped;

  let i = 0;
  while (i < positions.length - 1 && new Date(positions[i + 1].timestamp).getTime() < targetMs) {
    i++;
  }
  const a = positions[i];
  const b = positions[Math.min(i + 1, positions.length - 1)];
  const aMs = new Date(a.timestamp).getTime();
  const bMs = new Date(b.timestamp).getTime();
  const segmentT = bMs > aMs ? (targetMs - aMs) / (bMs - aMs) : 0;

  const point = interpolate(a, b, segmentT);
  return {
    latitude: point.latitude,
    longitude: point.longitude,
    cog: a.cog,
    timestamp: new Date(targetMs).toISOString(),
  };
}
