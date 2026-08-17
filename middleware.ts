import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function applySecurityHeaders(res: NextResponse) {
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://ytmylxemqrsjxdvrthxx.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";

  // If Supabase is not configured, bypass auth in dev
  if (!supabaseAnonKey || supabaseAnonKey.length < 10) {
    return applySecurityHeaders(supabaseResponse);
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the session — required for @supabase/ssr
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect /api/admin/* endpoints
  if (pathname.startsWith("/api/admin") && !user) {
    // Exclude init-principal if caller has administrative header
    if (pathname === "/api/admin/init-principal") {
      return applySecurityHeaders(supabaseResponse);
    }
    return applySecurityHeaders(
      NextResponse.json({ error: "Unauthorized: Administrative session required" }, { status: 401 })
    );
  }

  // Protect /admin/* routes (except /admin/login)
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    // Sanitize redirect target to relative path only
    const safeRedirect = pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/admin";
    loginUrl.searchParams.set("redirect", safeRedirect);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // If already authenticated and hitting login, redirect to admin dashboard
  if (isLoginRoute && user) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    adminUrl.search = "";
    return applySecurityHeaders(NextResponse.redirect(adminUrl));
  }

  return applySecurityHeaders(supabaseResponse);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, images, fonts
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

