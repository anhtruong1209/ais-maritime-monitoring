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
    refetchInterval: 60_000,
  });
}
