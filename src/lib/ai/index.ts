import { HttpPredictionService } from "./http-prediction-service";
import { MockPredictionService } from "./mock-prediction-service";
import type { PredictionService } from "./prediction-service";

// Single switch point: set AI_SERVICE_URL once the Python FastAPI service
// is deployed and every caller of `getPredictionService()` starts using
// real predictions with no other code changes.
export function getPredictionService(): PredictionService {
  const aiServiceUrl = process.env.AI_SERVICE_URL;
  if (aiServiceUrl) {
    return new HttpPredictionService(aiServiceUrl);
  }
  return new MockPredictionService();
}

export type { PredictionService } from "./prediction-service";
export type {
  EtaPredictionInput,
  TrajectoryPredictionInput,
} from "./prediction-service";
