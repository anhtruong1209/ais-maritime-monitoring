import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import type { EtaPredictionResult, TrajectoryPredictionResult } from "@/types";

export interface PredictionResponse {
  trajectory: TrajectoryPredictionResult;
  eta: EtaPredictionResult;
}

/** `portId` picks an arbitrary destination port for the ETA calculation
 * instead of the vessel's own AIS-reported destination. */
export function usePredictions(mmsi: string | null, portId?: string | null) {
  return useQuery({
    queryKey: ["predictions", mmsi, portId ?? null],
    queryFn: () => {
      const query = portId ? `?portId=${encodeURIComponent(portId)}` : "";
      return fetchJson<PredictionResponse>(`/api/predictions/${mmsi}${query}`);
    },
    enabled: Boolean(mmsi),
  });
}
