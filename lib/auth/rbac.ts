import { headers } from "next/headers";
import { getAuth } from "./auth";
import { getDb, users, auditLogs } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "student";
  status: "active" | "inactive" | "suspended";
  title?: string | null;
  campusId?: string | null;
  grade?: string | null;
  image?: string | null;
}

/**
 * Retrieves the currently authenticated user and session from request headers.
 */
export async function getServerSession(): Promise<{
  user: SessionUser | null;
  session: any | null;
}> {
  try {
    const auth = await getAuth();
    const reqHeaders = await headers();
    const sessionRes = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!sessionRes || !sessionRes.user) {
      return { user: null, session: null };
    }

    const u = sessionRes.user as any;
    const sessionUser: SessionUser = {
      id: u.id,
      email: u.email,
      name: u.name || u.email.split("@")[0],
      role: (u.role as "admin" | "student") || "student",
      status: (u.status as "active" | "inactive" | "suspended") || "active",
      title: u.title ?? null,
      campusId: u.campusId ?? "ywarma-campus",
      grade: u.grade ?? null,
      image: u.image ?? null,
    };

    return { user: sessionUser, session: sessionRes.session };
  } catch (err) {
    console.warn("getServerSession error:", err);
    return { user: null, session: null };
  }
}

/**
 * Requires an authenticated user with an active account status.
 */
export async function requireAuth(): Promise<SessionUser> {
  const { user } = await getServerSession();
  if (!user) {
    throw new Error("UNAUTHORIZED: Authentication required.");
  }
  if (user.status !== "active") {
    throw new Error("FORBIDDEN: Your school account is inactive or suspended.");
  }
  return user;
}

/**
 * Requires the 'admin' role.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN: Administrator privileges required.");
  }
  return user;
}

/**
 * Requires either 'admin' or 'student' role.
 */
export async function requireStudentOrAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "admin" && user.role !== "student") {
    throw new Error("FORBIDDEN: Contributor or Administrator privileges required.");
  }
  return user;
}

/**
 * Safety Guard: Prevents deleting or deactivating the last remaining active administrator.
 */
export async function assertNotLastAdmin(targetUserId: string): Promise<void> {
  const db = await getDb();

  const activeAdmins = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.status, "active")));

  if (activeAdmins.length <= 1 && activeAdmins.some((a) => a.id === targetUserId)) {
    throw new Error(
      "SAFETY_LOCKOUT_PROTECTION: Cannot deactivate or delete the sole remaining active administrator."
    );
  }
}

/**
 * Records an auditable mutation event in Cloudflare D1 audit_logs.
 */
export async function logAudit({
  actor,
  action,
  resource,
  resourceId,
  success = true,
  details,
  ipAddress,
}: {
  actor?: SessionUser | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  success?: boolean;
  details?: Record<string, any> | string;
  ipAddress?: string | null;
}) {
  try {
    const db = await getDb();
    await db.insert(auditLogs).values({
      actorId: actor?.id ?? "system",
      actorEmail: actor?.email ?? "system@hinthar.education",
      actorRole: actor?.role ?? "system",
      action,
      resource,
      resourceId: resourceId ?? null,
      success,
      details: typeof details === "object" ? JSON.stringify(details) : details ?? null,
      ipAddress: ipAddress ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Audit logging failed silently:", err);
  }
}
