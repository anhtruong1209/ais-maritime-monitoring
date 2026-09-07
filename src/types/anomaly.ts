export type AnomalyType =
  | "route_deviation"
  | "abnormal_speed"
  | "sudden_course_change"
  | "ais_signal_gap"
  | "long_stationary";

export type AnomalySeverity = "low" | "medium" | "high" | "critical";

export type AnomalyStatus = "open" | "acknowledged" | "resolved" | "dismissed";

export interface Anomaly {
  id: string;
  vesselId: string;
  detectedAt: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  score: number;
  latitude: number;
  longitude: number;
  description: string;
  status: AnomalyStatus;
  createdAt: string;
}

export interface AnomalyWithVessel extends Anomaly {
  vesselName: string;
  vesselMmsi: string;
}
