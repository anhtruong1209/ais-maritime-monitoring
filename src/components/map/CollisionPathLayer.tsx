import { CircleMarker, Polyline } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import type { CollisionRiskLevel } from "@/lib/collision";

const RISK_COLORS: Record<CollisionRiskLevel, string> = {
  low: "#64748b",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

export interface CollisionPathPair {
  vesselACurrent: LatLngTuple;
  vesselAProjected: LatLngTuple;
  vesselBCurrent: LatLngTuple;
  vesselBProjected: LatLngTuple;
  riskLevel: CollisionRiskLevel;
}

/**
 * Draws each vessel's predicted straight-line path (current SOG/COG held
 * constant) up to their CPA — closest point of approach — moment, plus a
 * marker at each vessel's projected CPA-time position and a connecting
 * line between them (the predicted gap at closest approach). The visual
 * counterpart to CollisionRiskCard's CPA/TCPA numbers; only rendered while
 * a collision-risk pair is actively selected in that card.
 *
 * Deterministic CPA/TCPA baseline — NOT an AI prediction (see
 * lib/collision.ts) — so this deliberately doesn't reuse PredictedRouteLayer's
 * "AI prediction" dashed-orange styling; color instead reflects risk level.
 */
export function CollisionPathLayer({ pair }: { pair: CollisionPathPair | null }) {
  if (!pair) return null;
  const color = RISK_COLORS[pair.riskLevel];

  return (
    <>
      <Polyline
        positions={[pair.vesselACurrent, pair.vesselAProjected]}
        pathOptions={{ color, weight: 2, opacity: 0.85, dashArray: "6 6" }}
        interactive={false}
      />
      <Polyline
        positions={[pair.vesselBCurrent, pair.vesselBProjected]}
        pathOptions={{ color, weight: 2, opacity: 0.85, dashArray: "6 6" }}
        interactive={false}
      />
      <Polyline
        positions={[pair.vesselAProjected, pair.vesselBProjected]}
        pathOptions={{ color, weight: 2, opacity: 0.6 }}
        interactive={false}
      />
      <CircleMarker
        center={pair.vesselAProjected}
        radius={5}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.9 }}
        interactive={false}
      />
      <CircleMarker
        center={pair.vesselBProjected}
        radius={5}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.9 }}
        interactive={false}
      />
    </>
  );
}
