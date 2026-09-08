import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import type { Voyage } from "@/types";

export function useVesselVoyages(mmsi: string | null) {
  return useQuery({
    queryKey: ["vessel-voyages", mmsi],
    queryFn: () =>
      fetchJson<{ data: Voyage[] }>(`/api/vessels/${mmsi}/voyages`).then((res) => res.data),
    enabled: Boolean(mmsi),
  });
}
