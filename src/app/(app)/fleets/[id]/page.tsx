import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VesselTable } from "@/components/vessels/VesselTable";
import { MapCanvas } from "@/components/map/MapCanvas";
import { getFleetById, getFleetVessels } from "@/lib/data/fleets";
import { getPorts } from "@/lib/data/ports";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FleetDetailPage({ params }: PageProps) {
  const { id } = await params;
  const fleet = await getFleetById(id);
  if (!fleet) notFound();

  const [vessels, ports] = await Promise.all([getFleetVessels(id), getPorts()]);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-lg font-semibold">{fleet.name}</h1>
        {fleet.description && (
          <p className="text-sm text-muted-foreground">{fleet.description}</p>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Fleet Position — {vessels.length} vessels</CardTitle>
        </CardHeader>
        <CardContent className="h-96 p-0">
          <MapCanvas vessels={vessels} ports={ports} cluster={vessels.length > 50} />
        </CardContent>
      </Card>

      <VesselTable vessels={vessels} />
    </div>
  );
}
