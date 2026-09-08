import type {
  AISPosition,
  EtaPredictionResult,
  TrajectoryPredictionResult,
} from "@/types";

export interface TrajectoryPredictionInput {
  vesselId: string;
  recentPositions: AISPosition[];
  horizonMinutes: number;
}

export interface EtaPredictionInput {
  vesselId: string;
  recentPositions: AISPosition[];
  destinationPort: string;
  destinationLatitude: number;
  destinationLongitude: number;
}

/**
 * Provider abstraction for the AI prediction backend.
 *
 * Architecture: Next.js -> this interface -> Python FastAPI -> ML/DL model.
 * `MockPredictionService` is the MVP implementation. `HttpPredictionService`
 * (see http-prediction-service.ts) is a ready-to-wire stub that will call
 * the real FastAPI service once it exists — no call site changes needed.
 */
export interface PredictionService {
  predictTrajectory(
    input: TrajectoryPredictionInput
  ): Promise<TrajectoryPredictionResult>;
  predictEta(input: EtaPredictionInput): Promise<EtaPredictionResult>;
}
