import { VesselDetailContent } from "@/components/vessels/VesselDetailContent";

interface PageProps {
  params: Promise<{ mmsi: string }>;
}

// Kept as a plain shareable/bookmarkable URL. In-app interactions (tables,
// map popups, fleet rosters) open the same content in VesselDetailDialog
// instead of navigating here — see VesselDetailProvider.
export default async function VesselDetailPage({ params }: PageProps) {
  const { mmsi } = await params;
  return <VesselDetailContent mmsi={mmsi} />;
}
