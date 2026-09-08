import { CircleMarker, Polyline } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import type { PredictedPoint } from "@/types";

/**
 * Renders an AI-predicted route as an animated dashed polyline ("marching
 * ants" via CSS, see .predicted-route-dash in globals.css) — a different
 * color and motion from TrajectoryLayer's static dashed historical track,
 * so the two are never confused even though both are dashed lines.
 * Point radius fades with confidence.
 *
 * DEMO/MOCK AI PREDICTION — see src/lib/ai/mock-prediction-service.ts.
 * Swapping in real predictions from the future FastAPI service requires
 * no changes here: this component only consumes `PredictedPoint[]`.
 */
export function PredictedRouteLayer({ points }: { points: PredictedPoint[] }) {
  if (points.length === 0) return null;

  return (
    <>
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
