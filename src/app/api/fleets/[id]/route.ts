import { NextResponse } from "next/server";
import { getFleetById, getFleetVessels } from "@/lib/data/fleets";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const fleet = await getFleetById(id);
    if (!fleet) {
      return NextResponse.json({ error: "Fleet not found" }, { status: 404 });
    }
    const vessels = await getFleetVessels(id);
    return NextResponse.json({ fleet, vessels });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
