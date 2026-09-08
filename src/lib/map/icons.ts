import L from "leaflet";
import { SHIP_TYPE_COLORS } from "./ship-type-meta";
import type { ShipType } from "@/types";

interface VesselIconOptions {
  shipType: ShipType;
  cog: number;
  selected?: boolean;
  moving?: boolean;
  /** Has an open (unresolved) anomaly — draws a warning ring around the icon. */
  flagged?: boolean;
}

// Sized and styled after MarineTraffic's bold, high-contrast vessel arrows —
// large enough to read at a glance, with a dark outline so any ship-type
// color stays legible against both the dark basemap and light clusters.
// Every vessel renders as the same arrow/hull shape regardless of motion
// state (MarineTraffic does this too) — only opacity changes for
// anchored/stopped/offline vessels, so orientation (COG/heading) always
// reads clearly instead of collapsing to an undirected dot.
function vesselSvg({ shipType, cog, selected, moving, flagged }: VesselIconOptions) {
  const color = SHIP_TYPE_COLORS[shipType];
  const size = selected ? 26 : 20;
  const strokeWidth = selected ? 2.5 : 1.75;
  const opacity = moving ? 1 : 0.75;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
      style="transform: rotate(${cog}deg); transform-origin: center; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.65));">
      ${
        flagged
          ? `<circle cx="12" cy="12" r="11" fill="none" stroke="#ef4444" stroke-width="2" />`
          : ""
      }
      <path d="M12 0.5 L20.5 21 L12 16.5 L3.5 21 Z" fill="${color}" fill-opacity="${opacity}"
        stroke="#04070d" stroke-width="${strokeWidth}" stroke-linejoin="round" />
      ${selected ? `<circle cx="12" cy="12" r="11" fill="none" stroke="#facc15" stroke-width="1.5" stroke-dasharray="2.5 2.5" />` : ""}
    </svg>
  `;
}

export function createVesselIcon(options: VesselIconOptions): L.DivIcon {
  const size = options.selected ? 26 : 20;
  return L.divIcon({
    html: vesselSvg(options),
    className: "vessel-marker-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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
