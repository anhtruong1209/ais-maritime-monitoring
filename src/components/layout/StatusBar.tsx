"use client";

import { useEffect, useState } from "react";
import { useFleetSummary } from "@/hooks/use-vessels";
import { OFFLINE_VESSEL_COLOR } from "@/lib/map/ship-type-meta";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/providers/locale-provider";

const VN_TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ho_Chi_Minh",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function StatusBar() {
  // Starts null so the server-rendered markup has no clock value, then
  // picks up the real time on mount — avoids a hydration mismatch.
  const [now, setNow] = useState<Date | null>(null);
  const { t } = useLocale();
  // Global "how's the fleet doing" readout, unfiltered — lives here (rather
  // than floating over the map) so it's visible on every page and never
  // sits on top of the map's own zoom control. Fetches just the counts
  // (see /api/vessels/summary), not the full 1500-row vessel list the map
  // needs — this footer renders on every page, so that would otherwise
  // mean every navigation pays for a payload it only reduces to 4 numbers.
  const { data: stats } = useFleetSummary();
  const counts = stats && {
    total: stats.totalVessels,
    moving: stats.moving,
    offline: stats.offline,
    online: stats.moving + stats.anchored + stats.stopped,
  };

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="flex h-8 shrink-0 items-center justify-between border-t border-border bg-card px-4 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>{t("AIS Maritime Monitoring")}</span>
        {counts ? (
          <div className="hidden items-center gap-3 sm:flex">
            <span className="font-medium text-foreground">
              {t("Vessel")} {counts.total}
            </span>
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {t("Online")} {counts.online}
            </span>
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-sky-500" />
              {t("Moving")} {counts.moving}
            </span>
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full" style={{ backgroundColor: OFFLINE_VESSEL_COLOR }} />
              {t("No signal")} {counts.offline}
            </span>
          </div>
        ) : (
          <Skeleton className="hidden h-3 w-56 sm:block" />
        )}
      </div>
      <div className="flex items-center gap-4">
        <span>{t("Region: Vietnam / East Sea")}</span>
        <span suppressHydrationWarning>
          {now ? `${VN_TIME_FORMAT.format(now)} VN` : "—"}
        </span>
        <span suppressHydrationWarning>
          {now ? now.toUTCString().slice(17, 25) + " UTC" : "—"}
        </span>
      </div>
    </footer>
  );
}
