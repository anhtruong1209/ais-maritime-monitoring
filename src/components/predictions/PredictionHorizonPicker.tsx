"use client";

import { PREDICTION_HORIZON_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";

/**
 * How far ahead the trajectory prediction looks — same pill-button style
 * as VesselHistoryPanel's window picker. Unlike history, a horizon is
 * always "selected" (there's always a prediction shown, just a shorter or
 * longer one), so the current value shows as active from the start
 * instead of starting blank.
 */
export function PredictionHorizonPicker() {
  const { predictionHorizonMinutes, setPredictionHorizonMinutes } = useVesselDetailDialog();
  const { t } = useLocale();

  return (
    <div className="flex flex-wrap gap-1.5">
      {PREDICTION_HORIZON_OPTIONS.map((opt) => {
        const active = predictionHorizonMinutes === opt.minutes;
        return (
          <button
            key={opt.minutes}
            type="button"
            onClick={() => setPredictionHorizonMinutes(opt.minutes)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-secondary"
            )}
          >
            {t(opt.label)}
          </button>
        );
      })}
    </div>
  );
}
