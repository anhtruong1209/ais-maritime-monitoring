import L from "leaflet";
import { OFFLINE_VESSEL_COLOR, SHIP_TYPE_COLORS } from "./ship-type-meta";
import type { ShipType } from "@/types";

interface VesselIconOptions {
  shipType: ShipType;
  cog: number;
  moving?: boolean;
  /** No recent AIS fix — renders gray regardless of ship type instead of
   * just a dimmer version of its usual color. */
  offline?: boolean;
}

// Sized and styled after MarineTraffic's bold, high-contrast vessel arrows —
// large enough to read at a glance, with a dark outline so any ship-type
// color stays legible against both the dark basemap and light clusters.
// Every vessel renders as the same arrow/hull shape regardless of motion
// state (MarineTraffic does this too) — only opacity changes for
// anchored/stopped/offline vessels, so orientation (COG/heading) always
// reads clearly instead of collapsing to an undirected dot. Neither
// "selected" (SelectionRing) nor "flagged" (FlaggedVesselRings) is part of
// this icon — both are separate overlay layers in MaritimeMapInner, so
// the full marker/cluster tree (all vessels, expensive to rebuild at
// fleet scale) never has to be recomputed just because the open-anomaly
// list refreshed or a selection changed.
function vesselSvg({ shipType, cog, moving, offline }: VesselIconOptions) {
  const color = offline ? OFFLINE_VESSEL_COLOR : SHIP_TYPE_COLORS[shipType];
  const strokeWidth = 1.75;
  const opacity = moving ? 1 : 0.75;

  return `
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
      style="transform: rotate(${cog}deg); transform-origin: center; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.65));">
      <path d="M12 0.5 L20.5 21 L12 16.5 L3.5 21 Z" fill="${color}" fill-opacity="${opacity}"
        stroke="#04070d" stroke-width="${strokeWidth}" stroke-linejoin="round" />
    </svg>
  `;
}

export function createVesselIcon(options: VesselIconOptions): L.DivIcon {
  return L.divIcon({
    html: vesselSvg(options),
    className: "vessel-marker-icon",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export function createPortIcon(): L.DivIcon {
  return L.divIcon({
    html: `<svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
      style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));">
      <path d="M12 2 L21 8 V13 C21 18 17 21.5 12 23 C7 21.5 3 18 3 13 V8 Z"
        fill="#f8fafc" stroke="#0f172a" stroke-width="1.5" stroke-linejoin="round" />
      <path d="M12 6 V17 M8 8.5 H16 M8.5 14 H15.5" stroke="#0f172a" stroke-width="1.25" stroke-linecap="round" />
    </svg>`,
    className: "port-marker-icon",
    iconSize: [22, 22],
    iconAnchor: [11, 20],
  });
}

/** Historical-playback "ghost" marker — same hull shape as a real vessel
 * icon so it reads as "a vessel", but a distinct neutral blue with a
 * pulsing ring so it's never mistaken for the vessel's real, current-
 * position marker (which stays put at its actual latest fix). */
export function createPlaybackIcon(cog: number): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 26px; height: 26px;">
        <div class="playback-marker-pulse" style="position:absolute; inset:0; border-radius:9999px; background:#2563eb33;"></div>
        <svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
          style="position:relative; transform: rotate(${cog}deg); transform-origin: center; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.7));">
          <path d="M12 0.5 L20.5 21 L12 16.5 L3.5 21 Z" fill="#2563eb"
            stroke="#eff6ff" stroke-width="1.75" stroke-linejoin="round" />
        </svg>
      </div>
    `,
    className: "playback-marker-icon",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

/** Warning marker for an anomaly location, independent of any vessel icon. */
export function createAnomalyIcon(): L.DivIcon {
  return L.divIcon({
    html: `<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
      style="filter: drop-shadow(0 1px 3px rgba(0,0,0,0.7));">
      <path d="M12 2 L22 20 H2 Z" fill="#ef4444" fill-opacity="0.9" stroke="#04070d" stroke-width="1.5" stroke-linejoin="round" />
      <rect x="11" y="9" width="2" height="6" rx="1" fill="#04070d" />
      <rect x="11" y="16.5" width="2" height="2" rx="1" fill="#04070d" />
    </svg>`,
    className: "anomaly-marker-icon",
    iconSize: [26, 26],
    iconAnchor: [13, 20],
  });
}
