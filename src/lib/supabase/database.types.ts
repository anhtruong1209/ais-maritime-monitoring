// Raw row shapes as returned by Supabase (snake_case, matches SQL migrations).
// Kept separate from the camelCase domain types in `src/types` so the mapping
// boundary between storage and application code stays explicit.

export interface VesselRow {
  id: string;
  mmsi: string;
  imo: string | null;
  name: string;
  call_sign: string | null;
  ship_type: string;
  flag: string;
  length: number | null;
  width: number | null;
  created_at: string;
  updated_at: string;
}

export interface AISPositionRow {
  id: string;
  vessel_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  sog: number;
  cog: number;
  heading: number | null;
  nav_status: string | null;
  destination: string | null;
  created_at: string;
}

export interface VoyageRow {
  id: string;
  vessel_id: string;
  departure_port: string;
  destination_port: string;
  departure_time: string;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  status: string;
  created_at: string;
}

export interface PredictionRow {
  id: string;
  vessel_id: string;
  prediction_type: string;
  created_at: string;
  horizon_minutes: number;
  predicted_latitude: number | null;
  predicted_longitude: number | null;
  predicted_eta: string | null;
  confidence: number;
  metadata: Record<string, unknown> | null;
  model_name: string | null;
  actual_latitude: number | null;
  actual_longitude: number | null;
  actual_eta: string | null;
  error_minutes: number | null;
}

export interface AnomalyRow {
  id: string;
  vessel_id: string;
  detected_at: string;
  type: string;
  severity: string;
  score: number;
  latitude: number;
  longitude: number;
  description: string;
  status: string;
  created_at: string;
}

export interface VesselWithLatestPositionRow extends VesselRow {
  latest_timestamp: string | null;
  latest_latitude: number | null;
  latest_longitude: number | null;
  latest_sog: number | null;
  latest_cog: number | null;
  latest_heading: number | null;
  latest_nav_status: string | null;
  latest_destination: string | null;
}

export interface FleetRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface PortRow {
  id: string;
  name: string;
  code: string;
  country: string;
  latitude: number;
  longitude: number;
  created_at: string;
}
