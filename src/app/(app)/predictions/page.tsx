"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapCanvas } from "@/components/map/MapCanvas";
import { EtaCard } from "@/components/predictions/EtaCard";
import { PortEtaPicker } from "@/components/predictions/PortEtaPicker";
import { PredictionPanel } from "@/components/predictions/PredictionPanel";
import { VesselPredictionSelect } from "@/components/predictions/VesselPredictionSelect";
import { usePredictions } from "@/hooks/use-predictions";
import { useVesselPositions } from "@/hooks/use-vessel-positions";
import { useAllVesselsForMap } from "@/hooks/use-vessels";

export default function PredictionsPage() {
  const [mmsi, setMmsi] = useState<string | null>(null);
  const [portId, setPortId] = useState<string | null>(null);
  const { data: predictions, isLoading, isError } = usePredictions(mmsi, portId);
  const { data: positions } = useVesselPositions(mmsi, 24);
  const { data: vesselsResponse } = useAllVesselsForMap({});
  const vessel = vesselsResponse?.data.find((v) => v.mmsi === mmsi) ?? null;

  function handleSelectVessel(next: string) {
    setMmsi(next);
    setPortId(null);
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">AI Predictions</h1>
        <div className="flex flex-wrap items-center gap-2">
          <VesselPredictionSelect value={mmsi} onChange={handleSelectVessel} />
          {mmsi && <PortEtaPicker value={portId} onChange={setPortId} />}
        </div>
      </div>

      {!mmsi && (
        <Card>
          <CardContent className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="size-5" />
            Select a vessel above to generate a demo trajectory and ETA prediction.
          </CardContent>
        </Card>
      )}

      {mmsi && isLoading && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      )}

      {mmsi && isError && (
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No AIS data available to generate a prediction for this vessel.
          </CardContent>
        </Card>
      )}

      {mmsi && predictions && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <PredictionPanel trajectory={predictions.trajectory} />
            <EtaCard eta={predictions.eta} />
          </div>

          <Card className="overflow-hidden">
            <CardContent className="h-96 p-0">
              <MapCanvas
                vessels={vessel ? [vessel] : []}
                historicalTrack={positions ?? []}
                predictedRoute={predictions.trajectory.points}
                center={
                  vessel?.latestPosition
                    ? [vessel.latestPosition.latitude, vessel.latestPosition.longitude]
                    : undefined
                }
                zoom={7}
                cluster={false}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
