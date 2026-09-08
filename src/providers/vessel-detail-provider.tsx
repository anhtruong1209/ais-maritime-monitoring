"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface VesselDetailContextValue {
  selectedMmsi: string | null;
  openVessel: (mmsi: string) => void;
  closeVessel: () => void;
  /** "Last N hours" window chosen in the detail panel's History tab —
   * shared so the /map page can draw that same window's trajectory on the
   * actual map instead of the panel needing its own embedded map. */
  historyHours: number;
  setHistoryHours: (hours: number) => void;
}

const VesselDetailContext = createContext<VesselDetailContextValue | null>(null);

export function VesselDetailProvider({ children }: { children: React.ReactNode }) {
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const [historyHours, setHistoryHours] = useState(24);

  const value = useMemo(
    () => ({
      selectedMmsi,
      openVessel: setSelectedMmsi,
      closeVessel: () => setSelectedMmsi(null),
      historyHours,
      setHistoryHours,
    }),
    [selectedMmsi, historyHours]
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
