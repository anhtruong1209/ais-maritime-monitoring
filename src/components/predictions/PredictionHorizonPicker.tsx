"use client";

import { PREDICTION_HORIZON_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";

/**
 * How far ahead the trajectory prediction looks — same pill-button style
 * and same "nothing selected until clicked" rule as VesselHistoryPanel's
 * window picker: a default horizon exists internally, but no button
 * should look chosen (and nothing should draw on the map) until the user
 * actually picks one.
 */
export function PredictionHorizonPicker({ mmsi }: { mmsi: string }) {
  const { predictionHorizonMinutes, predictionRequested, predictionVesselMmsi, setPredictionHorizonMinutes } =
    useVesselDetailDialog();
  const { t } = useLocale();

  return (
    <div className="flex flex-wrap gap-1.5">
      {PREDICTION_HORIZON_OPTIONS.map((opt) => {
        const active =
          predictionRequested && predictionVesselMmsi === mmsi && predictionHorizonMinutes === opt.minutes;
        return (
          <button
            key={opt.minutes}
            type="button"
            onClick={() => setPredictionHorizonMinutes(opt.minutes, mmsi)}
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
