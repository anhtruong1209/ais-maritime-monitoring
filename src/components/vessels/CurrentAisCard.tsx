"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCog, formatCoordinate, formatDateTime, formatSog } from "@/lib/format";
import { useLocale } from "@/providers/locale-provider";
import type { AISPosition } from "@/types";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export function CurrentAisCard({ position }: { position: AISPosition | null }) {
  const { t } = useLocale();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t("Current AIS Data")}</CardTitle>
      </CardHeader>
      <CardContent>
        {!position ? (
          <p className="text-sm text-muted-foreground">{t("No AIS data available.")}</p>
        ) : (
          <dl className="grid grid-cols-2 gap-y-3">
            <Field label={t("Latitude")} value={formatCoordinate(position.latitude, "lat")} />
            <Field label={t("Longitude")} value={formatCoordinate(position.longitude, "lon")} />
            <Field label={t("SOG")} value={formatSog(position.sog)} />
            <Field label={t("COG")} value={formatCog(position.cog)} />
            <Field
              label={t("Heading")}
              value={position.heading != null ? `${position.heading.toFixed(0)}°` : "—"}
            />
            <Field label={t("Nav Status")} value={position.navStatus ?? "—"} />
            <Field label={t("Destination")} value={position.destination ?? "—"} />
            <Field label={t("Timestamp")} value={formatDateTime(position.timestamp)} />
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
