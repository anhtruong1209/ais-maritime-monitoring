import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoyageStatusBadge } from "@/components/voyages/VoyageStatusBadge";
import { MapCanvas } from "@/components/map/MapCanvas";
import { T } from "@/components/shared/T";
import { getVoyageById } from "@/lib/data/voyages";
import { getVesselByMmsi, getVesselPositionsInRange } from "@/lib/data/vessels";
import { deriveVesselStatus } from "@/lib/vessel-status";
import { formatDateTime, formatDuration } from "@/lib/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">
        <T>{label}</T>
      </dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function VoyageDetailPage({ params }: PageProps) {
  const { id } = await params;
  const voyage = await getVoyageById(id);
  if (!voyage) notFound();

  const vessel = await getVesselByMmsi(voyage.vesselMmsi);
  const positions = vessel
    ? await getVesselPositionsInRange(
        vessel.id,
        voyage.departureTime,
        voyage.actualArrival ?? new Date().toISOString()
      )
    : [];

  const latest = positions.at(-1);
  const vesselForMap =
    vessel && latest
      ? {
          ...vessel,
          latestPosition: {
            timestamp: latest.timestamp,
            latitude: latest.latitude,
            longitude: latest.longitude,
            sog: latest.sog,
            cog: latest.cog,
            heading: latest.heading,
            navStatus: latest.navStatus,
            destination: latest.destination,
          },
          status: deriveVesselStatus(latest ?? null),
        }
      : null;

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold">
          {voyage.departurePort} → {voyage.destinationPort}
        </h1>
        <VoyageStatusBadge status={voyage.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              <T>Voyage Details</T>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-y-3">
              <Field label="Vessel" value={voyage.vesselName} />
              <Field label="MMSI" value={voyage.vesselMmsi} />
              <Field label="Departure" value={voyage.departurePort} />
              <Field label="Destination" value={voyage.destinationPort} />
              <Field label="Start Time" value={formatDateTime(voyage.departureTime)} />
              <Field label="ETA" value={formatDateTime(voyage.estimatedArrival)} />
              <Field label="Actual Arrival" value={formatDateTime(voyage.actualArrival)} />
              <Field
                label="Duration"
                value={formatDuration(voyage.departureTime, voyage.actualArrival ?? null)}
              />
            </dl>
          </CardContent>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              <T>Voyage Trajectory</T>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-96 p-0">
            <MapCanvas
              vessels={vesselForMap ? [vesselForMap] : []}
              historicalTrack={positions}
              center={latest ? [latest.latitude, latest.longitude] : undefined}
              zoom={7}
              cluster={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
