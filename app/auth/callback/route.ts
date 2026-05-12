import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
    name?: string;
  } | null;
};

import { createUsernamePlaceholder } from "../../../lib/profile-provisioning";

async function ensureProfileRow(user: AuthUser) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server credentials for profile provisioning.");
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const fullName = user.user_metadata?.full_name?.trim() || user.user_metadata?.name?.trim() || user.email?.split("@")[0] || "";

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { error } = await (adminClient.from("profiles") as any).upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name: fullName,
        username: (user.user_metadata as any)?.username || createUsernamePlaceholder(user.id),
        role: (user.user_metadata as any)?.role || "member",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (!error) return;
    lastError = error;
    await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }

  throw lastError;
}

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

  try {
    await ensureProfileRow(data.session.user as AuthUser);
  } catch {
    const fallbackUrl = new URL("/onboarding", request.url);
    fallbackUrl.searchParams.set("setup", "retry");
    return NextResponse.redirect(fallbackUrl);
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
