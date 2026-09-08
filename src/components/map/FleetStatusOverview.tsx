"use client";

import { useMemo } from "react";
import { OFFLINE_VESSEL_COLOR } from "@/lib/map/ship-type-meta";
import { useLocale } from "@/providers/locale-provider";
import type { VesselWithLatestPosition } from "@/types";

/** Small "how's the fleet doing" readout — counts by status for whatever
 * vessel set is currently loaded (already filtered by the search/type/
 * status filters), so the numbers here always match what's actually
 * shown on the map. */
export function FleetStatusOverview({ vessels }: { vessels: VesselWithLatestPosition[] }) {
  const { t } = useLocale();

  const counts = useMemo(() => {
    let moving = 0;
    let idle = 0; // anchored or stopped
    let offline = 0;
    for (const v of vessels) {
      if (v.status === "moving") moving += 1;
      else if (v.status === "offline") offline += 1;
      else idle += 1;
    }
    return { total: vessels.length, moving, idle, offline, online: moving + idle };
  }, [vessels]);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-card/95 px-3 py-1.5 text-xs shadow-lg backdrop-blur">
      <span className="font-semibold">
        {t("Fleet")} {counts.total}
      </span>
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span className="size-2 rounded-full bg-emerald-500" />
        {t("Online")} {counts.online}
      </span>
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span className="size-2 rounded-full bg-sky-500" />
        {t("Moving")} {counts.moving}
      </span>
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span className="size-2 rounded-full" style={{ backgroundColor: OFFLINE_VESSEL_COLOR }} />
        {t("No signal")} {counts.offline}
      </span>
    </div>
  );
}
