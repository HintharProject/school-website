import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("x-admin-init-secret");
    const configuredSecret = process.env.ADMIN_INIT_SECRET;

    // Verify caller is either an authenticated Principal or provided the server setup secret
    let isAuthorized = false;
    if (configuredSecret && authHeader && authHeader === configuredSecret) {
      isAuthorized = true;
    } else {
      const serverSupabase = await createSupabaseServerClient();
      const { data: { user } } = await serverSupabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabaseAdmin
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role === "principal") {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized: Master initialization requires valid principal credentials or administrative setup token." },
        { status: 401 }
      );
    }

    const principalEmail = process.env.PRINCIPAL_EMAIL || "kaungmyat.htut@gmail.com";
    const principalPassword = process.env.PRINCIPAL_INITIAL_PASSWORD || "Kmh132546$";

    // 1. Check if user exists in Supabase Auth
    const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      return NextResponse.json({ error: listErr.message }, { status: 500 });
    }

    let principalUser = users.find(
      (u) => u.email?.toLowerCase() === principalEmail.toLowerCase()
    );

    if (!principalUser) {
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: principalEmail,
        password: principalPassword,
        email_confirm: true,
        user_metadata: {
          full_name: "Dr. Kaung Myat Htut",
          title: "Principal & Founder",
        },
        app_metadata: {
          role: "principal",
        },
      });

      if (createErr) {
        return NextResponse.json({ error: createErr.message }, { status: 500 });
      }
      principalUser = newUser.user;
    }

    // 2. Ensure user_profiles row exists
    const { error: profileErr } = await supabaseAdmin
      .from("user_profiles")
      .upsert({
        id: principalUser.id,
        email: principalEmail,
        full_name: "Dr. Kaung Myat Htut",
        role: "principal",
        title: "Principal & Founder",
        campus_id: "ywarma-campus",
        status: "active",
      });

    return NextResponse.json({
      success: true,
      message: "Principal account verified & synchronized in Supabase Auth and user_profiles.",
      userId: principalUser.id,
      email: principalEmail,
      note: profileErr ? profileErr.message : "Profile synchronized",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to initialize principal" }, { status: 500 });
  }
}

