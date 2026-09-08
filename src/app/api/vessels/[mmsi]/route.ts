import { NextRequest, NextResponse } from "next/server";
import { getVesselByMmsi } from "@/lib/data/vessels";
import { mmsiParamSchema } from "@/lib/validation/vessel";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ mmsi: string }> }
) {
  const { mmsi } = await params;
  const parsed = mmsiParamSchema.safeParse(mmsi);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid MMSI" }, { status: 400 });
  }

  try {
    const vessel = await getVesselByMmsi(parsed.data);
    if (!vessel) {
      return NextResponse.json({ error: "Vessel not found" }, { status: 404 });
    }
    return NextResponse.json(vessel);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
