import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapAnomaly } from "@/lib/supabase/mappers";
import type { AnomalyRow } from "@/lib/supabase/database.types";
import type { AnomalyListQuery } from "@/lib/validation/anomaly";
import type { AnomalyWithVessel } from "@/types";

interface AnomalyRowWithVessel extends AnomalyRow {
  vessels: { name: string; mmsi: string } | null;
}

export async function getAnomalies(
  query: AnomalyListQuery
): Promise<{ data: AnomalyWithVessel[]; total: number }> {
  const supabase = await createServerSupabaseClient();

  let builder = supabase
    .from("anomalies")
    .select("*, vessels(name, mmsi)", { count: "exact" });

  if (query.type) builder = builder.eq("type", query.type);
  if (query.severity) builder = builder.eq("severity", query.severity);
  if (query.status) builder = builder.eq("status", query.status);

  const start = (query.page - 1) * query.pageSize;
  const { data, error, count } = await builder
    .order("detected_at", { ascending: false })
    .range(start, start + query.pageSize - 1);

  if (error) throw new Error(`Failed to load anomalies: ${error.message}`);

  const rows = (data ?? []) as unknown as AnomalyRowWithVessel[];
  const anomalies = rows.map((row) => ({
    ...mapAnomaly(row),
    vesselName: row.vessels?.name ?? "Unknown",
    vesselMmsi: row.vessels?.mmsi ?? "—",
  }));

  return { data: anomalies, total: count ?? anomalies.length };
}
