"use client";

import { AlertCircle } from "lucide-react";
import { ShipTypeBadge } from "./ShipTypeBadge";
import { VesselStatusBadge } from "./VesselStatusBadge";
import { VesselInfoCard } from "./VesselInfoCard";
import { CurrentAisCard } from "./CurrentAisCard";
import { VesselVoyagesCard } from "./VesselVoyagesCard";
import { VesselTrajectoryMap } from "./VesselTrajectoryMap";
import { RecentAisMessagesPanel } from "./RecentAisMessagesPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { useVessel } from "@/hooks/use-vessel";
import { useVesselPositions } from "@/hooks/use-vessel-positions";
import { useVesselVoyages } from "@/hooks/use-vessel-voyages";
import { deriveVesselStatus } from "@/lib/vessel-status";

/**
 * Self-contained vessel detail body — fetches everything it needs from
 * `mmsi` via client hooks. Used both by the /vessels/[mmsi] page and by
 * VesselDetailDialog, so "view detail" behaves the same whether it's
 * opened as a modal (the default, from tables/map/fleets) or navigated to
 * directly (a shareable URL).
 */
export function VesselDetailContent({ mmsi }: { mmsi: string }) {
  const { data: vessel, isLoading: vesselLoading, isError } = useVessel(mmsi);
  const { data: positions } = useVesselPositions(mmsi, 24);
  const { data: voyages } = useVesselVoyages(mmsi);

  if (vesselLoading) {
    return (
      <div className="grid gap-4 p-4 lg:grid-cols-3">
        <Skeleton className="h-64 lg:col-span-1" />
        <Skeleton className="h-96 lg:col-span-2" />
      </div>
    );
  }

  if (isError || !vessel) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
        <AlertCircle className="size-5" />
        Vessel not found.
      </div>
    );
  }

  const latest = positions?.at(-1) ?? null;

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold">{vessel.name}</h1>
        <ShipTypeBadge shipType={vessel.shipType} />
        <VesselStatusBadge status={deriveVesselStatus(latest)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <VesselInfoCard vessel={vessel} />
          <CurrentAisCard position={latest} />
          <VesselVoyagesCard voyages={voyages ?? []} />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="h-96 overflow-hidden rounded-md border border-border">
            <VesselTrajectoryMap vessel={vessel} initialPositions={positions ?? []} />
          </div>
          <div>
            <h2 className="mb-2 text-sm font-medium">Recent AIS Messages</h2>
            <RecentAisMessagesPanel mmsi={mmsi} />
          </div>
        </div>
      </div>
    </div>
  );
}
