"use client";

import { useState } from "react";
import { RecentAisMessagesTable } from "./RecentAisMessagesTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVesselPositions } from "@/hooks/use-vessel-positions";
import { TRAJECTORY_WINDOW_OPTIONS } from "@/lib/constants";
import { useLocale } from "@/providers/locale-provider";

/**
 * Plain data view of a vessel's recent AIS history — no embedded map here
 * on purpose, just the "last N hours" window switch and a table. The map
 * is the one on the page behind this panel, not a second one inside it.
 */
export function VesselHistoryPanel({ mmsi }: { mmsi: string }) {
  const [hours, setHours] = useState(24);
  const { data: positions, isLoading } = useVesselPositions(mmsi, hours);
  const { t } = useLocale();

  return (
    <div className="space-y-3">
      <Tabs value={String(hours)} onValueChange={(v) => setHours(Number(v))}>
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
