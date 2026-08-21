"use server";

import { getDb, users, invitations, NewUser, accounts, sessions } from "@/lib/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAdmin, logAudit, assertNotLastAdmin } from "@/lib/auth/rbac";
import { getAuth } from "@/lib/auth/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

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
  const validated = inviteSchema.parse(data);
  const db = await getDb();

  const cleanEmail = validated.email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, cleanEmail))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error(`A user with email ${cleanEmail} already has an active school account.`);
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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
            <p>Dear <strong>${validated.fullName}</strong>,</p>
            <p>You have been officially invited to join the Hinthar School Portal with the role of <strong>${validated.role.toUpperCase()}</strong>.</p>
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

  // Invalidate invitation token
  await db
    .update(invitations)
    .set({
      status: "accepted",
      acceptedAt: new Date(),
    })
    .where(eq(invitations.id, invite.id));

  await logAudit({
    actor: {
      id: created.user.id,
      email: invite.email,
      name: invite.fullName,
      role: invite.role as "admin" | "student",
      status: "active",
    },
    action: "USER_ACCEPTED_INVITATION",
    resource: "users",
    resourceId: created.user.id,
    details: { email: invite.email, role: invite.role },
  });

  return { success: true, email: invite.email };
}

export async function updateUserStatusAction(id: string, status: "active" | "inactive" | "suspended") {
  const admin = await requireAdmin();
  const db = await getDb();

  if (status !== "active") {
    await assertNotLastAdmin(id);
  }

  await db
    .update(users)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));

  // If suspended/inactive, invalidate active sessions
  if (status !== "active") {
    await db.delete(sessions).where(eq(sessions.userId, id));
  }

  await logAudit({
    actor: admin,
    action: `ADMIN_SET_USER_STATUS_${status.toUpperCase()}`,
    resource: "users",
    resourceId: id,
    details: { status },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUserAction(id: string) {
  const admin = await requireAdmin();
  const db = await getDb();

  await assertNotLastAdmin(id);

  // Cascade delete sessions, accounts, and user
  await db.delete(sessions).where(eq(sessions.userId, id));
  await db.delete(accounts).where(eq(accounts.userId, id));
  await db.delete(users).where(eq(users.id, id));

  await logAudit({
    actor: admin,
    action: "ADMIN_DELETED_USER",
    resource: "users",
    resourceId: id,
  });

  revalidatePath("/admin/users");
  return { success: true };
}
