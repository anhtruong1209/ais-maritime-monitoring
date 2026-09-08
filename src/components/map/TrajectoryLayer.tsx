import { Polyline } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import type { AISPosition } from "@/types";

/** Renders a vessel's historical (actual) AIS track as a dashed polyline —
 * a distinct color from PredictedRouteLayer's dashed AI-predicted route so
 * the two are never confused, even though both are dashed. */
export function TrajectoryLayer({ positions }: { positions: AISPosition[] }) {
  if (positions.length < 2) return null;

  return (
    <Polyline
      positions={positions.map((p) => [p.latitude, p.longitude] as LatLngTuple)}
      pathOptions={{ color: "#0369a1", weight: 3, opacity: 0.85, dashArray: "8 6" }}
    />
  );
}
