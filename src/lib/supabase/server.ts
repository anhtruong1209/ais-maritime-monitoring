import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./env";

// Server-side client for Route Handlers and Server Components. Still uses
// the public anon key (never the service role key) — access control is
// enforced by Postgres Row Level Security, not by which key is used.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component with no writable cookie jar
          // (e.g. during static rendering). Safe to ignore for read-only
          // requests — auth session refresh only matters in Route Handlers.
        }
      },
    },
  });
}
