import { NextResponse } from "next/server";
import { getFleets } from "@/lib/data/fleets";

export async function GET() {
  try {
    const fleets = await getFleets();
    return NextResponse.json({ data: fleets });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
