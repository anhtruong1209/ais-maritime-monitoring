import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapVoyage } from "@/lib/supabase/mappers";
import type { VoyageRow } from "@/lib/supabase/database.types";
import type { Voyage, VoyageStatus, VoyageWithVessel } from "@/types";

export interface VoyageFilters {
  destinationPort?: string;
  status?: VoyageStatus;
  vesselId?: string;
  /** ISO date (yyyy-mm-dd) — filters voyages departing on that calendar day. */
  departureDate?: string;
  page: number;
  pageSize: number;
}

interface VoyageRowWithVessel extends VoyageRow {
  vessels: { name: string; mmsi: string } | null;
}

export async function getVoyages(
  filters: VoyageFilters
): Promise<{ data: VoyageWithVessel[]; total: number }> {
  const supabase = await createServerSupabaseClient();

  let builder = supabase
    .from("voyages")
    .select("*, vessels(name, mmsi)", { count: "exact" });

  if (filters.destinationPort) {
    builder = builder.ilike("destination_port", `%${filters.destinationPort}%`);
  }
  if (filters.status) {
    builder = builder.eq("status", filters.status);
  }
  if (filters.vesselId) {
    builder = builder.eq("vessel_id", filters.vesselId);
  }
  if (filters.departureDate) {
    const start = new Date(`${filters.departureDate}T00:00:00.000Z`);
    const end = new Date(start.getTime() + 24 * 3_600_000);
    builder = builder.gte("departure_time", start.toISOString()).lt("departure_time", end.toISOString());
  }

  const start = (filters.page - 1) * filters.pageSize;
  const { data, error, count } = await builder
    .order("departure_time", { ascending: false })
    .range(start, start + filters.pageSize - 1);

  if (error) throw new Error(`Failed to load voyages: ${error.message}`);

  const rows = (data ?? []) as unknown as VoyageRowWithVessel[];
  const voyages = rows.map((row) => ({
    ...mapVoyage(row),
    vesselName: row.vessels?.name ?? "Unknown",
    vesselMmsi: row.vessels?.mmsi ?? "—",
  }));

  return { data: voyages, total: count ?? voyages.length };
}

export async function getVoyageById(id: string): Promise<VoyageWithVessel | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("voyages")
    .select("*, vessels(name, mmsi)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load voyage: ${error.message}`);
  if (!data) return null;

  const row = data as unknown as VoyageRowWithVessel;
  return {
    ...mapVoyage(row),
    vesselName: row.vessels?.name ?? "Unknown",
    vesselMmsi: row.vessels?.mmsi ?? "—",
  };
}

export async function getVesselVoyages(vesselId: string): Promise<Voyage[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("voyages")
    .select("*")
    .eq("vessel_id", vesselId)
    .order("departure_time", { ascending: false });

  if (error) throw new Error(`Failed to load voyages: ${error.message}`);
  return ((data ?? []) as VoyageRow[]).map(mapVoyage);
}
