import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/auth/callback",
];

const protectedRoutes: string[] = [];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => matchesRoute(pathname, route))) {
    return NextResponse.next();
  }

  const isProtected = protectedRoutes.some((route) => matchesRoute(pathname, route));
  if (!isProtected) {
    return NextResponse.next();
  }

  if (matchesRoute(pathname, "/admin")) {
    const accessToken = request.cookies.get("sb-access-token")?.value;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!accessToken || !supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: userData } = await supabase.auth.getUser(accessToken);
    const userId = userData.user?.id;

    if (!userId) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const { data: profile } = await (supabase.from("profiles") as any)
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
