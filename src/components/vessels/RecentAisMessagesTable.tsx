import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCog, formatDateTime, formatSog } from "@/lib/format";
import type { AISPosition } from "@/types";

/** Presentational — expects `positions` already in the order/page to display. */
export function RecentAisMessagesTable({ positions }: { positions: AISPosition[] }) {
  if (positions.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent AIS messages.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Lat</TableHead>
            <TableHead>Lon</TableHead>
            <TableHead>SOG</TableHead>
            <TableHead>COG</TableHead>
            <TableHead>Nav Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((position) => (
            <TableRow key={position.id}>
              <TableCell className="text-xs">{formatDateTime(position.timestamp)}</TableCell>
              <TableCell className="tabular-nums">{position.latitude.toFixed(4)}</TableCell>
              <TableCell className="tabular-nums">{position.longitude.toFixed(4)}</TableCell>
              <TableCell className="tabular-nums">{formatSog(position.sog)}</TableCell>
              <TableCell className="tabular-nums">{formatCog(position.cog)}</TableCell>
              <TableCell className="text-xs">{position.navStatus ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
