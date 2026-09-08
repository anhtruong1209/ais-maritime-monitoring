import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Vessel } from "@/types";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export function VesselInfoCard({ vessel }: { vessel: Vessel }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Vessel Information</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-y-3">
          <Field label="MMSI" value={vessel.mmsi} />
          <Field label="IMO" value={vessel.imo ?? "—"} />
          <Field label="Call Sign" value={vessel.callSign ?? "—"} />
          <Field label="Flag" value={vessel.flag} />
          <Field label="Length" value={vessel.length ? `${vessel.length} m` : "—"} />
          <Field label="Width" value={vessel.width ? `${vessel.width} m` : "—"} />
        </dl>
      </CardContent>
    </Card>
  );
}
