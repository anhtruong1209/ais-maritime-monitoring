"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";
import { VesselDetailContent } from "./VesselDetailContent";

/**
 * Rendered once at the app-shell level. Any component can open it via
 * `useVesselDetailDialog().openVessel(mmsi)` instead of navigating to
 * /vessels/[mmsi] — keeps "view detail" a single click from tables, map
 * popups, and fleet rosters without leaving the current page.
 */
export function VesselDetailDialog() {
  const { selectedMmsi, closeVessel } = useVesselDetailDialog();

  return (
    <Dialog open={Boolean(selectedMmsi)} onOpenChange={(open) => !open && closeVessel()}>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto p-0 sm:max-w-5xl">
        <DialogTitle className="sr-only">Vessel details</DialogTitle>
        {selectedMmsi && <VesselDetailContent mmsi={selectedMmsi} />}
      </DialogContent>
    </Dialog>
  );
}
