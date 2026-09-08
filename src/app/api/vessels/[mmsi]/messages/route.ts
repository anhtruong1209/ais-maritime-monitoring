import { NextRequest, NextResponse } from "next/server";
import { getVesselByMmsi, getVesselMessages } from "@/lib/data/vessels";
import { messagesQuerySchema, mmsiParamSchema } from "@/lib/validation/vessel";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mmsi: string }> }
) {
  const { mmsi } = await params;
  const mmsiResult = mmsiParamSchema.safeParse(mmsi);
  if (!mmsiResult.success) {
    return NextResponse.json({ error: "Invalid MMSI" }, { status: 400 });
  }

  const queryResult = messagesQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  if (!queryResult.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: queryResult.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const vessel = await getVesselByMmsi(mmsiResult.data);
    if (!vessel) {
      return NextResponse.json({ error: "Vessel not found" }, { status: 404 });
    }
    const result = await getVesselMessages(vessel.id, queryResult.data.page, queryResult.data.pageSize);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
