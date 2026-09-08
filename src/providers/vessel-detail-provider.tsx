"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_PREDICTION_HORIZON_MINUTES } from "@/lib/constants";

interface VesselDetailContextValue {
  selectedMmsi: string | null;
  openVessel: (mmsi: string) => void;
  closeVessel: () => void;
  /** "Last N hours" window chosen in the detail panel's History tab —
   * shared so the /map page can draw that same window's trajectory on the
   * actual map instead of the panel needing its own embedded map. */
  historyHours: number;
  setHistoryHours: (hours: number, mmsi: string) => void;
  /** True only once the user has actually picked a window for a vessel —
   * the map should stay clean until asked, not draw a trajectory the
   * moment a vessel's detail panel opens. */
  historyRequested: boolean;
  /** Which vessel historyHours/historyRequested currently apply to — lets
   * selecting a *different* vessel invalidate a stale trajectory request
   * left over from whichever vessel was open before. */
  historyVesselMmsi: string | null;
  /** How far ahead the trajectory prediction looks — shared the same way
   * as historyHours, so picking a horizon in the detail panel also
   * changes the predicted route drawn on the actual map. */
  predictionHorizonMinutes: number;
  setPredictionHorizonMinutes: (minutes: number) => void;
}

const VesselDetailContext = createContext<VesselDetailContextValue | null>(null);

export function VesselDetailProvider({ children }: { children: React.ReactNode }) {
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const [historyHours, setHistoryHoursState] = useState(24);
  const [historyRequested, setHistoryRequested] = useState(false);
  const [historyVesselMmsi, setHistoryVesselMmsi] = useState<string | null>(null);
  const [predictionHorizonMinutes, setPredictionHorizonMinutes] = useState(
    DEFAULT_PREDICTION_HORIZON_MINUTES
  );

  const openVessel = useCallback(
    (mmsi: string) => {
      setSelectedMmsi(mmsi);
      // Switching to a different vessel invalidates any trajectory that was
      // requested for the previous one.
      if (historyVesselMmsi !== mmsi) {
        setHistoryRequested(false);
      }
    },
    [historyVesselMmsi]
  );

  const closeVessel = useCallback(() => {
    setSelectedMmsi(null);
    setHistoryRequested(false);
  }, []);

  const setHistoryHours = useCallback((hours: number, mmsi: string) => {
    setHistoryHoursState(hours);
    setHistoryRequested(true);
    setHistoryVesselMmsi(mmsi);
  }, []);

  const value = useMemo(
    () => ({
      selectedMmsi,
      openVessel,
      closeVessel,
      historyHours,
      setHistoryHours,
      historyRequested,
      historyVesselMmsi,
      predictionHorizonMinutes,
      setPredictionHorizonMinutes,
    }),
    [
      selectedMmsi,
      openVessel,
      closeVessel,
      historyHours,
      setHistoryHours,
      historyRequested,
      historyVesselMmsi,
      predictionHorizonMinutes,
    ]
  );

  return (
    <VesselDetailContext.Provider value={value}>{children}</VesselDetailContext.Provider>
  );
}

/** Opens the shared vessel detail panel for a given MMSI from anywhere in
 * the app shell — vessel tables, map markers, fleet rosters, etc. This is
 * the single place vessel detail lives; a marker click opens it directly
 * rather than a separate small popup that then links to it. */
export function useVesselDetailDialog() {
  const ctx = useContext(VesselDetailContext);
  if (!ctx) {
    throw new Error("useVesselDetailDialog must be used within VesselDetailProvider");
  }
  return ctx;
}
