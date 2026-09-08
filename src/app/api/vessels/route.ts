import { NextRequest, NextResponse } from "next/server";
import { getVessels } from "@/lib/data/vessels";
import { vesselListQuerySchema } from "@/lib/validation/vessel";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = vesselListQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await getVessels(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
