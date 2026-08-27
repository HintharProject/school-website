import { NextResponse, type NextRequest } from "next/server";

function applySecurityHeaders(res: NextResponse) {
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname === "/admin/login" || pathname === "/admin/update-password";
  const isApiAdminRoute = pathname.startsWith("/api/admin");

  // Check for Better Auth session cookie
  const sessionCookie =
    request.cookies.get("hinthar.session_token")?.value ||
    request.cookies.get("__Secure-hinthar.session_token")?.value ||
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value ||
    request.cookies.get("session_token")?.value ||
    request.cookies.get("__Secure-session_token")?.value;

  const isAuthenticated = Boolean(sessionCookie && sessionCookie.length > 5);

  const response = NextResponse.next({ request });

  // Protect /api/admin/* endpoints
  if (isApiAdminRoute && !isAuthenticated) {
    // Exclude bootstrap endpoint so administrative initialization can proceed with token
    if (pathname === "/api/admin/bootstrap") {
      return applySecurityHeaders(NextResponse.next());
    }

    // Protect all other /api/admin/* endpoints
    return applySecurityHeaders(
      NextResponse.json({ error: "Unauthorized: Administrative session required" }, { status: 401 })
    );
  }

  // Protect /admin/* routes (redirect unauthenticated users to /admin/login)
  if (isAdminRoute && !isAuthRoute && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    const safeRedirect = pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/admin";
    loginUrl.searchParams.set("redirect", safeRedirect);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // If already authenticated and hitting login, redirect to admin dashboard
  if (pathname === "/admin/login" && isAuthenticated) {
    // If there is an invite token in query, allow user to stay on login / accept invite
    const hasInvite = request.nextUrl.searchParams.has("inviteToken");
    if (!hasInvite) {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = "/admin";
      adminUrl.search = "";
      return applySecurityHeaders(NextResponse.redirect(adminUrl));
    }
  }

  return applySecurityHeaders(response);
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
    "/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
