"use client";

import { useMemo, useState } from "react";
import { MapCanvas } from "@/components/map/MapCanvas";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useVesselPositions } from "@/hooks/use-vessel-positions";
import { TRAJECTORY_WINDOW_OPTIONS } from "@/lib/constants";
import { deriveVesselStatus } from "@/lib/vessel-status";
import type { AISPosition, Vessel, VesselWithLatestPosition } from "@/types";

function toLatestSummary(position: AISPosition) {
  return {
    timestamp: position.timestamp,
    latitude: position.latitude,
    longitude: position.longitude,
    sog: position.sog,
    cog: position.cog,
    heading: position.heading,
    navStatus: position.navStatus,
    destination: position.destination,
  };
}

export function VesselTrajectoryMap({
  vessel,
  initialPositions,
}: {
  vessel: Vessel;
  initialPositions: AISPosition[];
}) {
  const [hours, setHours] = useState(24);
  const { data, isFetching } = useVesselPositions(vessel.mmsi, hours);
  const positions = data ?? (hours === 24 ? initialPositions : undefined);

  const vesselForMap: VesselWithLatestPosition | null = useMemo(() => {
    if (!positions || positions.length === 0) return null;
    const latestPosition = toLatestSummary(positions[positions.length - 1]);
    return {
      ...vessel,
      latestPosition,
      status: deriveVesselStatus(latestPosition),
    };
  }, [vessel, positions]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border p-2">
        <Tabs value={String(hours)} onValueChange={(v) => setHours(Number(v))}>
          <TabsList>
            {TRAJECTORY_WINDOW_OPTIONS.map((opt) => (
              <TabsTrigger key={opt.hours} value={String(opt.hours)}>
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {isFetching && <span className="text-xs text-muted-foreground">Updating…</span>}
      </div>
      <div className="min-h-0 flex-1">
        {!positions ? (
          <Skeleton className="h-full w-full rounded-none" />
        ) : (
          <MapCanvas
            vessels={vesselForMap ? [vesselForMap] : []}
            historicalTrack={positions}
            center={
              vesselForMap?.latestPosition
                ? [vesselForMap.latestPosition.latitude, vesselForMap.latestPosition.longitude]
                : undefined
            }
            zoom={9}
            cluster={false}
          />
        )}
      </div>
    </div>
  );
}
