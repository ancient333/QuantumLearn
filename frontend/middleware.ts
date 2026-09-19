import { NextResponse, type NextRequest } from "next/server";

import {
  isSupabaseConfigured,
  warnSupabaseDisabled,
} from "@/lib/supabase/dev-mode";
import { createClient } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Local development bypass: without Supabase credentials there is no
  // session to check, so never block navigation. All pages load normally.
  if (!isSupabaseConfigured()) {
    warnSupabaseDisabled();
    return response;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/learn")) {
    const url = request.nextUrl.clone();

    url.pathname = "/login";
    url.searchParams.set(
      "redirectedFrom",
      request.nextUrl.pathname
    );

    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/learn/:path*"],
};