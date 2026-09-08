"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SeverityBadge } from "./SeverityBadge";
import { AnomalyStatusBadge } from "./AnomalyStatusBadge";
import { ANOMALY_TYPE_LABELS } from "@/lib/constants";
import { formatCoordinate, formatDateTime } from "@/lib/format";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";
import type { AnomalyWithVessel } from "@/types";

export function AnomalyTable({ anomalies }: { anomalies: AnomalyWithVessel[] }) {
  const { openVessel } = useVesselDetailDialog();

  if (anomalies.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No anomalies match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vessel</TableHead>
            <TableHead>Detected</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {anomalies.map((anomaly) => (
            <TableRow key={anomaly.id}>
              <TableCell
                className="cursor-pointer font-medium hover:underline"
                onClick={() => openVessel(anomaly.vesselMmsi)}
              >
                {anomaly.vesselName}
              </TableCell>
              <TableCell className="text-xs">{formatDateTime(anomaly.detectedAt)}</TableCell>
              <TableCell>{ANOMALY_TYPE_LABELS[anomaly.type]}</TableCell>
              <TableCell>
                <SeverityBadge severity={anomaly.severity} />
              </TableCell>
              <TableCell className="text-right tabular-nums">{anomaly.score.toFixed(2)}</TableCell>
              <TableCell className="text-xs whitespace-nowrap">
                {formatCoordinate(anomaly.latitude, "lat")}, {formatCoordinate(anomaly.longitude, "lon")}
              </TableCell>
              <TableCell className="max-w-72 truncate text-xs" title={anomaly.description}>
                {anomaly.description}
              </TableCell>
              <TableCell>
                <AnomalyStatusBadge status={anomaly.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
