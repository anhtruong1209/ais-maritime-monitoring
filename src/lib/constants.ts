import type { AnomalySeverity, AnomalyType, ShipType, VesselStatus } from "@/types";

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

export const ANOMALY_TYPES: AnomalyType[] = [
  "route_deviation",
  "abnormal_speed",
  "sudden_course_change",
  "ais_signal_gap",
  "long_stationary",
];

export const ANOMALY_TYPE_LABELS: Record<AnomalyType, string> = {
  route_deviation: "Route Deviation",
  abnormal_speed: "Abnormal Speed",
  sudden_course_change: "Sudden Course Change",
  ais_signal_gap: "AIS Signal Gap",
  long_stationary: "Long Stationary Period",
};

export const ANOMALY_SEVERITY_ORDER: AnomalySeverity[] = [
  "low",
  "medium",
  "high",
  "critical",
];

// A vessel is considered "offline" if no AIS fix has been received for
// longer than this window.
export const OFFLINE_THRESHOLD_MINUTES = 60;

// SOG (knots) below this is treated as effectively stationary.
export const STATIONARY_SOG_KNOTS = 0.5;

export const DEFAULT_PAGE_SIZE = 25;

export const TRAJECTORY_WINDOW_OPTIONS = [
  { label: "Last 1 hour", hours: 1 },
  { label: "Last 6 hours", hours: 6 },
  { label: "Last 12 hours", hours: 12 },
  { label: "Last 24 hours", hours: 24 },
] as const;
