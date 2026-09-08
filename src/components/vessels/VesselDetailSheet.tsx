"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";
import { VesselDetailContent } from "./VesselDetailContent";

/**
 * A non-modal side panel, not a Dialog/Sheet overlay: `modal={false}` means
 * no backdrop, no scroll lock, no blocking the rest of the page — the map
 * (or table, or fleet roster) underneath stays exactly as it was and stays
 * fully interactive (pan/zoom/click other vessels) while this is open.
 *
 * Docked left, below the top nav bar (h-14) and above the status bar
 * (h-8) — matches the reference layout: one simple panel on one side,
 * top nav stays visible, map/table fills the rest.
 */
export function VesselDetailSheet() {
  const { selectedMmsi, closeVessel } = useVesselDetailDialog();

  return (
    <DialogPrimitive.Root
      open={Boolean(selectedMmsi)}
      onOpenChange={(open) => !open && closeVessel()}
      modal={false}
      // Base UI dismisses non-modal dialogs on outside presses by default —
      // without this, clicking/panning the map (which is "outside" this
      // panel) closed it on every interaction. It should only close via its
      // own Close button.
      disablePointerDismissal
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Popup
          className={cn(
            // Leaflet's own panes/controls use z-index up to 1000 internally
            // (and MapLibre's canvas sits in one of those panes too), so
            // this has to clear that comfortably or the map renders on top
            // of the panel instead of the panel floating above the map.
            "fixed top-14 bottom-8 left-0 z-[2000] flex w-full translate-x-0 flex-col border-r border-border bg-popover text-popover-foreground shadow-2xl transition-transform duration-200 ease-in-out sm:w-[38rem] xl:w-[46rem]",
            "data-starting-style:-translate-x-full data-ending-style:-translate-x-full"
          )}
        >
          <DialogPrimitive.Title className="sr-only">Vessel details</DialogPrimitive.Title>
          <DialogPrimitive.Close
            className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
          {selectedMmsi && <VesselDetailContent mmsi={selectedMmsi} />}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
