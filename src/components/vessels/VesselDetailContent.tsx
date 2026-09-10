"use client";

import { AlertCircle } from "lucide-react";
import { ShipTypeBadge } from "./ShipTypeBadge";
import { VesselStatusBadge } from "./VesselStatusBadge";
import { VesselInfoCard } from "./VesselInfoCard";
import { CurrentAisCard } from "./CurrentAisCard";
import { VesselAlertsCard } from "./VesselAlertsCard";
import { VesselVoyagesCard } from "./VesselVoyagesCard";
import { VesselHistoryPanel } from "./VesselHistoryPanel";
import { VoyageProgressCard } from "./VoyageProgressCard";
import { DestinationPredictionStub } from "@/components/predictions/DestinationPredictionStub";
import { VesselPredictionSection } from "@/components/predictions/VesselPredictionSection";
import { CollisionRiskCard } from "@/components/predictions/CollisionRiskCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVessel } from "@/hooks/use-vessel";
import { useVesselPositions } from "@/hooks/use-vessel-positions";
import { useVesselVoyages } from "@/hooks/use-vessel-voyages";
import { useLocale } from "@/providers/locale-provider";
import { deriveVesselStatus } from "@/lib/vessel-status";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="pt-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </h2>
  );
}

/**
 * Everything about one vessel — current AIS, voyages, historical
 * trajectory, AI prediction, and static particulars — stacked in a single
 * scrollable panel (no inner tabs: one thing, scroll to see the rest),
 * grouped under section headings so CORE AIS DATA and AI PREDICTION
 * output never blur into one undifferentiated wall of cards.
 * This is the only place vessel detail lives: it's rendered inside
 * VesselDetailSheet (a side panel, opened over whatever page/map you were
 * already on) rather than as a separate route, so opening it never
 * unmounts the map or re-fetches the fleet.
 *
 * Each section below (History, Predictions) owns its own shared-state
 * subscription and data fetching rather than this component reading it
 * on their behalf — that keeps an interaction in one section (e.g.
 * picking a prediction horizon) from re-rendering the sections next to
 * it that have nothing to do with it.
 */
export function VesselDetailContent({ mmsi }: { mmsi: string }) {
  const { data: vessel, isLoading: vesselLoading, isError } = useVessel(mmsi);
  const { data: positions } = useVesselPositions(mmsi, 24);
  const { data: voyages } = useVesselVoyages(mmsi);
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
  const currentVoyage = voyages?.find((v) => v.status === "in_progress") ?? null;
  const currentPosition = latest ? { latitude: latest.latitude, longitude: latest.longitude } : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <h1 className="text-lg font-semibold">{vessel.name}</h1>
        <ShipTypeBadge shipType={vessel.shipType} />
        <VesselStatusBadge status={deriveVesselStatus(latest)} />
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <SectionHeading>{t("Core AIS Data")}</SectionHeading>
        <div className="grid gap-4 xl:grid-cols-2">
          <CurrentAisCard position={latest} />
          <VesselInfoCard vessel={vessel} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("Position History")}</CardTitle>
          </CardHeader>
          <CardContent>
            <VesselHistoryPanel mmsi={mmsi} />
          </CardContent>
        </Card>

        <SectionHeading>{t("Voyage")}</SectionHeading>
        {currentVoyage && (
          <VoyageProgressCard voyage={currentVoyage} currentPosition={currentPosition} />
        )}
        <VesselVoyagesCard voyages={voyages ?? []} />

        <SectionHeading>{t("AI Prediction")}</SectionHeading>
        <VesselPredictionSection mmsi={mmsi} />
        <DestinationPredictionStub />

        <SectionHeading>{t("Collision Risk")}</SectionHeading>
        <CollisionRiskCard
          vesselId={vessel.id}
          latest={latest ? { latitude: latest.latitude, longitude: latest.longitude, sog: latest.sog, cog: latest.cog } : null}
        />

        <SectionHeading>{t("Alerts")}</SectionHeading>
        <VesselAlertsCard mmsi={mmsi} />
      </div>
    </div>
  );
}
