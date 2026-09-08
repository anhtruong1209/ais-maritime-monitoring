import { NextRequest, NextResponse } from "next/server";
import { getAnomalies } from "@/lib/data/anomalies";
import { anomalyListQuerySchema } from "@/lib/validation/anomaly";

export async function GET(request: NextRequest) {
  const parsed = anomalyListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await getAnomalies(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
