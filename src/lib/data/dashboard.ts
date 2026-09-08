import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapAnomaly } from "@/lib/supabase/mappers";
import type { AnomalyRow } from "@/lib/supabase/database.types";
import { getAllVesselsWithLatestPosition } from "@/lib/data/vessels";
import type { AnomalyWithVessel, ShipType, VesselStatus } from "@/types";

export interface DashboardStats {
  totalVessels: number;
  moving: number;
  anchored: number;
  stopped: number;
  offline: number;
  byShipType: Record<ShipType, number>;
}

export interface RecentActivityItem {
  vesselId: string;
  vesselName: string;
  vesselMmsi: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  sog: number;
  destination: string | null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const vessels = await getAllVesselsWithLatestPosition();

  const counts: Record<VesselStatus, number> = {
    moving: 0,
    anchored: 0,
    stopped: 0,
    offline: 0,
  };
  const byShipType = {} as Record<ShipType, number>;

  for (const vessel of vessels) {
    counts[vessel.status]++;
    byShipType[vessel.shipType] = (byShipType[vessel.shipType] ?? 0) + 1;
  }

  return {
    totalVessels: vessels.length,
    moving: counts.moving,
    anchored: counts.anchored,
    stopped: counts.stopped,
    offline: counts.offline,
    byShipType,
  };
}

interface RecentPositionRow {
  timestamp: string;
  latitude: number;
  longitude: number;
  sog: number;
  destination: string | null;
  vessels: { id: string; name: string; mmsi: string } | null;
}

export async function getRecentActivity(limit = 8): Promise<RecentActivityItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ais_positions")
    .select("timestamp, latitude, longitude, sog, destination, vessels(id, name, mmsi)")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load recent activity: ${error.message}`);

  return ((data ?? []) as unknown as RecentPositionRow[])
    .filter((row) => row.vessels)
    .map((row) => ({
      vesselId: row.vessels!.id,
      vesselName: row.vessels!.name,
      vesselMmsi: row.vessels!.mmsi,
      timestamp: row.timestamp,
      latitude: row.latitude,
      longitude: row.longitude,
      sog: row.sog,
      destination: row.destination,
    }));
}

export async function getRecentAlerts(limit = 6): Promise<AnomalyWithVessel[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("anomalies")
    .select("*, vessels(name, mmsi)")
    .order("detected_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load recent alerts: ${error.message}`);

  return ((data ?? []) as unknown as (AnomalyRow & {
    vessels: { name: string; mmsi: string } | null;
  })[]).map((row) => ({
    ...mapAnomaly(row),
    vesselName: row.vessels?.name ?? "Unknown",
    vesselMmsi: row.vessels?.mmsi ?? "—",
  }));
}
