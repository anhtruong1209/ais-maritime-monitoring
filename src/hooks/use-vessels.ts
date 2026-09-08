import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import type { VesselWithLatestPosition } from "@/types";

export interface VesselsResponse {
  data: VesselWithLatestPosition[];
  page: number;
  pageSize: number;
  total: number;
}

export interface VesselFilters {
  search?: string;
  shipType?: string;
  status?: string;
  destination?: string;
  page?: number;
  pageSize?: number;
}

function buildQuery(filters: VesselFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.shipType) params.set("shipType", filters.shipType);
  if (filters.status) params.set("status", filters.status);
  if (filters.destination) params.set("destination", filters.destination);
  params.set("page", String(filters.page ?? 1));
  params.set("pageSize", String(filters.pageSize ?? 25));
  return params.toString();
}

export function useVessels(filters: VesselFilters) {
  return useQuery({
    queryKey: ["vessels", filters],
    queryFn: () => fetchJson<VesselsResponse>(`/api/vessels?${buildQuery(filters)}`),
    placeholderData: (previousData) => previousData,
  });
}

/** All vessels (up to the 500-row cap) — used by the full map view. */
export function useAllVesselsForMap(filters: Omit<VesselFilters, "page" | "pageSize">) {
  return useQuery({
    queryKey: ["vessels", "map", filters],
    queryFn: () =>
      fetchJson<VesselsResponse>(`/api/vessels?${buildQuery({ ...filters, pageSize: 500 })}`),
    refetchInterval: 60_000,
  });
}
