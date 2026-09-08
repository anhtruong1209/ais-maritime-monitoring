import { deriveVesselStatus } from "@/lib/vessel-status";
import type {
  AISPositionRow,
  AnomalyRow,
  FleetRow,
  PortRow,
  PredictionRow,
  VesselRow,
  VesselWithLatestPositionRow,
  VoyageRow,
} from "./database.types";
import type {
  AISPosition,
  Anomaly,
  AnomalySeverity,
  AnomalyStatus,
  AnomalyType,
  Fleet,
  Port,
  Prediction,
  PredictionType,
  ShipType,
  Vessel,
  VesselWithLatestPosition,
  Voyage,
  VoyageStatus,
} from "@/types";

export function mapVessel(row: VesselRow): Vessel {
  return {
    id: row.id,
    mmsi: row.mmsi,
    imo: row.imo,
    name: row.name,
    callSign: row.call_sign,
    shipType: row.ship_type as ShipType,
    flag: row.flag,
    length: row.length,
    width: row.width,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapVesselWithLatestPosition(
  row: VesselWithLatestPositionRow,
  now: Date = new Date()
): VesselWithLatestPosition {
  const latestPosition = row.latest_timestamp
    ? {
        timestamp: row.latest_timestamp,
        latitude: row.latest_latitude!,
        longitude: row.latest_longitude!,
        sog: row.latest_sog ?? 0,
        cog: row.latest_cog ?? 0,
        heading: row.latest_heading,
        navStatus: row.latest_nav_status,
        destination: row.latest_destination,
      }
    : null;

  return {
    ...mapVessel(row),
    latestPosition,
    status: deriveVesselStatus(latestPosition, now),
  };
}

export function mapAISPosition(row: AISPositionRow): AISPosition {
  return {
    id: row.id,
    vesselId: row.vessel_id,
    timestamp: row.timestamp,
    latitude: row.latitude,
    longitude: row.longitude,
    sog: row.sog,
    cog: row.cog,
    heading: row.heading,
    navStatus: row.nav_status,
    destination: row.destination,
    createdAt: row.created_at,
  };
}

export function mapVoyage(row: VoyageRow): Voyage {
  return {
    id: row.id,
    vesselId: row.vessel_id,
    departurePort: row.departure_port,
    destinationPort: row.destination_port,
    departureTime: row.departure_time,
    estimatedArrival: row.estimated_arrival,
    actualArrival: row.actual_arrival,
    status: row.status as VoyageStatus,
    createdAt: row.created_at,
  };
}

export function mapPrediction(row: PredictionRow): Prediction {
  return {
    id: row.id,
    vesselId: row.vessel_id,
    predictionType: row.prediction_type as PredictionType,
    createdAt: row.created_at,
    horizonMinutes: row.horizon_minutes,
    predictedLatitude: row.predicted_latitude,
    predictedLongitude: row.predicted_longitude,
    predictedEta: row.predicted_eta,
    confidence: row.confidence,
    metadata: row.metadata,
  };
}

export function mapAnomaly(row: AnomalyRow): Anomaly {
  return {
    id: row.id,
    vesselId: row.vessel_id,
    detectedAt: row.detected_at,
    type: row.type as AnomalyType,
    severity: row.severity as AnomalySeverity,
    score: row.score,
    latitude: row.latitude,
    longitude: row.longitude,
    description: row.description,
    status: row.status as AnomalyStatus,
    createdAt: row.created_at,
  };
}

export function mapFleet(row: FleetRow): Fleet {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
  };
}

export function mapPort(row: PortRow): Port {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    country: row.country,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at,
  };
}
