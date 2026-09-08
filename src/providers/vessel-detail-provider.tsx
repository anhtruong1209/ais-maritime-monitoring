"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface VesselDetailContextValue {
  selectedMmsi: string | null;
  openVessel: (mmsi: string) => void;
  closeVessel: () => void;
  /** "Last N hours" window chosen in the detail panel's History tab —
   * shared so the /map page can draw that same window's trajectory on the
   * actual map instead of the panel needing its own embedded map. */
  historyHours: number;
  setHistoryHours: (hours: number) => void;
  /** True only once the user has actually picked a window in the History
   * tab (not merely because a vessel is selected/open) — the map should
   * stay clean until the user asks to see a trajectory, not draw one the
   * moment a vessel's detail panel opens. Resets whenever the panel opens
   * a (possibly different) vessel or closes. */
  historyRequested: boolean;
}

const VesselDetailContext = createContext<VesselDetailContextValue | null>(null);

export function VesselDetailProvider({ children }: { children: React.ReactNode }) {
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const [historyHours, setHistoryHoursState] = useState(24);
  const [historyRequested, setHistoryRequested] = useState(false);

  const openVessel = useCallback((mmsi: string) => {
    setSelectedMmsi(mmsi);
    setHistoryRequested(false);
  }, []);

  const closeVessel = useCallback(() => {
    setSelectedMmsi(null);
    setHistoryRequested(false);
  }, []);

  const setHistoryHours = useCallback((hours: number) => {
    setHistoryHoursState(hours);
    setHistoryRequested(true);
  }, []);

  const value = useMemo(
    () => ({
      selectedMmsi,
      openVessel,
      closeVessel,
      historyHours,
      setHistoryHours,
      historyRequested,
    }),
    [selectedMmsi, openVessel, closeVessel, historyHours, setHistoryHours, historyRequested]
  );

  return (
    <VesselDetailContext.Provider value={value}>{children}</VesselDetailContext.Provider>
  );
}

/** Opens the shared vessel detail modal for a given MMSI from anywhere in
 * the app shell — vessel tables, map popups, fleet rosters, etc. */
export function useVesselDetailDialog() {
  const ctx = useContext(VesselDetailContext);
  if (!ctx) {
    throw new Error("useVesselDetailDialog must be used within VesselDetailProvider");
  }
  return ctx;
}
