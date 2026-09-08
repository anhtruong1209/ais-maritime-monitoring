"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

// Browser client. Uses only the public anon key — safe to expose, and
// scoped by Row Level Security policies defined in the SQL migrations.
export function createClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
