"use client";

import { useState } from "react";
import { AiInsightCard } from "./AiInsightCard";
import { EtaCard } from "./EtaCard";
import { EtaComparisonCard } from "./EtaComparisonCard";
import { PortEtaPicker } from "./PortEtaPicker";
import { PredictionPanel } from "./PredictionPanel";
import { useEtaPrediction, useTrajectoryPrediction } from "@/hooks/use-predictions";
import { useVesselVoyages } from "@/hooks/use-vessel-voyages";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";

/**
 * Owns everything prediction-related for one vessel — horizon picking,
 * the port choice for ETA, and all AI result cards — as its own subtree
 * that reads the shared prediction state itself, instead of the parent
 * VesselDetailContent reading it. Kept separate specifically so a
 * prediction/ETA interaction only re-renders this section, not the
 * Current AIS / Voyages / History sections sitting next to it in the
 * same scrollable panel.
 *
 * Trajectory and ETA are two independent queries (see use-predictions.ts)
 * so picking a different destination port for ETA doesn't reload/re-show
 * a loading state for the trajectory prediction, and vice versa.
 */
export function VesselPredictionSection({ mmsi }: { mmsi: string }) {
  const [portId, setPortId] = useState<string | null>(null);
  const { predictionHorizonMinutes, predictionRequested, predictionVesselMmsi } =
    useVesselDetailDialog();
  const predictionActive = predictionRequested && predictionVesselMmsi === mmsi;
  const { data: trajectory, isLoading } = useTrajectoryPrediction(
    predictionActive ? mmsi : null,
    predictionHorizonMinutes
  );
  const { data: eta } = useEtaPrediction(predictionActive ? mmsi : null, portId);
  // Only needed once a prediction is actually active (for the AIS-ETA side
  // of the comparison) — no point fetching voyages twice from here and
  // VesselDetailContent otherwise; TanStack Query dedupes by key anyway.
  const { data: voyages } = useVesselVoyages(predictionActive ? mmsi : null);
  const currentVoyage = voyages?.find((v) => v.status === "in_progress") ?? null;

  return (
    <>
      <PredictionPanel
        mmsi={mmsi}
        trajectory={predictionActive ? (trajectory ?? null) : null}
        isLoading={predictionActive && isLoading}
      />
      {predictionActive && (
        <div className="space-y-2">
          <PortEtaPicker value={portId} onChange={setPortId} />
          {eta && <EtaCard eta={eta} />}
          {eta && <EtaComparisonCard eta={eta} voyage={currentVoyage} />}
          {eta && trajectory && <AiInsightCard trajectory={trajectory} eta={eta} />}
        </div>
      )}
    </>
  );
}
