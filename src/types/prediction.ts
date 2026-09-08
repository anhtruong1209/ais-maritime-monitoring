export type PredictionType = "trajectory" | "eta" | "destination" | "anomaly";

export interface PredictedPoint {
  timestamp: string;
  latitude: number;
  longitude: number;
  confidence?: number;
  // Uncertainty-corridor prep (see PredictionConfidenceCorridor) — mocked
  // for now (derived from confidence, not a real predictive interval),
  // but the shape is what a real model's interval output would fill in.
  confidenceRadiusKm?: number;
  upperBound?: { latitude: number; longitude: number };
  lowerBound?: { latitude: number; longitude: number };
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
  // Evaluation fields — unpopulated until a real model + a way to observe
  // the actual outcome exist, but the shape is ready for that comparison
  // (see EtaComparisonCard and the `predictions` table columns).
  modelName?: string | null;
  actualLatitude?: number | null;
  actualLongitude?: number | null;
  actualEta?: string | null;
  errorMinutes?: number | null;
}

export interface TrajectoryPredictionResult {
  vesselId: string;
  generatedAt: string;
  horizonMinutes: number;
  points: PredictedPoint[];
  isMock: boolean;
  modelName: string;
}

export interface EtaPredictionResult {
  vesselId: string;
  generatedAt: string;
  destinationPort: string;
  predictedEta: string;
  confidence: number;
  errorMarginMinutes: number;
  isMock: boolean;
  modelName: string;
  remainingDistanceKm: number;
  currentSpeedKnots: number;
}

/** Prep only — not wired to a real predictor yet (see AGENTS/README: "next
 * AI phase"). Kept here so the API/component contract exists before the
 * feature is turned on. */
export interface DestinationPredictionCandidate {
  portName: string;
  probability: number;
}

export interface DestinationPredictionResult {
  vesselId: string;
  generatedAt: string;
  candidates: DestinationPredictionCandidate[];
  isMock: boolean;
}
