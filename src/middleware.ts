import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, SESSION_COOKIE } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSessionFromRequest(req);

  const isLogin = pathname === "/login";
  const isAdmin = pathname.startsWith("/admin");
  const isAttendance = pathname === "/attendance" || pathname === "/";

  if (!session && (isAdmin || pathname === "/attendance")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session && isLogin) {
    const dest = session.role === "admin" ? "/admin" : "/attendance";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  if (session && isAdmin && session.role !== "admin") {
    return NextResponse.redirect(new URL("/attendance", req.url));
  }

  if (session && pathname === "/") {
    const dest = session.role === "admin" ? "/admin" : "/attendance";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  if (!session && pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Touch cookie presence for edge; unused var keep for future refresh
  void SESSION_COOKIE;
  void isAttendance;

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/attendance", "/admin/:path*"],
};
