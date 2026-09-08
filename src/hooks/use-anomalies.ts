import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import type { AnomalyWithVessel } from "@/types";

interface AnomaliesResponse {
  data: AnomalyWithVessel[];
  total: number;
}

export function useOpenAnomalies() {
  return useQuery({
    queryKey: ["anomalies", "open"],
    queryFn: () =>
      fetchJson<AnomaliesResponse>("/api/anomalies?status=open&pageSize=100").then(
        (res) => res.data
      ),
    // Was 60s — this demo's anomalies don't actually change between
    // fetches any more than the vessel list does (see useAllVesselsForMap),
    // and every refetch forced a full marker-cluster rebuild (see
    // FlaggedVesselRings) since "flagged" used to be baked into each
    // vessel's own icon. That's fixed now, but there's still no reason to
    // poll static data this often.
    refetchInterval: 5 * 60_000,
  });
}
