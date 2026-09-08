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
import type { VoyageWithVessel } from "@/types";

export function VoyageTable({ voyages }: { voyages: VoyageWithVessel[] }) {
  if (voyages.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No voyages match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vessel</TableHead>
            <TableHead>Departure</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Departed</TableHead>
            <TableHead>ETA</TableHead>
            <TableHead>Arrived</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {voyages.map((voyage) => (
            <TableRow key={voyage.id}>
              <TableCell className="font-medium">
                <Link href={`/vessels/${voyage.vesselMmsi}`} className="hover:underline">
                  {voyage.vesselName}
                </Link>
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
