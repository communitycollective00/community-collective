import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/profile"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!protectedRoutes.some((route) => pathname.startsWith(route))) {
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
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
