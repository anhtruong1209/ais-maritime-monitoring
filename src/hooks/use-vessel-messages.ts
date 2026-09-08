import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import type { AISPosition } from "@/types";

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export function useVesselMessages(mmsi: string | null, page: number, pageSize = 10) {
  return useQuery({
    queryKey: ["vessel-messages", mmsi, page, pageSize],
    queryFn: () =>
      fetchJson<PaginatedResponse<AISPosition>>(
        `/api/vessels/${mmsi}/messages?page=${page}&pageSize=${pageSize}`
      ),
    enabled: Boolean(mmsi),
    placeholderData: (previousData) => previousData,
  });
}
