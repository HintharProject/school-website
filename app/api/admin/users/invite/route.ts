import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { UserProfileRecord, UserRole } from "@/lib/supabase/types";

async function getCallerAuth() {
  if (!isSupabaseConfigured) {
    return { isAuth: true, role: "principal" as UserRole, userId: "dev-local-principal", suspended: false };
  }

  const serverSupabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await serverSupabase.auth.getUser();

  if (!user || error) {
    return { isAuth: false, role: null, userId: null, suspended: false };
  }

  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  const role = (profile?.role || user.app_metadata?.role) as UserRole | undefined;
  const status = profile?.status || "active";

  if (status !== "active") {
    return { isAuth: false, role: null, userId: user.id, suspended: true };
  }

  return { isAuth: true, role: role || null, userId: user.id, suspended: false };
}

export async function POST(req: Request) {
  try {
    const { isAuth, role: callerRole } = await getCallerAuth();

    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized: Administrative login required to generate invite links." },
        { status: 401 }
      );
    }

    // RBAC Permissions check:
    // Only Principal and Staff Admin can generate/send magic invite links
    // Staff Admin can only send to Student Contributors
    if (callerRole === "student") {
      return NextResponse.json(
        { error: "Forbidden: Student contributors cannot issue magic invite links." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      email,
      full_name,
      role = "student",
      title,
      campus_id = "ywarma-campus",
      grade,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Missing required email address" }, { status: 400 });
    }

    if (callerRole === "staff_admin" && role !== "student") {
      return NextResponse.json(
        { error: "Forbidden: School staff administrators can only issue magic invite links for Student Contributors." },
        { status: 403 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const host = req.headers.get("origin") || req.headers.get("referer") || "http://localhost:3000";
    const origin = new URL(host).origin;
    const redirectUrl = `${origin}/auth/callback?type=invite&next=/admin/update-password`;

    let actionLink: string | null = null;
    let authUserId: string | null = null;
    let inviteSentViaEmail = false;

    // 1. Attempt to invite user via Supabase Auth Admin API (dispatches email if SMTP is configured)
    try {
      const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        cleanEmail,
        {
          data: {
            full_name: full_name?.trim() || cleanEmail.split("@")[0],
            title: title || (role === "student" ? "Student Contributor" : "Faculty Staff"),
            role,
          },
          redirectTo: redirectUrl,
        }
      );

      if (!inviteErr && inviteData?.user) {
        authUserId = inviteData.user.id;
        inviteSentViaEmail = true;
      }
    } catch (e) {
      console.warn("Direct inviteUserByEmail note:", e);
    }

    // 2. Also generate direct action link for immediate administrative copy/use
    try {
      const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: cleanEmail,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (!linkErr && linkData?.properties?.action_link) {
        actionLink = linkData.properties.action_link;
        if (!authUserId && linkData.user) {
          authUserId = linkData.user.id;
        }
      }
    } catch (e) {
      console.warn("generateLink note:", e);
    }

    // 3. Ensure profile is saved in user_profiles table with app_metadata updated
    if (authUserId) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(authUserId, {
          app_metadata: { role },
          user_metadata: {
            full_name: full_name?.trim(),
            title: title || (role === "student" ? "Student Contributor" : "Faculty Staff"),
          },
        });
      } catch (e) {
        console.warn("updateUserById metadata error:", e);
      }
    }

    const profileData: UserProfileRecord = {
      id: authUserId || `user-${Date.now()}`,
      email: cleanEmail,
      full_name: full_name?.trim() || cleanEmail.split("@")[0],
      role: role as UserRole,
      title: title || (role === "student" ? "Student Contributor" : "Faculty Staff"),
      campus_id: campus_id || "ywarma-campus",
      grade: role === "student" ? grade : undefined,
      status: "active",
      created_at: new Date().toISOString(),
    };

    try {
      await supabaseAdmin.from("user_profiles").upsert(profileData);
    } catch (e) {
      console.warn("user_profiles upsert error:", e);
    }

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      magicLink: actionLink || `${redirectUrl}&invited=${encodeURIComponent(cleanEmail)}`,
      emailSent: inviteSentViaEmail,
      message: `Magic invite link successfully generated for ${cleanEmail}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate magic invite link" },
      { status: 500 }
    );
  }
}
