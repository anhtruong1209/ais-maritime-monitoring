import { Polyline } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import type { AISPosition } from "@/types";

/** Renders a vessel's historical AIS track as a solid polyline. */
export function TrajectoryLayer({ positions }: { positions: AISPosition[] }) {
  if (positions.length < 2) return null;

  return (
    <Polyline
      positions={positions.map((p) => [p.latitude, p.longitude] as LatLngTuple)}
      pathOptions={{ color: "#38bdf8", weight: 3, opacity: 0.85 }}
    />
  );
}
