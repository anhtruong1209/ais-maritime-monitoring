import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatPercent } from "@/lib/format";
import type { TrajectoryPredictionResult } from "@/types";

/** Reusable trajectory-prediction summary. Same contract regardless of
 * whether the data came from MockPredictionService or the real FastAPI
 * service — only the `isMock` flag changes what's shown. */
export function PredictionPanel({ trajectory }: { trajectory: TrajectoryPredictionResult }) {
  const finalPoint = trajectory.points.at(-1);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Trajectory Prediction</CardTitle>
        {trajectory.isMock && (
          <Badge variant="outline" className="border-amber-500/40 text-amber-400">
            DEMO / MOCK AI PREDICTION
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Horizon</p>
            <p className="text-sm font-medium tabular-nums">{trajectory.horizonMinutes} min</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Predicted Points</p>
            <p className="text-sm font-medium tabular-nums">{trajectory.points.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Final Confidence</p>
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
                  <th className="px-2 py-1 text-left">Time</th>
                  <th className="px-2 py-1 text-left">Lat</th>
                  <th className="px-2 py-1 text-left">Lon</th>
                  <th className="px-2 py-1 text-left">Confidence</th>
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
      </CardContent>
    </Card>
  );
}
