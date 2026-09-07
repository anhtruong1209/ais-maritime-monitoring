export type PredictionType = "trajectory" | "eta" | "destination" | "anomaly";

export interface PredictedPoint {
  timestamp: string;
  latitude: number;
  longitude: number;
  confidence?: number;
}

export interface Prediction {
  id: string;
  vesselId: string;
  predictionType: PredictionType;
  createdAt: string;
  horizonMinutes: number;
  predictedLatitude: number | null;
  predictedLongitude: number | null;
  predictedEta: string | null;
  confidence: number;
  metadata: Record<string, unknown> | null;
}

export interface TrajectoryPredictionResult {
  vesselId: string;
  generatedAt: string;
  horizonMinutes: number;
  points: PredictedPoint[];
  isMock: boolean;
}

export interface EtaPredictionResult {
  vesselId: string;
  generatedAt: string;
  destinationPort: string;
  predictedEta: string;
  confidence: number;
  errorMarginMinutes: number;
  isMock: boolean;
}
