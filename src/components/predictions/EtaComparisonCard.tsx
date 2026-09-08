"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { useLocale } from "@/providers/locale-provider";
import type { EtaPredictionResult, Voyage } from "@/types";

function diffMinutes(a: string, b: string): number {
  return Math.round(Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 60_000);
}

/**
 * AIS/voyage-record ETA vs the AI model's ETA, plus the actual arrival
 * once known — the comparison the whole "is the AI actually any good"
 * question hinges on. Uses the vessel's own in-progress voyage record for
 * the "AIS ETA" side (a genuinely different source from the AI
 * prediction, not another mock), so this stays meaningful once a real
 * model is wired in. MAE/RMSE/MAPE across many voyages (not just this
 * one) are a future aggregate view, not something one voyage can show.
 */
export function EtaComparisonCard({
  eta,
  voyage,
}: {
  eta: EtaPredictionResult;
  voyage: Voyage | null;
}) {
  const { t } = useLocale();
  const aisEta = voyage?.estimatedArrival ?? null;
  const actualArrival = voyage?.actualArrival ?? null;
  const aiErrorMinutes = actualArrival ? diffMinutes(actualArrival, eta.predictedEta) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t("ETA Comparison")}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">{t("AIS / Traditional ETA")}</p>
          <p className="text-sm font-medium tabular-nums">{formatDateTime(aisEta)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("AI ETA")}</p>
          <p className="text-sm font-medium tabular-nums">{formatDateTime(eta.predictedEta)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("Actual arrival")}</p>
          <p className="text-sm font-medium tabular-nums">
            {actualArrival ? formatDateTime(actualArrival) : t("Not arrived yet")}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("AI error")}</p>
          <p className="text-sm font-medium tabular-nums">
            {aiErrorMinutes != null ? `${aiErrorMinutes} ${t("min")}` : "—"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
