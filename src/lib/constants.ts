import type {
  AnomalySeverity,
  AnomalyStatus,
  AnomalyType,
  ShipType,
  VesselStatus,
  VoyageStatus,
} from "@/types";

// Shared sentinel for "no filter selected" in dropdowns backed by a
// `?: string` query param (ship type, status, etc.) — kept here so every
// filter UI and its page use the exact same value.
export const ALL = "all";

export const SHIP_TYPES: ShipType[] = [
  "cargo",
  "tanker",
  "passenger",
  "fishing",
  "tug",
  "military",
  "other",
];

export const VESSEL_STATUSES: VesselStatus[] = [
  "moving",
  "anchored",
  "stopped",
  "offline",
];

export const VESSEL_STATUS_LABELS: Record<VesselStatus, string> = {
  moving: "Moving",
  anchored: "Anchored",
  stopped: "Stopped",
  offline: "Offline",
};

export const ANOMALY_TYPES: AnomalyType[] = [
  "route_deviation",
  "abnormal_speed",
  "sudden_course_change",
  "ais_signal_gap",
  "long_stationary",
  "collision_risk",
];

export const ANOMALY_TYPE_LABELS: Record<AnomalyType, string> = {
  route_deviation: "Route Deviation",
  abnormal_speed: "Abnormal Speed",
  sudden_course_change: "Sudden Course Change",
  ais_signal_gap: "AIS Signal Gap",
  long_stationary: "Long Stationary Period",
  collision_risk: "Collision Risk",
};

export const ANOMALY_SEVERITY_ORDER: AnomalySeverity[] = [
  "low",
  "medium",
  "high",
  "critical",
];

// `as const` here (unlike the arrays above) so zod's z.enum() can infer the
// exact literal union instead of widening to `string` — callers that need a
// strict AnomalyStatus/VoyageStatus (e.g. VoyageFilters.status) rely on that.
export const ANOMALY_STATUSES = [
  "open",
  "acknowledged",
  "resolved",
  "dismissed",
] as const satisfies readonly AnomalyStatus[];

export const VOYAGE_STATUSES = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const satisfies readonly VoyageStatus[];

// A vessel is considered "offline" if no AIS fix has been received for
// longer than this window.
export const OFFLINE_THRESHOLD_MINUTES = 60;

// SOG (knots) below this is treated as effectively stationary.
export const STATIONARY_SOG_KNOTS = 0.5;

export const DEFAULT_PAGE_SIZE = 25;

export const TRAJECTORY_WINDOW_OPTIONS = [
  { label: "1h", hours: 1 },
  { label: "3h", hours: 3 },
  { label: "6h", hours: 6 },
  { label: "9h", hours: 9 },
  { label: "12h", hours: 12 },
  { label: "24h", hours: 24 },
] as const;

export const PREDICTION_HORIZON_OPTIONS = [
  { label: "30m", minutes: 30 },
  { label: "1h", minutes: 60 },
  { label: "2h", minutes: 120 },
  { label: "3h", minutes: 180 },
  { label: "6h", minutes: 360 },
] as const;

export const DEFAULT_PREDICTION_HORIZON_MINUTES = 180;
