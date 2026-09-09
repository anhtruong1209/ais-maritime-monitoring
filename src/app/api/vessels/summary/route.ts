import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/data/dashboard";

// Lightweight fleet counts (a handful of numbers) for widgets that only
// need "how many moving/offline/etc" — e.g. the global StatusBar footer,
// shown on every page. Deliberately separate from GET /api/vessels: that
// route returns full vessel rows (position, particulars, ...) sized for
// the map/table, which is wasteful to fetch (and keep in the client cache)
// just to render four counts.
export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
