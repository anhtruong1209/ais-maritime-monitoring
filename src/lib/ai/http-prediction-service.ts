import type { EtaPredictionResult, TrajectoryPredictionResult } from "@/types";
import type {
  EtaPredictionInput,
  PredictionService,
  TrajectoryPredictionInput,
} from "./prediction-service";

/**
 * Future implementation: calls the Python FastAPI AI service
 * (Next.js -> this class -> FastAPI -> ML/DL model). Not wired up yet —
 * `AI_SERVICE_URL` has no default so this throws until it's configured,
 * rather than silently falling back to mock data.
 */
export class HttpPredictionService implements PredictionService {
  constructor(private readonly baseUrl: string) {}

  async predictTrajectory(
    input: TrajectoryPredictionInput
  ): Promise<TrajectoryPredictionResult> {
    const res = await fetch(`${this.baseUrl}/predict/trajectory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      throw new Error(`AI service trajectory prediction failed: ${res.status}`);
    }
    return res.json();
  }

  async predictEta(input: EtaPredictionInput): Promise<EtaPredictionResult> {
    const res = await fetch(`${this.baseUrl}/predict/eta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      throw new Error(`AI service ETA prediction failed: ${res.status}`);
    }
    return res.json();
  }
}
