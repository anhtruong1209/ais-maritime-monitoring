export type ShipType =
  | "cargo"
  | "tanker"
  | "passenger"
  | "fishing"
  | "tug"
  | "military"
  | "other";

export type VesselStatus = "moving" | "anchored" | "stopped" | "offline";

export interface Vessel {
  id: string;
  mmsi: string;
  imo: string | null;
  name: string;
  callSign: string | null;
  shipType: ShipType;
  flag: string;
  length: number | null;
  width: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface VesselWithLatestPosition extends Vessel {
  latestPosition: AISPositionSummary | null;
  status: VesselStatus;
}

export interface AISPositionSummary {
  timestamp: string;
  latitude: number;
  longitude: number;
  sog: number;
  cog: number;
  heading: number | null;
  navStatus: string | null;
  destination: string | null;
}
