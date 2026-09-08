import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  mapAISPosition,
  mapVessel,
  mapVesselWithLatestPosition,
} from "@/lib/supabase/mappers";
import type { VesselListQuery } from "@/lib/validation/vessel";
import type { AISPosition, Vessel, VesselWithLatestPosition } from "@/types";
import type {
  AISPositionRow,
  VesselRow,
  VesselWithLatestPositionRow,
} from "@/lib/supabase/database.types";

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export async function getVessels(
  query: VesselListQuery
): Promise<PaginatedResult<VesselWithLatestPosition>> {
  const supabase = await createServerSupabaseClient();

  let builder = supabase
    .from("vessels_with_latest_position")
    .select("*", { count: "exact" });

  if (query.search) {
    builder = builder.or(
      `name.ilike.%${query.search}%,mmsi.ilike.%${query.search}%`
    );
  }
  if (query.shipType) {
    builder = builder.eq("ship_type", query.shipType);
  }
  if (query.destination) {
    builder = builder.ilike("latest_destination", `%${query.destination}%`);
  }

  // Status is derived (not stored), so it can't be pushed down to SQL.
  // The dataset is small (hundreds of rows) so filtering + pagination
  // happens in-memory here rather than adding a generated status column.
  const { data, error, count } = await builder.order("name", { ascending: true });
  if (error) throw new Error(`Failed to load vessels: ${error.message}`);

  let vessels = ((data ?? []) as VesselWithLatestPositionRow[]).map(
    mapVesselWithLatestPosition
  );

  if (query.status) {
    vessels = vessels.filter((v) => v.status === query.status);
  }

  const total = query.status ? vessels.length : (count ?? vessels.length);
  const start = (query.page - 1) * query.pageSize;
  const paged = vessels.slice(start, start + query.pageSize);

  return { data: paged, page: query.page, pageSize: query.pageSize, total };
}

export async function getVesselByMmsi(mmsi: string): Promise<Vessel | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vessels")
    .select("*")
    .eq("mmsi", mmsi)
    .maybeSingle();

  if (error) throw new Error(`Failed to load vessel: ${error.message}`);
  return data ? mapVessel(data as VesselRow) : null;
}

export async function getVesselPositions(
  vesselId: string,
  hours: number
): Promise<AISPosition[]> {
  const supabase = await createServerSupabaseClient();
  const since = new Date(Date.now() - hours * 3_600_000).toISOString();

  const { data, error } = await supabase
    .from("ais_positions")
    .select("*")
    .eq("vessel_id", vesselId)
    .gte("timestamp", since)
    .order("timestamp", { ascending: true });

  if (error) throw new Error(`Failed to load AIS positions: ${error.message}`);
  return ((data ?? []) as AISPositionRow[]).map(mapAISPosition);
}

/** Paginated, most-recent-first AIS message log — independent of the
 * "last N hours" window the trajectory map uses. */
export async function getVesselMessages(
  vesselId: string,
  page: number,
  pageSize: number
): Promise<PaginatedResult<AISPosition>> {
  const supabase = await createServerSupabaseClient();
  const start = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from("ais_positions")
    .select("*", { count: "exact" })
    .eq("vessel_id", vesselId)
    .order("timestamp", { ascending: false })
    .range(start, start + pageSize - 1);

  if (error) throw new Error(`Failed to load AIS messages: ${error.message}`);

  return {
    data: ((data ?? []) as AISPositionRow[]).map(mapAISPosition),
    page,
    pageSize,
    total: count ?? 0,
  };
}

export async function getVesselPositionsInRange(
  vesselId: string,
  from: string,
  to: string
): Promise<AISPosition[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ais_positions")
    .select("*")
    .eq("vessel_id", vesselId)
    .gte("timestamp", from)
    .lte("timestamp", to)
    .order("timestamp", { ascending: true });

  if (error) throw new Error(`Failed to load AIS positions: ${error.message}`);
  return ((data ?? []) as AISPositionRow[]).map(mapAISPosition);
}

export async function getAllVesselsWithLatestPosition(): Promise<
  VesselWithLatestPosition[]
> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vessels_with_latest_position")
    .select("*")
    .limit(2000);

  if (error) throw new Error(`Failed to load vessels: ${error.message}`);
  return ((data ?? []) as VesselWithLatestPositionRow[]).map(
    mapVesselWithLatestPosition
  );
}
