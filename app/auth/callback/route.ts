import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/admin";
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If user is accepting an invite or recovering password, direct to password setup
      if (type === "invite" || type === "recovery") {
        return NextResponse.redirect(`${origin}/admin/update-password`);
      }

      // Sanitize redirect URL
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    console.error("Auth callback error:", error.message);
  }

  // Return to login with error indicator if code exchange fails
  return NextResponse.redirect(`${origin}/admin/login?error=auth_callback_failed`);
}
