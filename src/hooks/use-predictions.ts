import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import { DEFAULT_PREDICTION_HORIZON_MINUTES } from "@/lib/constants";
import type { EtaPredictionResult, TrajectoryPredictionResult } from "@/types";

export interface PredictionResponse {
  trajectory: TrajectoryPredictionResult;
  eta: EtaPredictionResult;
}

/** `portId` picks an arbitrary destination port for the ETA calculation
 * instead of the vessel's own AIS-reported destination. `horizonMinutes`
 * picks how far ahead the trajectory prediction looks (see
 * PREDICTION_HORIZON_OPTIONS). */
export function usePredictions(
  mmsi: string | null,
  portId?: string | null,
  horizonMinutes: number = DEFAULT_PREDICTION_HORIZON_MINUTES
) {
  return useQuery({
    queryKey: ["predictions", mmsi, portId ?? null, horizonMinutes],
    queryFn: () => {
      const params = new URLSearchParams();
      if (portId) params.set("portId", portId);
      params.set("horizonMinutes", String(horizonMinutes));
      return fetchJson<PredictionResponse>(`/api/predictions/${mmsi}?${params.toString()}`);
    },
    enabled: Boolean(mmsi),
  });
}
