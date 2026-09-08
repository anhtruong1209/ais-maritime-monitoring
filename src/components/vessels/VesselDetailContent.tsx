"use client";

import { AlertCircle } from "lucide-react";
import { ShipTypeBadge } from "./ShipTypeBadge";
import { VesselStatusBadge } from "./VesselStatusBadge";
import { VesselInfoCard } from "./VesselInfoCard";
import { CurrentAisCard } from "./CurrentAisCard";
import { VesselVoyagesCard } from "./VesselVoyagesCard";
import { VesselHistoryPanel } from "./VesselHistoryPanel";
import { EtaCard } from "@/components/predictions/EtaCard";
import { PredictionPanel } from "@/components/predictions/PredictionPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVessel } from "@/hooks/use-vessel";
import { usePredictions } from "@/hooks/use-predictions";
import { useVesselPositions } from "@/hooks/use-vessel-positions";
import { useVesselVoyages } from "@/hooks/use-vessel-voyages";
import { useLocale } from "@/providers/locale-provider";
import { deriveVesselStatus } from "@/lib/vessel-status";

/**
 * Everything about one vessel — current AIS, voyages, historical
 * trajectory, AI prediction, and static particulars — in a single tabbed
 * panel. This is the only place vessel detail lives: it's rendered inside
 * VesselDetailSheet (a side panel, opened over whatever page/map you were
 * already on) rather than as a separate route, so opening it never
 * unmounts the map or re-fetches the fleet.
 */
export function VesselDetailContent({ mmsi }: { mmsi: string }) {
  const { data: vessel, isLoading: vesselLoading, isError } = useVessel(mmsi);
  const { data: positions } = useVesselPositions(mmsi, 24);
  const { data: voyages } = useVesselVoyages(mmsi);
  const { data: predictions, isLoading: predictionsLoading } = usePredictions(mmsi);
  const { t } = useLocale();

  if (vesselLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !vessel) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
        <AlertCircle className="size-5" />
        {t("Vessel not found.")}
      </div>
    );
  }

  const latest = positions?.at(-1) ?? null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <h1 className="text-lg font-semibold">{vessel.name}</h1>
        <ShipTypeBadge shipType={vessel.shipType} />
        <VesselStatusBadge status={deriveVesselStatus(latest)} />
      </div>

      <Tabs defaultValue="current" className="min-h-0 flex-1">
        <TabsList className="mx-4 mt-3">
          <TabsTrigger value="current">{t("Current")}</TabsTrigger>
          <TabsTrigger value="history">{t("History")}</TabsTrigger>
          <TabsTrigger value="predictions">{t("Predictions")}</TabsTrigger>
          <TabsTrigger value="particulars">{t("Particulars")}</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4 overflow-y-auto p-4">
          <CurrentAisCard position={latest} />
          <VesselVoyagesCard voyages={voyages ?? []} />
        </TabsContent>

        <TabsContent value="history" className="overflow-y-auto p-4">
          <VesselHistoryPanel mmsi={mmsi} />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4 overflow-y-auto p-4">
          {predictionsLoading && <Skeleton className="h-56 w-full" />}
          {!predictionsLoading && !predictions && (
            <p className="text-sm text-muted-foreground">
              {t("No AIS data available to generate a prediction for this vessel.")}
            </p>
          )}
          {predictions && (
            <>
              <PredictionPanel trajectory={predictions.trajectory} />
              <EtaCard eta={predictions.eta} />
            </>
          )}
        </TabsContent>

        <TabsContent value="particulars" className="overflow-y-auto p-4">
          <VesselInfoCard vessel={vessel} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
