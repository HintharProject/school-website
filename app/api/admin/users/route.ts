import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { UserProfileRecord, UserRole } from "@/lib/supabase/types";

// Master Principal profile fallback if Supabase user_profiles table is initializing
const SEED_USERS: UserProfileRecord[] = [
  {
    id: "user-principal-dr-kmh",
    email: "kaungmyat.htut@gmail.com",
    full_name: "Dr. Kaung Myat Htut",
    role: "principal",
    title: "Principal & Founder",
    campus_id: "ywarma-campus",
    status: "active",
    created_at: "2026-08-01T00:00:00Z",
  },
];

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

export async function GET(req: Request) {
  try {
    const { isAuth, role: callerRole, suspended } = await getCallerAuth();

    if (!isAuth) {
      return NextResponse.json(
        { error: suspended ? "Account suspended." : "Unauthorized: Administrative login required." },
        { status: 401 }
      );
    }

    if (callerRole === "student") {
      return NextResponse.json(
        { error: "Forbidden: Student contributors cannot inspect all user profiles." },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const role = url.searchParams.get("role");
    const search = url.searchParams.get("search")?.toLowerCase();

    // Query live Supabase user_profiles table
    const { data: dbUsers, error } = await supabaseAdmin
      .from("user_profiles")
      .select("id, email, full_name, role, title, campus_id, grade, status, created_at")
      .order("created_at", { ascending: false });

    let users: UserProfileRecord[] = (error || !dbUsers) ? SEED_USERS : (dbUsers as UserProfileRecord[]);

    if (role && role !== "all") {
      users = users.filter((u) => u.role === role);
    }
    if (search) {
      users = users.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search) ||
          (u.title && u.title.toLowerCase().includes(search)) ||
          (u.grade && u.grade.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({ users, count: users.length, source: error ? "fallback" : "supabase" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch user profiles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { isAuth, role: callerRole } = await getCallerAuth();

    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized: Administrative login required to provision accounts." },
        { status: 401 }
      );
    }

    // RBAC Permissions check:
    // Students cannot create any account
    // Staff can only provision Student Contributor accounts
    // Principal can provision any account
    if (callerRole === "student") {
      return NextResponse.json(
        { error: "Forbidden: Student contributors cannot provision accounts." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      email,
      full_name,
      role,
      title,
      campus_id,
      grade,
      password,
      send_magic_link,
    } = body;

    if (!email || !full_name || !role) {
      return NextResponse.json({ error: "Missing required fields (email, full_name, role)" }, { status: 400 });
    }

    if (callerRole === "staff_admin" && role !== "student") {
      return NextResponse.json(
        { error: "Forbidden: School staff administrators can only provision Student Contributor accounts." },
        { status: 403 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if user already exists in Auth
    const { data: { users: existingAuthUsers } } = await supabaseAdmin.auth.admin.listUsers();
    let authUserId: string | null = null;
    const existing = existingAuthUsers?.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (existing) {
      authUserId = existing.id;
      // Update app_metadata role if needed
      await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        app_metadata: { role },
        user_metadata: { full_name: full_name.trim(), title },
      });
    } else {
      // Create user in Supabase Auth
      if (send_magic_link) {
        const host = req.headers.get("origin") || req.headers.get("referer") || "http://localhost:3000";
        const redirectUrl = `${new URL(host).origin}/auth/callback?type=invite&next=/admin/update-password`;

        const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
          data: {
            full_name: full_name.trim(),
            title: title || role,
            role,
          },
          redirectTo: redirectUrl,
        });

        if (inviteErr) {
          const defaultPass = password || "Hinthar2026!";
          const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
            email: cleanEmail,
            password: defaultPass,
            email_confirm: true,
            user_metadata: { full_name: full_name.trim(), title },
            app_metadata: { role },
          });

          if (createErr) {
            return NextResponse.json({ error: createErr.message }, { status: 500 });
          }
          authUserId = created.user.id;
        } else {
          authUserId = inviteData.user.id;
        }
      } else {
        const userPassword = password || (role === "student" ? "HintharStudent2026!" : "HintharStaff2026!");
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: userPassword,
          email_confirm: true,
          user_metadata: { full_name: full_name.trim(), title },
          app_metadata: { role },
        });

        if (createErr) {
          return NextResponse.json({ error: createErr.message }, { status: 500 });
        }
        authUserId = created.user.id;
      }
    }

    // 2. Insert or update user_profiles row
    const profileData: UserProfileRecord = {
      id: authUserId || `user-${Date.now()}`,
      email: cleanEmail,
      full_name: full_name.trim(),
      role: role as UserRole,
      title: title || (role === "student" ? "Student Contributor" : "Faculty Staff"),
      campus_id: campus_id || "ywarma-campus",
      grade: role === "student" ? grade : undefined,
      status: "active",
      created_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabaseAdmin
      .from("user_profiles")
      .upsert(profileData);

    return NextResponse.json({
      success: true,
      user: profileData,
      note: upsertErr ? `Saved to auth (${upsertErr.message})` : "Provisioned in Supabase Auth & user_profiles",
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to provision account" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { isAuth, role: callerRole } = await getCallerAuth();

    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (callerRole === "student") {
      return NextResponse.json({ error: "Forbidden: Student contributors cannot modify accounts." }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, full_name, title, campus_id, grade } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Check target profile
    const { data: target } = await supabaseAdmin
      .from("user_profiles")
      .select("role, email")
      .eq("id", id)
      .single();

    if (callerRole === "staff_admin" && target && target.role !== "student") {
      return NextResponse.json(
        { error: "Forbidden: Staff administrators can only modify Student Contributor accounts." },
        { status: 403 }
      );
    }

    const updates: Partial<UserProfileRecord> = {};
    if (status) updates.status = status;
    if (full_name) updates.full_name = full_name;
    if (title) updates.title = title;
    if (campus_id) updates.campus_id = campus_id;
    if (grade) updates.grade = grade;

    const { error } = await supabaseAdmin
      .from("user_profiles")
      .update(updates)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: updates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { isAuth, role: callerRole } = await getCallerAuth();

    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (callerRole === "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Check if target is Principal
    const { data: target } = await supabaseAdmin
      .from("user_profiles")
      .select("role, email")
      .eq("id", id)
      .single();

    if (target?.role === "principal" || target?.email === "kaungmyat.htut@gmail.com") {
      return NextResponse.json(
        { error: "The School Principal master account cannot be removed." },
        { status: 403 }
      );
    }

    if (callerRole === "staff_admin" && target?.role !== "student") {
      return NextResponse.json(
        { error: "Staff administrators can only delete Student Contributor accounts." },
        { status: 403 }
      );
    }

    // Delete from public table and auth
    await supabaseAdmin.from("user_profiles").delete().eq("id", id);
    try {
      await supabaseAdmin.auth.admin.deleteUser(id);
    } catch {
      // Ignored if user was mock ID
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete user" }, { status: 500 });
  }
}
