/**
 * Local development mode for the frontend.
 *
 * When the Supabase environment variables are unavailable (for example when
 * running `npm run dev` locally without a `.env.local`), this module returns
 * a no-op Supabase client so that every page still loads. Authentication and
 * cloud progress sync simply become no-ops; local progress continues to work
 * through localStorage.
 *
 * Production behavior is completely unchanged: when the variables ARE present
 * this module is a transparent no-op and the real Supabase clients are used.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export const DEV_MODE =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let _warned = false;

export function isSupabaseConfigured(): boolean {
  return !DEV_MODE;
}

export function warnSupabaseDisabled(): void {
  if (DEV_MODE && !_warned) {
    _warned = true;
    console.warn(
      "[QuantumLearn] Supabase is disabled in local development mode. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to enable " +
        "authentication and cloud progress sync."
    );
  }
}

/**
 * No-op Supabase client used only in local development mode.
 *
 * Every call resolves to an empty result (`data: null, error: null`) so auth
 * pages and progress sync never throw. Auth actions (login, signup, logout)
 * simply do nothing. Auth queries return `user: null`, which all existing
 * callers already handle by falling back to defaults or redirecting.
 */
export function createDevClient(): SupabaseClient {
  const empty = { data: null, error: null };
  const userNull = { data: { user: null }, error: null };

  // Query builder: every method returns the builder itself (chainable) and
  // the builder is thenable, resolving to an empty result.
  const builderTarget = {} as object;
  Object.defineProperty(builderTarget, "then", {
    value: (resolve: (value: unknown) => unknown) => resolve(empty),
  });
  const proxyBuilder = new Proxy(builderTarget, {
    get(_target, prop) {
      // Let `then` through so the builder is awaitable.
      if (prop === "then") return Reflect.get(_target, prop);
      return () => proxyBuilder;
    },
  });

  // Auth namespace: every method resolves to "no user".
  const authTarget = {} as object;
  Object.defineProperty(authTarget, "then", {
    value: (resolve: (value: unknown) => unknown) => resolve(userNull),
  });
  const proxyAuth = new Proxy(authTarget, {
    get() {
      return () => Promise.resolve(userNull);
    },
  });

  const clientTarget = {} as object;
  return new Proxy(clientTarget, {
    get(_target, prop) {
      if (prop === "auth") return proxyAuth;
      if (prop === "from") return () => proxyBuilder;
      return () => proxyBuilder;
    },
  }) as unknown as SupabaseClient;
}