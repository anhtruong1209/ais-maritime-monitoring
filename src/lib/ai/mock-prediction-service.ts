import { destinationPoint, haversineDistanceKm } from "@/lib/geo";
import type { EtaPredictionResult, PredictedPoint, TrajectoryPredictionResult } from "@/types";
import type {
  EtaPredictionInput,
  PredictionService,
  TrajectoryPredictionInput,
} from "./prediction-service";

const KNOTS_TO_KM_PER_MIN = 1.852 / 60;

/**
 * DEMO / MOCK AI PREDICTION provider.
 *
 * Extrapolates the vessel's last known course and speed in a straight line
 * with a small amount of deterministic jitter, and decays confidence over
 * the prediction horizon. This is NOT a trained model — it exists so the
 * UI and data contracts can be built and demoed before the Python FastAPI
 * AI service exists. Swap `MockPredictionService` for `HttpPredictionService`
 * once that service is available; no caller changes needed.
 */
export class MockPredictionService implements PredictionService {
  async predictTrajectory(
    input: TrajectoryPredictionInput
  ): Promise<TrajectoryPredictionResult> {
    const { recentPositions, horizonMinutes, vesselId } = input;
    const latest = recentPositions.at(-1);

    if (!latest) {
      return {
        vesselId,
        generatedAt: new Date().toISOString(),
        horizonMinutes,
        points: [],
        isMock: true,
      };
    }

    const speedKmPerMin = Math.max(latest.sog, 0) * KNOTS_TO_KM_PER_MIN;
    const stepMinutes = 10;
    const steps = Math.max(1, Math.round(horizonMinutes / stepMinutes));
    const points: PredictedPoint[] = [];

    let cursor = { latitude: latest.latitude, longitude: latest.longitude };
    const baseTime = new Date(latest.timestamp).getTime();

    for (let i = 1; i <= steps; i++) {
      const distanceKm = speedKmPerMin * stepMinutes;
      // Small deterministic course drift so the predicted track isn't a
      // perfectly rigid line — stands in for real trajectory uncertainty.
      const drift = Math.sin(i / 3) * 4;
      cursor = destinationPoint(cursor, latest.cog + drift, distanceKm);

      points.push({
        timestamp: new Date(baseTime + i * stepMinutes * 60_000).toISOString(),
        latitude: cursor.latitude,
        longitude: cursor.longitude,
        confidence: Math.max(0.35, 0.95 - i * (0.6 / steps)),
      });
    }

    return {
      vesselId,
      generatedAt: new Date().toISOString(),
      horizonMinutes,
      points,
      isMock: true,
    };
  }

  async predictEta(input: EtaPredictionInput): Promise<EtaPredictionResult> {
    const { recentPositions, vesselId, destinationPort } = input;
    const latest = recentPositions.at(-1);

    if (!latest) {
      const now = new Date();
      return {
        vesselId,
        generatedAt: now.toISOString(),
        destinationPort,
        predictedEta: now.toISOString(),
        confidence: 0,
        errorMarginMinutes: 0,
        isMock: true,
      };
    }

    const distanceKm = haversineDistanceKm(
      { latitude: latest.latitude, longitude: latest.longitude },
      { latitude: input.destinationLatitude, longitude: input.destinationLongitude }
    );
    const speedKnots = Math.max(latest.sog, 4); // assume min steerage way
    const speedKmPerHour = speedKnots * 1.852;
    const hoursRemaining = distanceKm / speedKmPerHour;

    const etaMs = new Date(latest.timestamp).getTime() + hoursRemaining * 3_600_000;
    const confidence = Math.max(0.4, Math.min(0.95, 1 - hoursRemaining / 200));
    const errorMarginMinutes = Math.round(hoursRemaining * 60 * (1 - confidence) * 0.5);

    return {
      vesselId,
      generatedAt: new Date().toISOString(),
      destinationPort,
      predictedEta: new Date(etaMs).toISOString(),
      confidence: Number(confidence.toFixed(2)),
      errorMarginMinutes,
      isMock: true,
    };
  }
}
