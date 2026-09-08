"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShipTypeBadge } from "./ShipTypeBadge";
import { VesselStatusBadge } from "./VesselStatusBadge";
import { formatCog, formatRelativeTime, formatSog } from "@/lib/format";
import { useLocale } from "@/providers/locale-provider";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";
import type { VesselWithLatestPosition } from "@/types";

export function VesselTable({ vessels }: { vessels: VesselWithLatestPosition[] }) {
  const { openVessel } = useVesselDetailDialog();
  const { t } = useLocale();

  if (vessels.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        {t("No vessels match the current filters.")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("Name")}</TableHead>
            <TableHead>MMSI</TableHead>
            <TableHead>IMO</TableHead>
            <TableHead>{t("Type")}</TableHead>
            <TableHead className="text-right">{t("SOG")}</TableHead>
            <TableHead className="text-right">{t("COG")}</TableHead>
            <TableHead>{t("Destination")}</TableHead>
            <TableHead>{t("Status")}</TableHead>
            <TableHead>{t("Last Update")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vessels.map((vessel) => (
            <TableRow
              key={vessel.id}
              className="cursor-pointer"
              onClick={() => openVessel(vessel.mmsi)}
            >
              <TableCell className="font-medium hover:underline">{vessel.name}</TableCell>
              <TableCell className="font-mono text-xs">{vessel.mmsi}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {vessel.imo ?? "—"}
              </TableCell>
              <TableCell>
                <ShipTypeBadge shipType={vessel.shipType} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {vessel.latestPosition ? formatSog(vessel.latestPosition.sog) : "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {vessel.latestPosition ? formatCog(vessel.latestPosition.cog) : "—"}
              </TableCell>
              <TableCell className="max-w-40 truncate">
                {vessel.latestPosition?.destination ?? "—"}
              </TableCell>
              <TableCell>
                <VesselStatusBadge status={vessel.status} />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {vessel.latestPosition ? formatRelativeTime(vessel.latestPosition.timestamp) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
