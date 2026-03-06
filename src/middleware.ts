import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionId = request.cookies.get("session_id")?.value;

  // Public routes — no auth needed
  if (!pathname.startsWith("/zgloszenia") && !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // No cookie — redirect to login
  if (!sessionId) {
    const url = request.nextUrl.clone();
    url.pathname = "/logowanie";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const supabase = createAdminClient();
    const { data: sessionData } = await supabase
      .from("sessions")
      .select("id, user_id, expires_at, profiles(*)")
      .eq("id", sessionId)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!sessionData || !sessionData.profiles) {
      const url = request.nextUrl.clone();
      url.pathname = "/logowanie";
      url.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(url);
      response.cookies.set("session_id", "", { maxAge: 0, path: "/" });
      return response;
    }

    const profile = sessionData.profiles as unknown as Profile;

    // Admin routes — require admin role
    if (pathname.startsWith("/admin") && profile.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    // Fail closed: any error → redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/logowanie";
    url.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(url);
    response.cookies.set("session_id", "", { maxAge: 0, path: "/" });
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
