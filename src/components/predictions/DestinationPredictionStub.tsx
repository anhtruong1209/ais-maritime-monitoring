"use client";

import { Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/providers/locale-provider";
import type { DestinationPredictionResult } from "@/types";

/**
 * Prep only — the data contract (DestinationPredictionResult) and this
 * component exist so a real implementation later only has to supply
 * `result` and flip `disabled` off; no shape changes needed elsewhere.
 * Deliberately not wired to any API route yet.
 */
export function DestinationPredictionStub({
  result,
}: {
  result?: DestinationPredictionResult;
}) {
  const { t } = useLocale();

  return (
    <Card className="opacity-70">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Compass className="size-4" />
          {t("AI Destination Prediction")}
        </CardTitle>
        <Badge variant="outline">{t("Coming in next AI phase")}</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {result ? (
          <ul className="space-y-1.5">
            {result.candidates.map((c) => (
              <li key={c.portName} className="flex items-center justify-between text-sm">
                <span>{c.portName}</span>
                <span className="tabular-nums text-muted-foreground">
                  {Math.round(c.probability * 100)}%
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t(
              "Will estimate the vessel's most likely destination port from its trajectory even when AIS reports none."
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
