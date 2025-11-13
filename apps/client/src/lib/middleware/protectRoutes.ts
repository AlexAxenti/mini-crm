import { User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function protectRoutes(request: NextRequest, user: User | null) {
  const pathname = request.nextUrl.pathname;

  // Protect dashboard routes - redirect to login if not authenticated
  if (pathname.startsWith("/contacts") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to contacts if accessing auth pages while logged in
  if (
    (pathname.startsWith("/login") || pathname.startsWith("/signup")) &&
    user
  ) {
    return NextResponse.redirect(new URL("/contacts", request.url));
  }

  return null; // No redirect needed
}
