"use client";

import { useMemo, useState } from "react";
import { MapCanvas } from "@/components/map/MapCanvas";
import { MapControlsPanel, type MapFilterState } from "@/components/map/MapControlsPanel";
import { MapLegend } from "@/components/map/MapLegend";
import { useAllVesselsForMap } from "@/hooks/use-vessels";
import { usePorts } from "@/hooks/use-ports";
import { useVesselPositions } from "@/hooks/use-vessel-positions";
import { usePredictions } from "@/hooks/use-predictions";
import { useOpenAnomalies } from "@/hooks/use-anomalies";
import { DEFAULT_TILE_LAYER_ID } from "@/lib/map/config";

const ALL = "all";

const DEFAULT_FILTERS: MapFilterState = {
  search: "",
  shipType: ALL,
  status: ALL,
  tileLayerId: DEFAULT_TILE_LAYER_ID,
  showHistorical: true,
  showPredicted: false,
  showAnomalies: true,
};

export default function MapPage() {
  const [filters, setFilters] = useState<MapFilterState>(DEFAULT_FILTERS);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  const { data: vesselsResponse, isLoading } = useAllVesselsForMap({
    search: filters.search || undefined,
    shipType: filters.shipType === ALL ? undefined : filters.shipType,
    status: filters.status === ALL ? undefined : filters.status,
  });
  const { data: ports } = usePorts();
  const { data: anomalies } = useOpenAnomalies();

  const vessels = useMemo(() => vesselsResponse?.data ?? [], [vesselsResponse]);
  const selectedVessel = vessels.find((v) => v.id === selectedVesselId) ?? null;

  const { data: positions } = useVesselPositions(
    filters.showHistorical ? (selectedVessel?.mmsi ?? null) : null,
    24
  );
  const { data: predictions } = usePredictions(
    filters.showPredicted ? (selectedVessel?.mmsi ?? null) : null
  );

  function handleChange(patch: Partial<MapFilterState>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    setSelectedVesselId(null);
    setResetSignal((s) => s + 1);
  }

  return (
    <div className="relative h-full w-full">
      <MapCanvas
        vessels={vessels}
        ports={ports}
        anomalies={filters.showAnomalies ? (anomalies ?? []) : []}
        selectedVesselId={selectedVesselId}
        onSelectVessel={(v) => setSelectedVesselId(v.id)}
        historicalTrack={filters.showHistorical ? (positions ?? []) : []}
        predictedRoute={filters.showPredicted ? (predictions?.trajectory.points ?? []) : []}
        tileLayerId={filters.tileLayerId}
        resetSignal={resetSignal}
        cluster
      />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
        <div className="pointer-events-auto flex justify-between">
          <MapControlsPanel
            filters={filters}
            onChange={handleChange}
            onReset={handleReset}
            selectedVesselName={selectedVessel?.name}
            onClearSelection={() => setSelectedVesselId(null)}
          />
          {isLoading && (
            <div className="h-fit rounded-md border border-border bg-card/95 px-3 py-1.5 text-xs text-muted-foreground shadow-lg backdrop-blur">
              Loading fleet…
            </div>
          )}
        </div>
        <div className="pointer-events-auto self-start">
          <MapLegend />
        </div>
      </div>
    </div>
  );
}
