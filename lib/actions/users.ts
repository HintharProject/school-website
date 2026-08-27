"use server";

import { getDb, users, invitations, accounts, sessions } from "@/lib/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { requireAdmin, logAudit, assertNotLastAdmin } from "@/lib/auth/rbac";
import { getAuth } from "@/lib/auth/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { escapeHtml } from "@/lib/email/email";

const inviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(200),
  role: z.enum(["admin", "student"]).default("student"),
  title: z.string().optional().nullable(),
  campusId: z.string().default("ywarma-campus"),
  grade: z.string().optional().nullable(),
});

export async function getUsers() {
  await requireAdmin();
  const db = await getDb();
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      title: users.title,
      campusId: users.campusId,
      grade: users.grade,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}

export async function getPendingInvitations() {
  await requireAdmin();
  const db = await getDb();
  return db
    .select()
    .from(invitations)
    .where(eq(invitations.status, "pending"))
    .orderBy(desc(invitations.createdAt));
}

export async function inviteUserAction(data: unknown) {
  const admin = await requireAdmin();

  const parsed = inviteSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: "Please provide a valid email address and full name." };
  }
  const validated = parsed.data;
  const db = await getDb();

  const cleanEmail = validated.email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, cleanEmail))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false as const, error: "A user with this email already has an active school account." };
  }

  // Generate secure single-use token (32 bytes hex)
  const tokenArray = new Uint8Array(24);
  crypto.getRandomValues(tokenArray);
  const token = Array.from(tokenArray, (b) => b.toString(16).padStart(2, "0")).join("");

  const invitationId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Invalidate any previous pending invites for this email
  await db
    .update(invitations)
    .set({ status: "cancelled" })
    .where(and(eq(invitations.email, cleanEmail), eq(invitations.status, "pending")));

  // Insert invitation record
  await db.insert(invitations).values({
    id: invitationId,
    email: cleanEmail,
    fullName: validated.fullName,
    role: validated.role,
    title: validated.title ?? null,
    campusId: validated.campusId,
    grade: validated.grade ?? null,
    token,
    status: "pending",
    invitedBy: admin.id,
    expiresAt,
    createdAt: new Date(),
  });

  // Resolve a public base URL for the invite link:
  // 1. Explicit env override (NEXT_PUBLIC_APP_URL)
  // 2. The host of the incoming request (correct on production, previews, custom domains)
  // 3. BETTER_AUTH_URL as configured in wrangler vars
  let baseUrl = "";
  if (process.env.NEXT_PUBLIC_APP_URL) {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  } else {
    try {
      const reqHeaders = await headers();
      const host = reqHeaders.get("x-forwarded-host") || reqHeaders.get("host");
      if (host) {
        const proto = reqHeaders.get("x-forwarded-proto") || "https";
        baseUrl = `${proto}://${host}`;
      }
    } catch {
      // headers() unavailable — fall through
    }
  }
  if (!baseUrl) {
    baseUrl =
      process.env.BETTER_AUTH_URL?.replace(/\/+$/, "") ||
      "https://hinthar.thawyezaw.workers.dev";
  }

  const inviteUrl = `${baseUrl}/admin/login?inviteToken=${token}&email=${encodeURIComponent(cleanEmail)}`;

  // Dispatch email via Resend
  let emailSent = false;
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: process.env.RESEND_FROM || "Hinthar Administration <admissions@hinthar.education>",
        to: cleanEmail,
        subject: `Invitation to Hinthar Portal — ${validated.fullName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0E3B7D;">Hinthar International School Portal</h2>
            <p>Dear <strong>${escapeHtml(validated.fullName)}</strong>,</p>
            <p>You have been officially invited to join the Hinthar School Portal with the role of <strong>${escapeHtml(validated.role.toUpperCase())}</strong>.</p>
            <div style="margin: 24px 0; text-align: center;">
              <a href="${inviteUrl}" style="background-color: #0E3B7D; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Accept Invitation & Set Password</a>
            </div>
            <p style="font-size: 12px; color: #64748b;">This single-use invitation link will expire in 7 days. If you did not expect this invitation, please contact the school administration.</p>
          </div>
        `,
      });
      emailSent = true;
    }
  } catch (emailErr) {
    console.warn("Invitation email dispatch error:", emailErr);
  }

  await logAudit({
    actor: admin,
    action: `ADMIN_INVITED_${validated.role.toUpperCase()}`,
    resource: "users",
    details: { email: cleanEmail, role: validated.role, emailSent },
  });

  revalidatePath("/admin/users");
  return {
    success: true,
    inviteUrl,
    token,
    emailSent,
  };
}

export async function acceptInviteAction(token: string, password: string) {
  if (!token || !password || password.length < 8) {
    throw new Error("Invalid token or password does not meet the minimum 8-character requirement.");
  }

  const db = await getDb();
  const auth = await getAuth();

  const inviteRows = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.token, token), eq(invitations.status, "pending")))
    .limit(1);

  if (inviteRows.length === 0) {
    throw new Error("This invitation token is invalid, expired, or has already been used.");
  }

  const invite = inviteRows[0];
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    await db.update(invitations).set({ status: "expired" }).where(eq(invitations.id, invite.id));
    throw new Error("This invitation has expired. Please request a new invitation from the administrator.");
  }

  // Atomically claim the invitation (single-use guarantee even under
  // concurrent submissions): only one UPDATE with status='pending' succeeds.
  const claimed = await db
    .update(invitations)
    .set({ status: "accepted", acceptedAt: new Date() })
    .where(and(eq(invitations.id, invite.id), eq(invitations.status, "pending")))
    .returning({ id: invitations.id });

  if (claimed.length === 0) {
    throw new Error("This invitation has already been used.");
  }

  let acceptedUserId = "";
  let acceptedEmail = invite.email;
  try {
    // Create user via Better Auth
    const created = await auth.api.signUpEmail({
      body: {
        email: invite.email,
        password,
        name: invite.fullName,
      },
    });

    if (!created?.user) {
      throw new Error("Failed to initialize account credentials. Please try again.");
    }

    acceptedUserId = created.user.id;

    // Update profile attributes in users table
    await db
      .update(users)
      .set({
        role: invite.role,
        status: "active",
        title: invite.title ?? (invite.role === "admin" ? "Staff Administrator" : "Student Contributor"),
        campusId: invite.campusId ?? "ywarma-campus",
        grade: invite.grade ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, created.user.id));
  } catch (err) {
    // Release the claim so a corrected retry is possible
    await db
      .update(invitations)
      .set({ status: "pending", acceptedAt: null })
      .where(eq(invitations.id, invite.id));
    throw err;
  }

  await logAudit({
    actor: {
      id: acceptedUserId || acceptedEmail,
      email: acceptedEmail,
      name: invite.fullName,
      role: invite.role as "admin" | "student",
      status: "active",
    },
    action: "USER_ACCEPTED_INVITATION",
    resource: "users",
    resourceId: acceptedUserId || null,
    details: { email: acceptedEmail, role: invite.role },
  });

  return { success: true, email: invite.email };
}

export async function updateUserStatusAction(id: string, status: string) {
  const admin = await requireAdmin();
  const db = await getDb();

  const statusSchema = z.enum(["active", "inactive", "suspended"]);
  const parsedStatus = statusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { success: false as const, error: "Invalid account status." };
  }
  const validStatus = parsedStatus.data;

  if (validStatus !== "active") {
    await assertNotLastAdmin(id);
  }

  // Conditional write guards against racing away the last active admin.
  const guard =
    validStatus !== "active"
      ? sql`(SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'active' AND id != ${id}) > 0`
      : sql`1 = 1`;

  const result = await db.run(
    sql`UPDATE users SET status = ${validStatus}, updated_at = ${new Date().toISOString()} WHERE id = ${id} AND ${guard}`
  );

  if (!result.meta.changes) {
    return {
      success: false as const,
      error: "Account not found, unchanged, or it is the sole remaining active administrator.",
    };
  }

  // If suspended/inactive, invalidate active sessions
  if (validStatus !== "active") {
    await db.delete(sessions).where(eq(sessions.userId, id));
  }

  await logAudit({
    actor: admin,
    action: `ADMIN_SET_USER_STATUS_${validStatus.toUpperCase()}`,
    resource: "users",
    resourceId: id,
    details: { status: validStatus },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserAction(id: string, data: unknown) {
  const admin = await requireAdmin();
  const db = await getDb();

  const schema = z.object({
    name: z.string().trim().min(2).max(200),
    role: z.enum(["admin", "student"]),
    title: z.string().trim().max(200).optional().nullable(),
    campusId: z.string().trim().max(100).optional().nullable(),
    grade: z.string().trim().max(100).optional().nullable(),
  });

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: "Please check name and role fields." };
  }
  const validated = parsed.data;

  // Fetch current user to compare role change
  const existing = await db.select({ role: users.role, status: users.status }).from(users).where(eq(users.id, id)).limit(1);
  if (!existing.length) return { success: false as const, error: "User not found." };

  const wasAdmin = existing[0].role === "admin" && existing[0].status === "active";
  const willBeAdmin = validated.role === "admin";

  // Anti-lockout: prevent demoting last active admin
  if (wasAdmin && !willBeAdmin) {
    await assertNotLastAdmin(id);
    const guard = sql`(SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'active' AND id != ${id}) > 0`;
    const result = await db.run(
      sql`UPDATE users SET name = ${validated.name}, role = ${validated.role}, title = ${validated.title ?? null}, campus_id = ${validated.campusId ?? null}, grade = ${validated.grade ?? null}, updated_at = ${new Date().toISOString()} WHERE id = ${id} AND ${guard}`
    );
    if (!result.meta.changes) {
      return { success: false as const, error: "Cannot demote the last active administrator." };
    }
  } else {
    await db
      .update(users)
      .set({
        name: validated.name,
        role: validated.role,
        title: validated.title ?? null,
        campusId: validated.campusId ?? null,
        grade: validated.grade ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  await logAudit({
    actor: admin,
    action: validated.role !== existing[0].role ? `ADMIN_CHANGED_ROLE_${validated.role.toUpperCase()}` : "ADMIN_UPDATED_USER",
    resource: "users",
    resourceId: id,
    details: { role: validated.role, name: validated.name },
  });

  revalidatePath("/admin/users");
  return { success: true as const };
}

export async function deleteUserAction(id: string) {
  const admin = await requireAdmin();
  const db = await getDb();

  await assertNotLastAdmin(id);

  // Cascade delete sessions, accounts, then the user. The conditional DELETE
  // prevents removing the last active admin in a concurrent race.
  const result = await db.run(
    sql`DELETE FROM users WHERE id = ${id} AND (
      role != 'admin' OR status != 'active' OR
      (SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'active') > 1
    )`
  );

  if (!result.meta.changes) {
    return {
      success: false as const,
      error: "Account not found or it is the sole remaining active administrator.",
    };
  }

  await db.delete(sessions).where(eq(sessions.userId, id));
  await db.delete(accounts).where(eq(accounts.userId, id));

  await logAudit({
    actor: admin,
    action: "ADMIN_DELETED_USER",
    resource: "users",
    resourceId: id,
  });

  revalidatePath("/admin/users");
  return { success: true };
}
