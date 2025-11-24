import { User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/contacts"];

export async function protectRoutes(request: NextRequest, user: User | null) {
  const pathname = request.nextUrl.pathname;

  // Not logged in
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged in
  if (
    (pathname.startsWith("/login") || pathname.startsWith("/signup")) &&
    user
  ) {
    return NextResponse.redirect(new URL("/contacts", request.url));
  }

  return null;
}
