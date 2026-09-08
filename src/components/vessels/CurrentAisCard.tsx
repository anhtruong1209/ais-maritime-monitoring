import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCog, formatCoordinate, formatDateTime, formatSog } from "@/lib/format";
import type { AISPosition } from "@/types";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export function CurrentAisCard({ position }: { position: AISPosition | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Current AIS Data</CardTitle>
      </CardHeader>
      <CardContent>
        {!position ? (
          <p className="text-sm text-muted-foreground">No AIS data available.</p>
        ) : (
          <dl className="grid grid-cols-2 gap-y-3">
            <Field label="Latitude" value={formatCoordinate(position.latitude, "lat")} />
            <Field label="Longitude" value={formatCoordinate(position.longitude, "lon")} />
            <Field label="SOG" value={formatSog(position.sog)} />
            <Field label="COG" value={formatCog(position.cog)} />
            <Field
              label="Heading"
              value={position.heading != null ? `${position.heading.toFixed(0)}°` : "—"}
            />
            <Field label="Nav Status" value={position.navStatus ?? "—"} />
            <Field label="Destination" value={position.destination ?? "—"} />
            <Field label="Timestamp" value={formatDateTime(position.timestamp)} />
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
