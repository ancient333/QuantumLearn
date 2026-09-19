import { createBrowserClient } from "@supabase/ssr";

import {
  createDevClient,
  isSupabaseConfigured,
  warnSupabaseDisabled,
} from "@/lib/supabase/dev-mode";

export function createClient() {
  if (!isSupabaseConfigured()) {
    warnSupabaseDisabled();
    return createDevClient();
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}