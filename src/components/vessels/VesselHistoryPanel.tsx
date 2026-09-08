"use client";

import { RecentAisMessagesTable } from "./RecentAisMessagesTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVesselPositions } from "@/hooks/use-vessel-positions";
import { TRAJECTORY_WINDOW_OPTIONS } from "@/lib/constants";
import { useLocale } from "@/providers/locale-provider";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";

/**
 * Data view of a vessel's recent AIS history — no embedded map here on
 * purpose. `historyHours` is shared (via VesselDetailProvider) rather than
 * local state, so picking a window here also drives the trajectory drawn
 * on the actual map on /map, instead of needing a second map in this panel.
 */
export function VesselHistoryPanel({ mmsi }: { mmsi: string }) {
  const { historyHours, setHistoryHours } = useVesselDetailDialog();
  const { data: positions, isLoading } = useVesselPositions(mmsi, historyHours);
  const { t } = useLocale();

  return (
    <div className="space-y-3">
      <Tabs value={String(historyHours)} onValueChange={(v) => setHistoryHours(Number(v))}>
        <TabsList>
          {TRAJECTORY_WINDOW_OPTIONS.map((opt) => (
            <TabsTrigger key={opt.hours} value={String(opt.hours)}>
              {t(opt.label)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <RecentAisMessagesTable positions={[...(positions ?? [])].reverse()} />
      )}
    </div>
  );
}
