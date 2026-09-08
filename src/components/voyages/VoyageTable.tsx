"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VoyageStatusBadge } from "./VoyageStatusBadge";
import { formatDateTime } from "@/lib/format";
import { useLocale } from "@/providers/locale-provider";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";
import type { VoyageWithVessel } from "@/types";

export function VoyageTable({ voyages }: { voyages: VoyageWithVessel[] }) {
  const { openVessel } = useVesselDetailDialog();
  const { t } = useLocale();

  if (voyages.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        {t("No voyages match the current filters.")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("Vessel")}</TableHead>
            <TableHead>{t("Departure")}</TableHead>
            <TableHead>{t("Destination")}</TableHead>
            <TableHead>{t("Departed")}</TableHead>
            <TableHead>{t("ETA")}</TableHead>
            <TableHead>{t("Arrived")}</TableHead>
            <TableHead>{t("Status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {voyages.map((voyage) => (
            <TableRow key={voyage.id}>
              <TableCell
                className="cursor-pointer font-medium hover:underline"
                onClick={() => openVessel(voyage.vesselMmsi)}
              >
                {voyage.vesselName}
              </TableCell>
              <TableCell>{voyage.departurePort}</TableCell>
              <TableCell>
                <Link href={`/voyages/${voyage.id}`} className="hover:underline">
                  {voyage.destinationPort}
                </Link>
              </TableCell>
              <TableCell className="text-xs">{formatDateTime(voyage.departureTime)}</TableCell>
              <TableCell className="text-xs">{formatDateTime(voyage.estimatedArrival)}</TableCell>
              <TableCell className="text-xs">{formatDateTime(voyage.actualArrival)}</TableCell>
              <TableCell>
                <VoyageStatusBadge status={voyage.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
