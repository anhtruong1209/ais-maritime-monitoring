"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapCanvas } from "@/components/map/MapCanvas";
import { MapControlsPanel, type MapFilterState } from "@/components/map/MapControlsPanel";
import { MapLegend } from "@/components/map/MapLegend";
import { useAllVesselsForMap } from "@/hooks/use-vessels";
import { usePorts } from "@/hooks/use-ports";
import { useVesselPositions } from "@/hooks/use-vessel-positions";
import { usePredictions } from "@/hooks/use-predictions";
import { useOpenAnomalies } from "@/hooks/use-anomalies";
import { DEFAULT_TILE_LAYER_ID } from "@/lib/map/config";
import { useLocale } from "@/providers/locale-provider";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";
import type { VesselWithLatestPosition } from "@/types";

const ALL = "all";

const DEFAULT_FILTERS: MapFilterState = {
  search: "",
  shipType: ALL,
  status: ALL,
  tileLayerId: DEFAULT_TILE_LAYER_ID,
  showHistorical: false,
  showPredicted: false,
  showAnomalies: true,
};

export default function MapPage() {
  const [filters, setFilters] = useState<MapFilterState>(DEFAULT_FILTERS);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const { t } = useLocale();
  // The vessel-detail panel's own selection + "last N hours" choice — kept
  // in the shared provider (not local state) so its History tab can drive
  // this actual map's trajectory instead of needing an embedded map.
  const { selectedMmsi, historyHours, historyRequested, closeVessel } = useVesselDetailDialog();

  const { data: vesselsResponse, isLoading } = useAllVesselsForMap({
    search: filters.search || undefined,
    shipType: filters.shipType === ALL ? undefined : filters.shipType,
    status: filters.status === ALL ? undefined : filters.status,
  });
  const { data: ports } = usePorts();
  const { data: anomalies } = useOpenAnomalies();

  const vessels = useMemo(() => vesselsResponse?.data ?? [], [vesselsResponse]);

  // A vessel opened in the detail panel (from anywhere — this map's own
  // popup, a table on another page, a fleet roster) takes priority as the
  // "active" vessel for trajectory purposes; a plain marker click without
  // opening the panel still flies to/highlights via local state alone.
  const sheetVessel = useMemo(
    () => (selectedMmsi ? (vessels.find((v) => v.mmsi === selectedMmsi) ?? null) : null),
    [vessels, selectedMmsi]
  );
  const activeVesselId = sheetVessel?.id ?? selectedVesselId;
  const activeVessel = sheetVessel ?? vessels.find((v) => v.id === selectedVesselId) ?? null;

  // Only draw the trajectory once the user has actually picked a window in
  // the History tab (or turned on the "Historical trajectory" toggle) —
  // simply opening a vessel's detail panel shouldn't draw a dashed line no
  // one asked for yet.
  const showTrajectory = historyRequested || filters.showHistorical;
  const trajectoryHours = sheetVessel ? historyHours : 24;

  // Closing the detail panel should fully release the map's selection too
  // (stop the highlight ring / fly-to-lock), not leave it "stuck" on the
  // vessel that was open.
  const prevMmsiRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevMmsiRef.current && !selectedMmsi) {
      setSelectedVesselId(null);
    }
    prevMmsiRef.current = selectedMmsi;
  }, [selectedMmsi]);

  const { data: positions } = useVesselPositions(
    showTrajectory ? (activeVessel?.mmsi ?? null) : null,
    trajectoryHours
  );
  const { data: predictions } = usePredictions(
    filters.showPredicted ? (activeVessel?.mmsi ?? null) : null
  );

  const handleSelectVessel = useCallback((vessel: VesselWithLatestPosition) => {
    setSelectedVesselId(vessel.id);
  }, []);

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
        selectedVesselId={activeVesselId}
        onSelectVessel={handleSelectVessel}
        historicalTrack={showTrajectory ? (positions ?? []) : []}
        predictedRoute={filters.showPredicted ? (predictions?.trajectory.points ?? []) : []}
        tileLayerId={filters.tileLayerId}
        resetSignal={resetSignal}
        cluster
      />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
        <div className="pointer-events-auto flex justify-between">
          {isLoading ? (
            <div className="h-fit rounded-md border border-border bg-card/95 px-3 py-1.5 text-xs text-muted-foreground shadow-lg backdrop-blur">
              {t("Loading fleet…")}
            </div>
          ) : (
            <span />
          )}
          <MapControlsPanel
            filters={filters}
            onChange={handleChange}
            onReset={handleReset}
            selectedVesselName={activeVessel?.name}
            onClearSelection={() => {
              setSelectedVesselId(null);
              closeVessel();
            }}
            vessels={vessels}
            onSelectVessel={handleSelectVessel}
          />
        </div>
        <div className="pointer-events-auto self-start">
          <MapLegend />
        </div>
      </div>
    </div>
  );
}
