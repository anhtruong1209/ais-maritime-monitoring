import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import type { Port } from "@/types";

export function usePorts() {
  return useQuery({
    queryKey: ["ports"],
    queryFn: () => fetchJson<{ data: Port[] }>("/api/ports").then((res) => res.data),
    staleTime: Infinity,
  });
}
