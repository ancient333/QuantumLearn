import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  createDevClient,
  isSupabaseConfigured,
  warnSupabaseDisabled,
} from "@/lib/supabase/dev-mode";

export async function createClient() {
  if (!isSupabaseConfigured()) {
    warnSupabaseDisabled();
    return createDevClient();
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component cannot always modify cookies.
          }
        },
      },
    }
  );
}