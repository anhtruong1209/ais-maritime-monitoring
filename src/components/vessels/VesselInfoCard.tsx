"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/providers/locale-provider";
import type { Vessel } from "@/types";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export function VesselInfoCard({ vessel }: { vessel: Vessel }) {
  const { t } = useLocale();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t("Vessel Information")}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-y-3">
          <Field label="MMSI" value={vessel.mmsi} />
          <Field label="IMO" value={vessel.imo ?? "—"} />
          <Field label={t("Call Sign")} value={vessel.callSign ?? "—"} />
          <Field label={t("Flag")} value={vessel.flag} />
          <Field label={t("Length")} value={vessel.length ? `${vessel.length} m` : "—"} />
          <Field label={t("Width")} value={vessel.width ? `${vessel.width} m` : "—"} />
        </dl>
      </CardContent>
    </Card>
  );
}
