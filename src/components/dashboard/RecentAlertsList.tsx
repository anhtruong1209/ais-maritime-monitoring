"use client";

import { SeverityBadge } from "@/components/alerts/SeverityBadge";
import { ANOMALY_TYPE_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import { useLocale } from "@/providers/locale-provider";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";
import type { AnomalyWithVessel } from "@/types";

export function RecentAlertsList({ items }: { items: AnomalyWithVessel[] }) {
  const { openVessel } = useVesselDetailDialog();
  const { t } = useLocale();

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("No alerts detected.")}</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((alert) => (
        <li key={alert.id}>
          <button
            type="button"
            onClick={() => openVessel(alert.vesselMmsi)}
            className="flex w-full items-center justify-between gap-3 py-2 text-left text-sm hover:bg-secondary/50"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{t(ANOMALY_TYPE_LABELS[alert.type])}</p>
              <p className="truncate text-xs text-muted-foreground">
                {alert.vesselName} · {formatRelativeTime(alert.detectedAt)}
              </p>
            </div>
            <SeverityBadge severity={alert.severity} />
          </button>
        </li>
      ))}
    </ul>
  );
}
