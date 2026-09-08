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
 * fully interactive (pan/zoom/click other vessels) while this is open,
 * per "map giữ nguyên, không cần chặn tương tác".
 */
export function VesselDetailSheet() {
  const { selectedMmsi, closeVessel } = useVesselDetailDialog();

  return (
    <DialogPrimitive.Root
      open={Boolean(selectedMmsi)}
      onOpenChange={(open) => !open && closeVessel()}
      modal={false}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Popup
          className={cn(
            // Leaflet's own panes/controls use z-index up to 1000 internally
            // (and MapLibre's canvas sits in one of those panes too), so
            // this has to clear that comfortably or the map renders on top
            // of the panel instead of the panel floating above the map.
            "fixed top-0 right-0 z-[2000] flex h-dvh w-full translate-x-0 flex-col border-l border-border bg-popover text-popover-foreground shadow-2xl transition-transform duration-200 ease-in-out sm:max-w-2xl",
            "data-starting-style:translate-x-full data-ending-style:translate-x-full"
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
