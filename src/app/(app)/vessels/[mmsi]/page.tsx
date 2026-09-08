import { notFound } from "next/navigation";
import { ShipTypeBadge } from "@/components/vessels/ShipTypeBadge";
import { VesselStatusBadge } from "@/components/vessels/VesselStatusBadge";
import { VesselInfoCard } from "@/components/vessels/VesselInfoCard";
import { CurrentAisCard } from "@/components/vessels/CurrentAisCard";
import { VesselVoyagesCard } from "@/components/vessels/VesselVoyagesCard";
import { VesselTrajectoryMap } from "@/components/vessels/VesselTrajectoryMap";
import { RecentAisMessagesTable } from "@/components/vessels/RecentAisMessagesTable";
import { getVesselByMmsi, getVesselPositions } from "@/lib/data/vessels";
import { getVesselVoyages } from "@/lib/data/voyages";
import { deriveVesselStatus } from "@/lib/vessel-status";

interface PageProps {
  params: Promise<{ mmsi: string }>;
}

export default async function VesselDetailPage({ params }: PageProps) {
  const { mmsi } = await params;
  const vessel = await getVesselByMmsi(mmsi);
  if (!vessel) notFound();

  const [positions, voyages] = await Promise.all([
    getVesselPositions(vessel.id, 24),
    getVesselVoyages(vessel.id),
  ]);

  const latest = positions.at(-1) ?? null;
  const latestSummary = latest
    ? {
        timestamp: latest.timestamp,
        latitude: latest.latitude,
        longitude: latest.longitude,
        sog: latest.sog,
        cog: latest.cog,
        heading: latest.heading,
        navStatus: latest.navStatus,
        destination: latest.destination,
      }
    : null;

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold">{vessel.name}</h1>
        <ShipTypeBadge shipType={vessel.shipType} />
        <VesselStatusBadge status={deriveVesselStatus(latestSummary)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <VesselInfoCard vessel={vessel} />
          <CurrentAisCard position={latest} />
          <VesselVoyagesCard voyages={voyages} />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="h-96 overflow-hidden rounded-md border border-border">
            <VesselTrajectoryMap vessel={vessel} initialPositions={positions} />
          </div>
          <div>
            <h2 className="mb-2 text-sm font-medium">Recent AIS Messages</h2>
            <RecentAisMessagesTable positions={positions} />
          </div>
        </div>
      </div>
    </div>
  );
}
