"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface VesselDetailContextValue {
  selectedMmsi: string | null;
  openVessel: (mmsi: string) => void;
  closeVessel: () => void;
}

const VesselDetailContext = createContext<VesselDetailContextValue | null>(null);

export function VesselDetailProvider({ children }: { children: React.ReactNode }) {
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      selectedMmsi,
      openVessel: setSelectedMmsi,
      closeVessel: () => setSelectedMmsi(null),
    }),
    [selectedMmsi]
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
