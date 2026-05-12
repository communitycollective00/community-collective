import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  if (!code) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", safeNext);
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", safeNext);
    loginUrl.searchParams.set("error", "auth_callback_failed");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("cc-auth");
    return response;
  }

  const response = NextResponse.redirect(new URL(safeNext, request.url));

  response.cookies.set("cc-auth", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });

  response.cookies.set("sb-access-token", data.session.access_token, {
    path: "/",
    maxAge: data.session.expires_in,
    sameSite: "lax",
  });

  response.cookies.set("sb-refresh-token", data.session.refresh_token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  return response;
}
