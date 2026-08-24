"use server";

import { getDb, notices, noticeReads, users } from "@/lib/db";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { requireAdmin, getServerSession, logAudit } from "@/lib/auth/rbac";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createNoticeSchema = z.object({
  title: z.string().min(3).max(300),
  body: z.string().min(3).max(5000),
  priority: z.enum(["normal", "urgent"]).default("normal"),
  targetType: z.enum(["all", "admins", "contributors"]).default("all"),
  isTask: z.boolean().default(false),
  dueDate: z.string().max(40).optional().nullable(),
});

export interface NoticeFeedItem {
  id: number;
  title: string;
  body: string;
  priority: "normal" | "urgent";
  targetType: "all" | "admins" | "contributors";
  isTask: boolean;
  dueDate?: string | null;
  authorName?: string | null;
  createdAt: string;
  completedByMe: boolean;
  completionCount: number;
}

/**
 * Returns notices visible to the current session user, newest first,
 * annotated with the user's own completion state and (for admins)
 * total completion counts.
 */
export async function getNoticesForUser(): Promise<{
  success: boolean;
  error?: string;
  notices?: NoticeFeedItem[];
}> {
  const { user } = await getServerSession();
  if (!user || user.status !== "active") {
    return { success: false, error: "Authentication required." };
  }

  const db = await getDb();

  const targets: ("all" | "admins" | "contributors")[] =
    user.role === "admin"
      ? ["all", "admins"]
      : ["all", "contributors"];

  const rows = await db
    .select()
    .from(notices)
    .where(inArray(notices.targetType, targets))
    .orderBy(desc(notices.createdAt))
    .limit(100);

  if (!rows.length) {
    return { success: true, notices: [] };
  }

  const ids = rows.map((n) => n.id);

  const myReads = await db
    .select({ noticeId: noticeReads.noticeId })
    .from(noticeReads)
    .where(and(inArray(noticeReads.noticeId, ids), eq(noticeReads.userId, user.id)));
  const myCompleted = new Set(myReads.map((r) => r.noticeId));

  let counts = new Map<number, number>();
  if (user.role === "admin") {
    const countRows = await db
      .select({ noticeId: noticeReads.noticeId, n: sql<number>`count(*)` })
      .from(noticeReads)
      .where(inArray(noticeReads.noticeId, ids))
      .groupBy(noticeReads.noticeId);
    counts = new Map(countRows.map((r) => [r.noticeId, Number(r.n)]));
  }

  const authorIds = [...new Set(rows.map((n) => n.createdBy).filter(Boolean))] as string[];
  const authors = authorIds.length
    ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, authorIds))
    : [];
  const authorMap = new Map(authors.map((a) => [a.id, a.name]));

  return {
    success: true,
    notices: rows.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      priority: n.priority as "normal" | "urgent",
      targetType: n.targetType as "all" | "admins" | "contributors",
      isTask: Boolean(n.isTask),
      dueDate: n.dueDate,
      authorName: n.createdBy ? authorMap.get(n.createdBy) ?? null : null,
      createdAt: n.createdAt,
      completedByMe: myCompleted.has(n.id),
      completionCount: counts.get(n.id) ?? 0,
    })),
  };
}

export async function createNoticeAction(
  data: unknown
): Promise<{ success: boolean; error?: string; id?: number }> {
  const user = await requireAdmin();

  const parsed = createNoticeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Please provide a title and a message body." };
  }
  const validated = parsed.data;

  const db = await getDb();

  const result = await db
    .insert(notices)
    .values({
      title: validated.title.trim(),
      body: validated.body.trim(),
      priority: validated.priority,
      targetType: validated.targetType,
      isTask: validated.isTask,
      dueDate: validated.dueDate || null,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning({ id: notices.id });

  await logAudit({
    actor: user,
    action: "ADMIN_CREATED_NOTICE",
    resource: "notices",
    resourceId: String(result[0]?.id),
    details: { title: validated.title, targetType: validated.targetType, isTask: validated.isTask },
  });

  revalidatePath("/admin/notices");
  return { success: true, id: result[0]?.id };
}

export async function deleteNoticeAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAdmin();
  const db = await getDb();

  const deleted = await db.delete(notices).where(eq(notices.id, id)).returning({ id: notices.id });
  if (!deleted.length) {
    return { success: false, error: "Notice not found." };
  }

  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_NOTICE",
    resource: "notices",
    resourceId: String(id),
  });

  revalidatePath("/admin/notices");
  return { success: true };
}

export async function toggleNoticeCompleteAction(
  noticeId: number,
  complete: boolean
): Promise<{ success: boolean; error?: string }> {
  const { user } = await getServerSession();
  if (!user || user.status !== "active") {
    return { success: false, error: "Authentication required." };
  }

  const db = await getDb();

  if (complete) {
    try {
      await db
        .insert(noticeReads)
        .values({ noticeId, userId: user.id, completedAt: new Date().toISOString() });
    } catch {
      // Unique index violation means it was already marked — treat as success.
    }
  } else {
    await db
      .delete(noticeReads)
      .where(and(eq(noticeReads.noticeId, noticeId), eq(noticeReads.userId, user.id)));
  }

  revalidatePath("/admin/notices");
  return { success: true };
}
