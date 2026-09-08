import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import { DEFAULT_PREDICTION_HORIZON_MINUTES } from "@/lib/constants";
import type { EtaPredictionResult, TrajectoryPredictionResult } from "@/types";

export interface PredictionResponse {
  trajectory: TrajectoryPredictionResult;
  eta: EtaPredictionResult;
}

// Trajectory and ETA are fetched as two independent queries (both hitting
// the same endpoint, which happens to compute both together) rather than
// one combined query keyed on both horizonMinutes and portId. With one
// combined key, changing the ETA's destination port — which the
// trajectory prediction doesn't even use — busted the cache entry for
// the trajectory too, reloading/re-showing-loading the whole trajectory
// card just because the user picked a different port for ETA.

/** How far ahead the trajectory prediction looks (see
 * PREDICTION_HORIZON_OPTIONS) — independent of any port choice. */
export function useTrajectoryPrediction(
  mmsi: string | null,
  horizonMinutes: number = DEFAULT_PREDICTION_HORIZON_MINUTES
) {
  return useQuery({
    queryKey: ["predictions", "trajectory", mmsi, horizonMinutes],
    queryFn: () =>
      fetchJson<PredictionResponse>(
        `/api/predictions/${mmsi}?horizonMinutes=${horizonMinutes}`
      ).then((res) => res.trajectory),
    enabled: Boolean(mmsi),
  });
}

/** `portId` picks an arbitrary destination port for the ETA calculation
 * instead of the vessel's own AIS-reported destination — independent of
 * any prediction horizon choice. */
export function useEtaPrediction(mmsi: string | null, portId?: string | null) {
  return useQuery({
    queryKey: ["predictions", "eta", mmsi, portId ?? null],
    queryFn: () => {
      const params = new URLSearchParams();
      if (portId) params.set("portId", portId);
      return fetchJson<PredictionResponse>(`/api/predictions/${mmsi}?${params.toString()}`).then(
        (res) => res.eta
      );
    },
    enabled: Boolean(mmsi),
  });
}
