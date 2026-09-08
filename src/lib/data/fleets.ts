import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDatasetNow } from "./demo-clock";
import { mapFleet, mapVesselWithLatestPosition } from "@/lib/supabase/mappers";
import type {
  FleetRow,
  VesselWithLatestPositionRow,
} from "@/lib/supabase/database.types";
import type { Fleet, FleetWithCount, VesselWithLatestPosition } from "@/types";

interface FleetVesselCountRow {
  fleet_id: string;
}

export async function getFleets(): Promise<FleetWithCount[]> {
  const supabase = await createServerSupabaseClient();

  const [{ data: fleetRows, error: fleetError }, { data: membershipRows, error: memberError }] =
    await Promise.all([
      supabase.from("fleets").select("*").order("name"),
      supabase.from("fleet_vessels").select("fleet_id"),
    ]);

  if (fleetError) throw new Error(`Failed to load fleets: ${fleetError.message}`);
  if (memberError) throw new Error(`Failed to load fleet membership: ${memberError.message}`);

  const counts = new Map<string, number>();
  for (const row of (membershipRows ?? []) as FleetVesselCountRow[]) {
    counts.set(row.fleet_id, (counts.get(row.fleet_id) ?? 0) + 1);
  }

  return ((fleetRows ?? []) as FleetRow[]).map((row) => ({
    ...mapFleet(row),
    vesselCount: counts.get(row.id) ?? 0,
  }));
}

export async function getFleetById(id: string): Promise<Fleet | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("fleets").select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(`Failed to load fleet: ${error.message}`);
  return data ? mapFleet(data as FleetRow) : null;
}

export async function getFleetVessels(fleetId: string): Promise<VesselWithLatestPosition[]> {
  const supabase = await createServerSupabaseClient();
  const [{ data, error }, datasetNow] = await Promise.all([
    supabase
      .from("fleet_vessels_with_latest_position")
      .select("*")
      .eq("fleet_id", fleetId)
      .limit(2000),
    getDatasetNow(),
  ]);

  if (error) throw new Error(`Failed to load fleet vessels: ${error.message}`);
  return ((data ?? []) as VesselWithLatestPositionRow[]).map((row) =>
    mapVesselWithLatestPosition(row, datasetNow)
  );
}
