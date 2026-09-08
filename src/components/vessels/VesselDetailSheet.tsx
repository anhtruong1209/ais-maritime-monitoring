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
            "fixed top-0 right-0 z-40 flex h-dvh w-full translate-x-0 flex-col border-l border-border bg-popover text-popover-foreground shadow-2xl transition-transform duration-200 ease-in-out sm:max-w-2xl",
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
