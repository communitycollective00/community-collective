import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const publicRoutes = [
  "/",
  "/get-access",
  "/voices",
  "/opportunities",
  "/directory",
  "/pathways",
  "/login",
  "/signup",
];

const protectedRoutes = ["/dashboard", "/profile", "/onboarding", "/admin"];

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

  const isAuthed = request.cookies.get("cc-auth")?.value === "1";
  if (!isAuthed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
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
      .select("role,is_approved")
      .eq("id", userId)
      .maybeSingle();

    if (!profile || profile.role !== "admin" || profile.is_approved !== true) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
