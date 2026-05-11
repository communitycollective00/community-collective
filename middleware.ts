import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

const protectedRoutes = ["/dashboard", "/profile", "/admin/submissions"];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function middleware(request: NextRequest) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
