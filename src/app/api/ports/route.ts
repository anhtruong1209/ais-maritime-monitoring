import { NextResponse } from "next/server";
import { getPorts } from "@/lib/data/ports";

export async function GET() {
  try {
    const ports = await getPorts();
    return NextResponse.json({ data: ports });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
