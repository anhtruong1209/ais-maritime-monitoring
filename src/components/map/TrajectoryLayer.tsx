import { Polyline } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import type { AISPosition } from "@/types";

/** Renders a vessel's historical (actual) AIS track as a SOLID polyline —
 * predicted routes (PredictedRouteLayer) are dashed, so solid-vs-dashed is
 * the primary visual cue for "what actually happened" vs "what the model
 * expects to happen next", on top of the color difference. Deliberately
 * not a blue: most basemaps render open ocean as a similar blue, which
 * made an earlier blue track nearly invisible out at sea. */
export function TrajectoryLayer({ positions }: { positions: AISPosition[] }) {
  if (positions.length < 2) return null;

  return (
    <Polyline
      positions={positions.map((p) => [p.latitude, p.longitude] as LatLngTuple)}
      pathOptions={{ color: "#db2777", weight: 3, opacity: 0.9 }}
    />
  );
}
