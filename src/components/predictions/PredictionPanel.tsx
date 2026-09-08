"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatPercent } from "@/lib/format";
import { useLocale } from "@/providers/locale-provider";
import { PredictionHorizonPicker } from "./PredictionHorizonPicker";
import type { TrajectoryPredictionResult } from "@/types";

/**
 * Trajectory-prediction summary, including its own horizon picker. Same
 * "nothing shown until asked" rule as Position History: `trajectory` is
 * only passed in once the caller has actually fetched it for a
 * user-picked horizon (see PredictionHorizonPicker/predictionRequested) —
 * until then this just shows the picker and a prompt.
 *
 * Model name + prediction timestamp are always shown alongside the
 * result — CORE AIS data (what the vessel actually reported) and AI
 * PREDICTION output (what a model produced from it, and when) must never
 * blur together, per the "AI is a first-class, clearly-labeled feature"
 * requirement.
 */
export function PredictionPanel({
  mmsi,
  trajectory,
  isLoading,
}: {
  mmsi: string;
  trajectory: TrajectoryPredictionResult | null;
  isLoading: boolean;
}) {
  const finalPoint = trajectory?.points.at(-1);
  const { t } = useLocale();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{t("AI Trajectory Prediction")}</CardTitle>
        {trajectory?.isMock && (
          <Badge variant="outline" className="border-amber-500/40 text-amber-400">
            {t("DEMO AI PREDICTION")}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <PredictionHorizonPicker mmsi={mmsi} />

        {isLoading && <Skeleton className="h-32 w-full" />}

        {!isLoading && !trajectory && (
          <p className="text-sm text-muted-foreground">
            {t("Pick a horizon above to generate a prediction.")}
          </p>
        )}

        {!isLoading && trajectory && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("Model")}</p>
                <p className="text-sm font-medium">{trajectory.modelName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("Prediction timestamp")}</p>
                <p className="text-sm font-medium tabular-nums">
                  {formatDateTime(trajectory.generatedAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("Horizon")}</p>
                <p className="text-sm font-medium tabular-nums">{trajectory.horizonMinutes} min</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("Predicted Points")}</p>
                <p className="text-sm font-medium tabular-nums">{trajectory.points.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("Final Confidence")}</p>
                <p className="text-sm font-medium tabular-nums">
                  {finalPoint?.confidence != null ? formatPercent(finalPoint.confidence) : "—"}
                </p>
              </div>
            </div>

            {trajectory.points.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-secondary text-muted-foreground">
                    <tr>
                      <th className="px-2 py-1 text-left">{t("Timestamp")}</th>
                      <th className="px-2 py-1 text-left">{t("Latitude")}</th>
                      <th className="px-2 py-1 text-left">{t("Longitude")}</th>
                      <th className="px-2 py-1 text-left">{t("Confidence")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trajectory.points.map((point) => (
                      <tr key={point.timestamp} className="border-t border-border">
                        <td className="px-2 py-1">{formatDateTime(point.timestamp)}</td>
                        <td className="px-2 py-1 tabular-nums">{point.latitude.toFixed(4)}</td>
                        <td className="px-2 py-1 tabular-nums">{point.longitude.toFixed(4)}</td>
                        <td className="px-2 py-1 tabular-nums">
                          {point.confidence != null ? formatPercent(point.confidence) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
