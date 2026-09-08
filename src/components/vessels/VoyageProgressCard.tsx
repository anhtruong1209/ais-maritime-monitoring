"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePorts } from "@/hooks/use-ports";
import { formatDateTime } from "@/lib/format";
import { haversineDistanceKm } from "@/lib/geo";
import { useLocale } from "@/providers/locale-provider";
import type { Voyage } from "@/types";

/** Progress along the current in-progress voyage, computed from real port
 * coordinates and the vessel's own latest position (no mock numbers) —
 * shown only when both the departure/destination ports resolve and a
 * current position is available. */
export function VoyageProgressCard({
  voyage,
  currentPosition,
}: {
  voyage: Voyage;
  currentPosition: { latitude: number; longitude: number } | null;
}) {
  const { data: ports } = usePorts();
  const { t } = useLocale();

  const fromPort = ports?.find(
    (p) => p.name.toUpperCase() === voyage.departurePort.toUpperCase()
  );
  const toPort = ports?.find(
    (p) => p.name.toUpperCase() === voyage.destinationPort.toUpperCase()
  );

  if (!fromPort || !toPort || !currentPosition) return null;

  const totalKm = haversineDistanceKm(fromPort, toPort);
  const remainingKm = haversineDistanceKm(currentPosition, toPort);
  const percent =
    totalKm > 0 ? Math.min(100, Math.max(0, Math.round(((totalKm - remainingKm) / totalKm) * 100))) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          {voyage.departurePort} → {voyage.destinationPort}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("Progress")}</span>
            <span className="tabular-nums">{percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{t("Remaining distance")}</p>
            <p className="text-sm font-medium tabular-nums">{remainingKm.toFixed(1)} km</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ETA</p>
            <p className="text-sm font-medium tabular-nums">
              {formatDateTime(voyage.estimatedArrival)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
