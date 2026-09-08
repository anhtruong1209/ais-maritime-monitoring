import Link from "next/link";
import { Marker, Popup } from "react-leaflet";
import { SeverityBadge } from "@/components/alerts/SeverityBadge";
import { ANOMALY_TYPE_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import { createAnomalyIcon } from "@/lib/map/icons";
import type { AnomalyWithVessel } from "@/types";

/**
 * Draws open anomalies (route deviation, abnormal speed, etc.) directly on
 * the map as warning markers — so "the vessel is off its usual route" is
 * something you see, not just a row in a table.
 */
export function AnomalyMarkerLayer({ anomalies }: { anomalies: AnomalyWithVessel[] }) {
  return (
    <>
      {anomalies.map((anomaly) => (
        <Marker
          key={anomaly.id}
          position={[anomaly.latitude, anomaly.longitude]}
          icon={createAnomalyIcon()}
          zIndexOffset={500}
        >
          <Popup>
            <div className="min-w-44 space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold">
                  {ANOMALY_TYPE_LABELS[anomaly.type]}
                </span>
                <SeverityBadge severity={anomaly.severity} />
              </div>
              <p className="text-muted-foreground">{anomaly.description}</p>
              <p className="text-xs text-muted-foreground">
                Detected {formatRelativeTime(anomaly.detectedAt)}
              </p>
              <Link
                href={`/vessels/${anomaly.vesselMmsi}`}
                className="inline-block pt-1 font-medium text-primary underline-offset-2 hover:underline"
              >
                {anomaly.vesselName} — Chi tiết →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
