"use client";

import { RecentAisMessagesTable } from "./RecentAisMessagesTable";
import { Skeleton } from "@/components/ui/skeleton";
import { useVesselPositions } from "@/hooks/use-vessel-positions";
import { TRAJECTORY_WINDOW_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";

/**
 * Data view of a vessel's recent AIS history — no embedded map here on
 * purpose. `historyHours` is shared (via VesselDetailProvider) rather than
 * local state, so picking a window here also drives the trajectory drawn
 * on the actual map on /map, instead of needing a second map in this panel.
 * Plain option buttons, not a second row of tabs — this is a value picker,
 * not navigation.
 */
export function VesselHistoryPanel({ mmsi }: { mmsi: string }) {
  const { historyHours, setHistoryHours } = useVesselDetailDialog();
  const { data: positions, isLoading } = useVesselPositions(mmsi, historyHours);
  const { t } = useLocale();

  return (
    <div className="space-y-3">
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

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <RecentAisMessagesTable positions={[...(positions ?? [])].reverse()} />
      )}
    </div>
  );
}
