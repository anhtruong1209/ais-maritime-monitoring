import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapPort } from "@/lib/supabase/mappers";
import type { PortRow } from "@/lib/supabase/database.types";
import type { Port } from "@/types";

export async function getPorts(): Promise<Port[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("ports").select("*").order("name");

  if (error) throw new Error(`Failed to load ports: ${error.message}`);
  return ((data ?? []) as PortRow[]).map(mapPort);
}
