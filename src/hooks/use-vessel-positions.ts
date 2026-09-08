import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import type { AISPosition } from "@/types";

export function useVesselPositions(mmsi: string | null, hours: number) {
  return useQuery({
    queryKey: ["vessel-positions", mmsi, hours],
    queryFn: () =>
      fetchJson<{ data: AISPosition[] }>(
        `/api/vessels/${mmsi}/positions?hours=${hours}`
      ).then((res) => res.data),
    enabled: Boolean(mmsi),
  });
}
