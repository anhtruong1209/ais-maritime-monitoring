import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import type { Vessel } from "@/types";

export function useVessel(mmsi: string | null) {
  return useQuery({
    queryKey: ["vessel", mmsi],
    queryFn: () => fetchJson<Vessel>(`/api/vessels/${mmsi}`),
    enabled: Boolean(mmsi),
  });
}
