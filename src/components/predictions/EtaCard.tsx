import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatPercent } from "@/lib/format";
import type { EtaPredictionResult } from "@/types";

/** Reusable ETA display. Accepts real AI results once the FastAPI service
 * exists — the `isMock` flag is what decides whether the demo badge shows. */
export function EtaCard({ eta }: { eta: EtaPredictionResult }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">ETA Prediction</CardTitle>
        {eta.isMock && (
          <Badge variant="outline" className="border-amber-500/40 text-amber-400">
            DEMO / MOCK AI PREDICTION
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">Destination</p>
          <p className="text-sm font-medium">{eta.destinationPort}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">ETA</p>
          <p className="text-xl font-semibold tabular-nums">{formatDateTime(eta.predictedEta)}</p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="text-sm font-medium tabular-nums">{formatPercent(eta.confidence)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Error Margin</p>
            <p className="text-sm font-medium tabular-nums">± {eta.errorMarginMinutes} min</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
