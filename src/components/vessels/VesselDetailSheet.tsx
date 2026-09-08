"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";
import { VesselDetailContent } from "./VesselDetailContent";

/**
 * Rendered once at the app-shell level. Any component can open it via
 * `useVesselDetailDialog().openVessel(mmsi)` — a side panel over whatever
 * page you're already on (the map, a vessel table, a fleet roster) rather
 * than a route change, so the map/table underneath never unmounts or
 * re-fetches.
 */
export function VesselDetailSheet() {
  const { selectedMmsi, closeVessel } = useVesselDetailDialog();

  return (
    <Sheet open={Boolean(selectedMmsi)} onOpenChange={(open) => !open && closeVessel()}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-2xl">
        <SheetTitle className="sr-only">Vessel details</SheetTitle>
        {selectedMmsi && <VesselDetailContent mmsi={selectedMmsi} />}
      </SheetContent>
    </Sheet>
  );
}
