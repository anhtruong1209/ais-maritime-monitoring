"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatPercent, formatTime } from "@/lib/format";
import { useLocale } from "@/providers/locale-provider";
import type { EtaPredictionResult } from "@/types";

/** Reusable AI ETA display. Accepts real AI results once the FastAPI
 * service exists — the `isMock` flag is what decides whether the demo
 * badge shows. Deliberately titled "AI ETA" (not just "ETA"): this is a
 * model's output, distinct from any AIS/voyage-record ETA — see
 * EtaComparisonCard for the two side by side. */
export function EtaCard({ eta }: { eta: EtaPredictionResult }) {
  const { t } = useLocale();
  const etaMs = new Date(eta.predictedEta).getTime();
  const marginMs = eta.errorMarginMinutes * 60_000;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{t("AI ETA Prediction")}</CardTitle>
        {eta.isMock && (
          <Badge variant="outline" className="border-amber-500/40 text-amber-400">
            {t("DEMO AI PREDICTION")}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">{t("Destination")}</p>
          <p className="text-sm font-medium">{eta.destinationPort}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("AI ETA")}</p>
          <p className="text-xl font-semibold tabular-nums">{formatDateTime(eta.predictedEta)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">{t("Confidence")}</p>
            <p className="text-sm font-medium tabular-nums">{formatPercent(eta.confidence)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("Expected range")}</p>
            <p className="text-sm font-medium tabular-nums">
              {formatTime(new Date(etaMs - marginMs).toISOString())} –{" "}
              {formatTime(new Date(etaMs + marginMs).toISOString())}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("Remaining distance")}</p>
            <p className="text-sm font-medium tabular-nums">
              {eta.remainingDistanceKm.toFixed(1)} km
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("Current speed")}</p>
            <p className="text-sm font-medium tabular-nums">{eta.currentSpeedKnots.toFixed(1)} kn</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("Model")}</p>
            <p className="text-sm font-medium">{eta.modelName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("Prediction timestamp")}</p>
            <p className="text-sm font-medium tabular-nums">{formatDateTime(eta.generatedAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
