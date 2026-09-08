"use client";

import { formatRelativeTime, formatSog } from "@/lib/format";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";
import type { RecentActivityItem } from "@/lib/data/dashboard";

export function RecentActivityList({ items }: { items: RecentActivityItem[] }) {
  const { openVessel } = useVesselDetailDialog();

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent AIS activity.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item, i) => (
        <li key={`${item.vesselId}-${item.timestamp}-${i}`}>
          <button
            type="button"
            onClick={() => openVessel(item.vesselMmsi)}
            className="flex w-full items-center justify-between gap-3 py-2 text-left text-sm hover:bg-secondary/50"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{item.vesselName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {formatSog(item.sog)} · {item.destination ?? "No destination"}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatRelativeTime(item.timestamp)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
