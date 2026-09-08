"use client";

import { TRAJECTORY_WINDOW_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";

/**
 * Just the trajectory-window picker — no table here. Picking a window
 * draws that trajectory directly on the actual map on /map (historyHours
 * is shared via VesselDetailProvider), which is the whole point; a table
 * of raw lat/lon rows next to it added weight without adding anything the
 * map doesn't already show better.
 */
export function VesselHistoryPanel({ mmsi }: { mmsi: string }) {
  const { historyHours, setHistoryHours } = useVesselDetailDialog();
  const { t } = useLocale();

  return (
    <div className="flex flex-wrap gap-1.5">
      {TRAJECTORY_WINDOW_OPTIONS.map((opt) => {
        const active = historyHours === opt.hours;
        return (
          <button
            key={opt.hours}
            type="button"
            onClick={() => setHistoryHours(opt.hours, mmsi)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-secondary"
            )}
          >
            {t(opt.label)}
          </button>
        );
      })}
    </div>
  );
}
