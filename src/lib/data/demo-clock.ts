import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

// This demo dataset isn't continuously re-seeded in real time, so any
// "how stale is this fix" check (offline status, "last N hours" windows)
// must NOT compare against the real wall clock — the moment real time
// drifts past the dataset's own last generated/shifted timestamp by more
// than OFFLINE_THRESHOLD_MINUTES, the entire fleet would silently read as
// offline and every history window would come back empty, regardless of
// how fresh the data actually looked relative to itself. Comparing
// against the freshest timestamp actually IN the dataset instead keeps
// "moving"/"offline" and "last Nh" windows correct indefinitely, with no
// periodic reseed/shift required.
let cached: { value: Date; fetchedAt: number } | null = null;
const CACHE_MS = 30_000;

export async function getDatasetNow(): Promise<Date> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_MS) {
    return cached.value;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ais_positions")
    .select("timestamp")
    .order("timestamp", { ascending: false })
    .limit(1)
    .maybeSingle();

  const value = !error && data?.timestamp ? new Date(data.timestamp) : new Date();
  cached = { value, fetchedAt: Date.now() };
  return value;
}
