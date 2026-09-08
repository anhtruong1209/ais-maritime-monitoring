import Link from "next/link";
import { SeverityBadge } from "@/components/alerts/SeverityBadge";
import { ANOMALY_TYPE_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import type { AnomalyWithVessel } from "@/types";

export function RecentAlertsList({ items }: { items: AnomalyWithVessel[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No alerts detected.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((alert) => (
        <li key={alert.id}>
          <Link
            href={`/vessels/${alert.vesselMmsi}`}
            className="flex items-center justify-between gap-3 py-2 text-sm hover:bg-secondary/50"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{ANOMALY_TYPE_LABELS[alert.type]}</p>
              <p className="truncate text-xs text-muted-foreground">
                {alert.vesselName} · {formatRelativeTime(alert.detectedAt)}
              </p>
            </div>
            <SeverityBadge severity={alert.severity} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
