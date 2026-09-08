"use client";

import { useState } from "react";
import { Layers, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OFFLINE_VESSEL_COLOR, SHIP_TYPE_COLORS, SHIP_TYPE_LABELS } from "@/lib/map/ship-type-meta";
import { useLocale } from "@/providers/locale-provider";
import type { ShipType } from "@/types";

const ORDER: ShipType[] = ["cargo", "tanker", "passenger", "fishing", "tug", "military", "other"];

/** Collapsed to a small icon button by default — same pattern as
 * MapControlsPanel — so it doesn't permanently occupy map space when
 * the user isn't looking at it. */
export function MapLegend() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 border-border bg-card/95 shadow-lg backdrop-blur"
        onClick={() => setOpen(true)}
        aria-label={t("Vessel Type")}
      >
        <Layers className="size-4" />
      </Button>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card/95 p-3 text-sm shadow-lg backdrop-blur">
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="font-semibold text-muted-foreground">{t("Vessel Type")}</p>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => setOpen(false)}
          aria-label={t("Close")}
        >
          <X className="size-3.5" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {ORDER.map((type) => (
          <div key={type} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: SHIP_TYPE_COLORS[type] }}
            />
            {t(SHIP_TYPE_LABELS[type])}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: OFFLINE_VESSEL_COLOR }}
          />
          {t("No signal")}
        </div>
      </div>
    </div>
  );
}
