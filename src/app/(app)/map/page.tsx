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
  const {
    selectedMmsi,
    historyHours,
    historyRequested,
    historyVesselMmsi,
    predictionHorizonMinutes,
    openVessel,
    closeVessel,
  } = useVesselDetailDialog();

  const { data: vesselsResponse, isLoading } = useAllVesselsForMap({
    search: filters.search || undefined,
    shipType: filters.shipType === ALL ? undefined : filters.shipType,
    status: filters.status === ALL ? undefined : filters.status,
  });
  const { data: ports } = usePorts();
  const { data: anomalies } = useOpenAnomalies();

  const vessels = useMemo(() => vesselsResponse?.data ?? [], [vesselsResponse]);

  // A vessel opened in the detail panel (from anywhere — a marker click on
  // this map, a table on another page, a fleet roster) is the "active"
  // vessel for trajectory/highlight purposes; `selectedVesselId` is a
  // fallback for the rare case the panel is opened without going through
  // this map's own marker click at all.
  const sheetVessel = useMemo(
    () => (selectedMmsi ? (vessels.find((v) => v.mmsi === selectedMmsi) ?? null) : null),
    [vessels, selectedMmsi]
  );
  const activeVesselId = sheetVessel?.id ?? selectedVesselId;
  const activeVessel = sheetVessel ?? vessels.find((v) => v.id === selectedVesselId) ?? null;

  // Only draw the trajectory once the user has actually picked a window in
  // the History tab (or turned on the "Historical trajectory" toggle) for
  // the vessel that's currently active — switching to a different vessel
  // shouldn't keep showing a trajectory that was requested for the last one.
  const showTrajectory =
    (historyRequested && historyVesselMmsi === activeVessel?.mmsi) || filters.showHistorical;
  const trajectoryHours = historyRequested ? historyHours : 24;

  // Unlike history (which needs a window picked — 1h vs 24h materially
  // changes what's drawn), a prediction has nothing to choose: opening a
  // vessel's detail panel is enough to show its one predicted route,
  // mirroring the same "dashed line just shows up" experience as history.
  const showPredicted = Boolean(sheetVessel) || filters.showPredicted;

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
    showPredicted ? (activeVessel?.mmsi ?? null) : null,
    null,
    predictionHorizonMinutes
  );

  // A single click opens the one vessel-detail panel directly — no separate
  // preview popup that then links to a second, bigger panel.
  const handleSelectVessel = useCallback(
    (vessel: VesselWithLatestPosition) => {
      setSelectedVesselId(vessel.id);
      openVessel(vessel.mmsi);
    },
    [openVessel]
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
        selectedVesselId={activeVesselId}
        onSelectVessel={handleSelectVessel}
        historicalTrack={showTrajectory ? (positions ?? []) : []}
        predictedRoute={showPredicted ? (predictions?.trajectory.points ?? []) : []}
        tileLayerId={filters.tileLayerId}
        resetSignal={resetSignal}
        cluster
      />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
        <div className="pointer-events-auto">
          {isLoading && (
            <div className="h-fit rounded-md border border-border bg-card/95 px-3 py-1.5 text-xs text-muted-foreground shadow-lg backdrop-blur">
              {t("Loading fleet…")}
            </div>
          )}
        </div>
      </div>

      {/* Both `fixed` to the viewport (not part of the absolute-inset-0
          overlay above), matching VesselDetailSheet's own positioning —
          deliberately independent of the map container's own box so
          neither can end up affected by Leaflet's layout/zoom
          recalculations. The legend sits bottom-RIGHT rather than
          bottom-left specifically because the detail panel is docked
          left and would otherwise cover it whenever it's open. z-index is
          ABOVE the detail sheet's (z-[2000]): on a narrower viewport the
          sheet's width plus this panel's width can exceed the screen
          width, and when that overlap happens the sheet must not be the
          one left on top — that made the panel's selects unclickable. */}
      <div className="pointer-events-none fixed top-[4.25rem] right-3 z-[2100]">
        <div className="pointer-events-auto">
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
      </div>
      <div className="pointer-events-none fixed right-3 bottom-11 z-[2100]">
        <div className="pointer-events-auto">
          <MapLegend />
        </div>
      </div>
    </div>
  );
}
