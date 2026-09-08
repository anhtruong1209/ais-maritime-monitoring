"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/providers/locale-provider";
import type { EtaPredictionResult, TrajectoryPredictionResult } from "@/types";

/**
 * Short, templated narrative built from the same numbers already shown
 * elsewhere on this panel (confidence, destination, course/speed
 * stability) — deterministic string composition, not a language model.
 * This exists to establish the UX slot ("here's where the AI explains
 * itself") for a future real explainability layer, not to claim to be
 * one now.
 */
export function AiInsightCard({
  trajectory,
  eta,
}: {
  trajectory: TrajectoryPredictionResult;
  eta: EtaPredictionResult;
}) {
  const { t, locale } = useLocale();

  const confidenceLevel =
    eta.confidence >= 0.8 ? "high" : eta.confidence >= 0.6 ? "medium" : "low";
  const confidenceWord = t(
    confidenceLevel === "high" ? "high" : confidenceLevel === "medium" ? "medium" : "low"
  );

  const stepMinutes =
    trajectory.points.length > 1
      ? Math.round(
          (new Date(trajectory.points[1].timestamp).getTime() -
            new Date(trajectory.points[0].timestamp).getTime()) /
            60_000
        )
      : trajectory.horizonMinutes;

  const sentences =
    locale === "vi"
      ? [
          `Tàu duy trì tốc độ ${eta.currentSpeedKnots.toFixed(1)} hải lý/giờ và hướng đi ổn định trong khoảng ${stepMinutes} phút quan sát gần đây.`,
          `Hành trình hiện tại phù hợp với lộ trình dự đoán đến ${eta.destinationPort}, còn cách khoảng ${eta.remainingDistanceKm.toFixed(1)} km.`,
          `Do đó độ tin cậy của dự đoán ETA ở mức ${confidenceWord} (${Math.round(eta.confidence * 100)}%).`,
        ]
      : [
          `The vessel has maintained ${eta.currentSpeedKnots.toFixed(1)} kn and a stable course over the recent ${stepMinutes}-minute observation window.`,
          `The current trajectory is consistent with the predicted route to ${eta.destinationPort}, ${eta.remainingDistanceKm.toFixed(1)} km remaining.`,
          `Therefore the ETA confidence is ${confidenceWord} (${Math.round(eta.confidence * 100)}%).`,
        ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{t("AI Insight")}</CardTitle>
        <Badge variant="outline" className="border-amber-500/40 text-amber-400">
          {t("DEMO AI PREDICTION")}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{sentences.join(" ")}</p>
      </CardContent>
    </Card>
  );
}
