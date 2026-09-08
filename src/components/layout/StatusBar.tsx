"use client";

import { useEffect, useMemo, useState } from "react";
import { useAllVesselsForMap } from "@/hooks/use-vessels";
import { OFFLINE_VESSEL_COLOR } from "@/lib/map/ship-type-meta";
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
  // sits on top of the map's own zoom control.
  const { data: vesselsResponse } = useAllVesselsForMap({});

  const counts = useMemo(() => {
    const vessels = vesselsResponse?.data ?? [];
    let moving = 0;
    let idle = 0; // anchored or stopped
    let offline = 0;
    for (const v of vessels) {
      if (v.status === "moving") moving += 1;
      else if (v.status === "offline") offline += 1;
      else idle += 1;
    }
    return { total: vessels.length, moving, offline, online: moving + idle };
  }, [vesselsResponse]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="flex h-8 shrink-0 items-center justify-between border-t border-border bg-card px-4 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>{t("AIS Maritime Monitoring · MVP")}</span>
        {counts.total > 0 && (
          <div className="hidden items-center gap-3 sm:flex">
            <span className="font-medium text-foreground">
              {t("Fleet")} {counts.total}
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
