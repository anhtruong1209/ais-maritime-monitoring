import type { ShipType } from "@/types";

// Split out from icons.ts (which imports leaflet, a browser-only library
// that touches `window` at module load). This file has no such dependency
// so server components and non-map UI (badges, charts, filters) can safely
// import it without accidentally pulling leaflet into the server bundle.

export const SHIP_TYPE_COLORS: Record<ShipType, string> = {
  cargo: "#3b82f6", // blue
  tanker: "#f59e0b", // amber
  passenger: "#22c55e", // green
  fishing: "#a855f7", // purple
  tug: "#06b6d4", // cyan
  military: "#64748b", // slate
  other: "#94a3b8", // muted slate
};

export const SHIP_TYPE_LABELS: Record<ShipType, string> = {
  cargo: "Cargo",
  tanker: "Tanker",
  passenger: "Passenger",
  fishing: "Fishing",
  tug: "Tug",
  military: "Military",
  other: "Other",
};
