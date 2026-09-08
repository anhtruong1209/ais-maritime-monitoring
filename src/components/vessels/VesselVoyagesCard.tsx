"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoyageStatusBadge } from "@/components/voyages/VoyageStatusBadge";
import { formatDateTime } from "@/lib/format";
import { useLocale } from "@/providers/locale-provider";
import type { Voyage } from "@/types";

export function VesselVoyagesCard({ voyages }: { voyages: Voyage[] }) {
  const { t } = useLocale();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t("Voyage History")}</CardTitle>
      </CardHeader>
      <CardContent>
        {voyages.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("No voyage records.")}</p>
        ) : (
          <ul className="space-y-3">
            {voyages.map((voyage) => (
              <li key={voyage.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {voyage.departurePort} → {voyage.destinationPort}
                  </p>
                  <VoyageStatusBadge status={voyage.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("Departed")} {formatDateTime(voyage.departureTime)}
                  {voyage.actualArrival
                    ? ` · ${t("Arrived")} ${formatDateTime(voyage.actualArrival)}`
                    : voyage.estimatedArrival
                      ? ` · ETA ${formatDateTime(voyage.estimatedArrival)}`
                      : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
