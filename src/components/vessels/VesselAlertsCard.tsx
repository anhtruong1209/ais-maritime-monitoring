"use client";

import { SeverityBadge } from "@/components/alerts/SeverityBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOpenAnomalies } from "@/hooks/use-anomalies";
import { formatRelativeTime } from "@/lib/format";
import { ANOMALY_TYPE_LABELS } from "@/lib/constants";
import { useLocale } from "@/providers/locale-provider";

/** This vessel's own open anomalies — filtered client-side from the
 * already-fetched open-anomalies list (capped at 100 rows fleet-wide),
 * rather than a separate per-vessel endpoint. */
export function VesselAlertsCard({ mmsi }: { mmsi: string }) {
  const { data: anomalies } = useOpenAnomalies();
  const { t } = useLocale();
  const vesselAnomalies = (anomalies ?? []).filter((a) => a.vesselMmsi === mmsi);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t("Alerts")}</CardTitle>
      </CardHeader>
      <CardContent>
        {vesselAnomalies.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("No open alerts for this vessel.")}</p>
        ) : (
          <ul className="space-y-3">
            {vesselAnomalies.map((a) => (
              <li key={a.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{t(ANOMALY_TYPE_LABELS[a.type])}</span>
                  <SeverityBadge severity={a.severity} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatRelativeTime(a.detectedAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
