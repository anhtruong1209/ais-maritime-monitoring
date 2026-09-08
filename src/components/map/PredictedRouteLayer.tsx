import { CircleMarker, Polyline } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import type { PredictedPoint } from "@/types";

/**
 * Renders an AI-predicted route as a dashed polyline, visually distinct
 * from the solid historical track. Point radius fades with confidence.
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
        pathOptions={{ color: "#f59e0b", weight: 3, opacity: 0.9, dashArray: "6 6" }}
      />
      {points.map((p, i) => (
        <CircleMarker
          key={p.timestamp + i}
          center={[p.latitude, p.longitude]}
          radius={3}
          pathOptions={{
            color: "#f59e0b",
            fillColor: "#f59e0b",
            fillOpacity: p.confidence ?? 0.6,
          }}
        />
      ))}
    </>
  );
}
