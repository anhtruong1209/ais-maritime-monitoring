import { CircleMarker, Polygon, Polyline } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import type { PredictedPoint } from "@/types";

/**
 * Renders an AI-predicted route as an animated dashed polyline ("marching
 * ants" via CSS, see .predicted-route-dash in globals.css) — a different
 * color and motion from TrajectoryLayer's solid historical track, so the
 * two read as "actual" vs "predicted" even before you notice the color.
 * Point radius fades with confidence.
 *
 * When points carry upperBound/lowerBound (see PredictedPoint — currently
 * mocked from confidence, see mock-prediction-service.ts), also draws a
 * translucent confidence corridor around the line: prep for a real
 * predictive interval later, not a real one yet.
 *
 * DEMO/MOCK AI PREDICTION — see src/lib/ai/mock-prediction-service.ts.
 * Swapping in real predictions from the future FastAPI service requires
 * no changes here: this component only consumes `PredictedPoint[]`.
 */
export function PredictedRouteLayer({ points }: { points: PredictedPoint[] }) {
  if (points.length === 0) return null;

  const hasCorridor = points.every((p) => p.upperBound && p.lowerBound);
  const corridor: LatLngTuple[] = hasCorridor
    ? [
        ...points.map((p) => [p.upperBound!.latitude, p.upperBound!.longitude] as LatLngTuple),
        ...[...points].reverse().map((p) => [p.lowerBound!.latitude, p.lowerBound!.longitude] as LatLngTuple),
      ]
    : [];

  return (
    <>
      {hasCorridor && (
        <Polygon
          positions={corridor}
          pathOptions={{
            color: "#ea580c",
            weight: 0,
            fillColor: "#ea580c",
            fillOpacity: 0.12,
          }}
          interactive={false}
        />
      )}
      <Polyline
        positions={points.map((p) => [p.latitude, p.longitude] as LatLngTuple)}
        pathOptions={{
          color: "#ea580c",
          weight: 3,
          opacity: 0.95,
          dashArray: "4 6",
          className: "predicted-route-dash",
        }}
      />
      {points.map((p, i) => (
        <CircleMarker
          key={p.timestamp + i}
          center={[p.latitude, p.longitude]}
          radius={3}
          pathOptions={{
            color: "#ea580c",
            fillColor: "#ea580c",
            fillOpacity: p.confidence ?? 0.6,
          }}
        />
      ))}
    </>
  );
}
