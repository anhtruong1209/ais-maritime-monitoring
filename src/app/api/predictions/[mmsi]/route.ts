import { NextRequest, NextResponse } from "next/server";
import { getPredictionService } from "@/lib/ai";
import { getVesselByMmsi, getVesselPositions } from "@/lib/data/vessels";
import { getPorts } from "@/lib/data/ports";
import { haversineDistanceKm } from "@/lib/geo";
import { mmsiParamSchema } from "@/lib/validation/vessel";
import type { Port } from "@/types";

const HORIZON_MINUTES = 180;

function resolveDestinationPort(
  ports: Port[],
  destinationName: string | null,
  from: { latitude: number; longitude: number }
): Port {
  const byName = destinationName
    ? ports.find((p) => p.name.toUpperCase() === destinationName.toUpperCase())
    : undefined;
  if (byName) return byName;

  // Demo fallback: if the reported destination isn't one of our seeded
  // Vietnamese ports (e.g. a foreign port name), approximate with the
  // nearest known port so the ETA card still has something to show.
  return ports.reduce((closest, port) =>
    haversineDistanceKm(from, { latitude: port.latitude, longitude: port.longitude }) <
    haversineDistanceKm(from, { latitude: closest.latitude, longitude: closest.longitude })
      ? port
      : closest
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mmsi: string }> }
) {
  const { mmsi } = await params;
  const parsed = mmsiParamSchema.safeParse(mmsi);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid MMSI" }, { status: 400 });
  }
  // Optional: caller picks an arbitrary destination port to get an ETA
  // for ("if it were headed to X, when would it arrive") instead of the
  // vessel's own AIS-reported destination.
  const portId = request.nextUrl.searchParams.get("portId");

  try {
    const vessel = await getVesselByMmsi(parsed.data);
    if (!vessel) {
      return NextResponse.json({ error: "Vessel not found" }, { status: 404 });
    }

    const recentPositions = await getVesselPositions(vessel.id, 24);
    if (recentPositions.length === 0) {
      return NextResponse.json(
        { error: "No AIS positions available for this vessel" },
        { status: 404 }
      );
    }

    const ports = await getPorts();
    const latest = recentPositions[recentPositions.length - 1];
    const destinationPort =
      ports.find((p) => p.id === portId) ?? resolveDestinationPort(ports, latest.destination, latest);

    const service = getPredictionService();
    const [trajectory, eta] = await Promise.all([
      service.predictTrajectory({
        vesselId: vessel.id,
        recentPositions,
        horizonMinutes: HORIZON_MINUTES,
      }),
      service.predictEta({
        vesselId: vessel.id,
        recentPositions,
        destinationPort: destinationPort.name,
        destinationLatitude: destinationPort.latitude,
        destinationLongitude: destinationPort.longitude,
      }),
    ]);

    return NextResponse.json({ trajectory, eta });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
