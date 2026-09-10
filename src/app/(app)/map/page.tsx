"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LatLngTuple } from "leaflet";
import { MapCanvas } from "@/components/map/MapCanvas";
import { MapControlsPanel, type MapFilterState } from "@/components/map/MapControlsPanel";
import { MapLegend } from "@/components/map/MapLegend";
import type { CollisionPathPair } from "@/components/map/CollisionPathLayer";
import { useAllVesselsForMap } from "@/hooks/use-vessels";
import { usePorts } from "@/hooks/use-ports";
import { useVesselPositions } from "@/hooks/use-vessel-positions";
import { useTrajectoryPrediction } from "@/hooks/use-predictions";
import { useOpenAnomalies } from "@/hooks/use-anomalies";
import { assessCollisionRisk, calculateCpaTcpa, projectPosition } from "@/lib/collision";
import { DEFAULT_TILE_LAYER_ID } from "@/lib/map/config";
import { interpolateTrackPosition } from "@/lib/map/playback";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";
import { ALL } from "@/lib/constants";
import type { VesselWithLatestPosition } from "@/types";

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
  // The vessel-detail panel's own selection + "last N hours" choice — kept
  // in the shared provider (not local state) so its History tab can drive
  // this actual map's trajectory instead of needing an embedded map.
  const {
    selectedMmsi,
    historyHours,
    historyRequested,
    historyVesselMmsi,
    predictionHorizonMinutes,
    predictionRequested,
    predictionVesselMmsi,
    playbackProgress,
    collisionCompareMmsi,
    openVessel,
    closeVessel,
  } = useVesselDetailDialog();

  // `filters.search` deliberately isn't sent here — it only drives the
  // search box's own (client-side, instant) autocomplete dropdown. Wiring
  // it into this query used to refetch and rebuild the entire marker/
  // cluster tree on every keystroke; now the marker set only changes for
  // filters the user actually commits to (type/status dropdowns), and
  // picking a vessel from the dropdown flies to/highlights it instead.
  const { data: vesselsResponse } = useAllVesselsForMap({
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

  // Same rule as history: nothing drawn until the user actually picks a
  // horizon for the vessel that's currently active.
  const showPredicted =
    (predictionRequested && predictionVesselMmsi === activeVessel?.mmsi) || filters.showPredicted;

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

  // Playback (VesselHistoryPanel's play/pause + scrub) only makes sense
  // once the user has actually picked a window for the active vessel —
  // the legacy `filters.showHistorical` toggle path has no playback
  // controls anywhere, so it never has a progress worth animating.
  const playbackActive = historyRequested && historyVesselMmsi === activeVessel?.mmsi;
  const playbackPosition = playbackActive
    ? interpolateTrackPosition(positions ?? [], playbackProgress)
    : null;
  const { data: trajectory } = useTrajectoryPrediction(
    showPredicted ? (activeVessel?.mmsi ?? null) : null,
    predictionHorizonMinutes
  );

  // Draws both vessels' predicted straight-line paths to their CPA — see
  // CollisionRiskCard, which is what sets collisionCompareMmsi. Only ever
  // set while that vessel's detail panel is open (openVessel/closeVessel
  // reset it to null), so `activeVessel` here is always the same vessel
  // the card computed it for — no extra "is this stale" guard needed.
  const collisionPair: CollisionPathPair | null = useMemo(() => {
    if (!collisionCompareMmsi || !activeVessel?.latestPosition) return null;
    const other = vessels.find((v) => v.mmsi === collisionCompareMmsi);
    if (!other?.latestPosition) return null;

    const a = activeVessel.latestPosition;
    const b = other.latestPosition;
    const result = calculateCpaTcpa(a, b);
    if (result.tcpaMinutes == null) return null;

    const projectedA = projectPosition(a, result.tcpaMinutes);
    const projectedB = projectPosition(b, result.tcpaMinutes);

    return {
      vesselACurrent: [a.latitude, a.longitude] as LatLngTuple,
      vesselAProjected: [projectedA.latitude, projectedA.longitude] as LatLngTuple,
      vesselBCurrent: [b.latitude, b.longitude] as LatLngTuple,
      vesselBProjected: [projectedB.latitude, projectedB.longitude] as LatLngTuple,
      riskLevel: assessCollisionRisk(result).riskLevel,
    };
  }, [collisionCompareMmsi, activeVessel, vessels]);

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
        predictedRoute={showPredicted ? (trajectory?.points ?? []) : []}
        collisionPair={collisionPair}
        playbackPosition={playbackPosition}
        tileLayerId={filters.tileLayerId}
        resetSignal={resetSignal}
        cluster
      />

      {/* All `fixed` to the viewport rather than positioned relative to the
          map container, matching VesselDetailSheet's own positioning —
          deliberately independent of the map container's own box so none
          of these can end up affected by Leaflet's layout/zoom
          recalculations. The legend sits bottom-RIGHT rather than
          bottom-left specifically because the detail panel is docked
          left and would otherwise cover it whenever it's open. z-index is
          ABOVE the detail sheet's (z-[2000]): on a narrower viewport the
          sheet's width plus a panel's width can exceed the screen width,
          and when that overlap happens the sheet must not be the one
          left on top — that made the panel's selects unclickable. Nothing
          sits top-left any more (that's the map's own zoom control's
          spot) — the fleet counts live in the global StatusBar footer
          instead. */}
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
      <div className="pointer-events-none fixed right-3 bottom-16 z-[2100]">
        <div className="pointer-events-auto">
          <MapLegend />
        </div>
      </div>
    </div>
  );
}
