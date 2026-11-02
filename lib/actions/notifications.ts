"use server";

import { getDb, admissions, yearbookAlumni, clubs, activities } from "@/lib/db";
import { eq, desc, sql } from "drizzle-orm";
import { getServerSession } from "@/lib/auth/rbac";

export interface AdminNotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  href: string;
  unread: boolean;
  type: "admission" | "yearbook" | "club" | "activity" | "system";
}

export interface AdminNotificationResponse {
  totalPendingCount: number;
  notifications: AdminNotificationItem[];
}

function formatRelativeTime(dateStr?: string | Date | null): string {
  if (!dateStr) return "recently";
  try {
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    const diffMs = Date.now() - d.getTime();
    if (Number.isNaN(diffMs)) return "recently";
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  } catch {
    return "recently";
  }
}

async function safeCount(query: Promise<{ n: number }[]>): Promise<number> {
  try {
    const rows = await query;
    return Number(rows[0]?.n ?? 0);
  } catch {
    return 0;
  }
}

export async function getAdminNotificationsAction(): Promise<AdminNotificationResponse> {
  const session = await getServerSession();
  if (!session?.user || session.user.status !== "active") {
    return { totalPendingCount: 0, notifications: [] };
  }

  const db = await getDb();
  const notifs: AdminNotificationItem[] = [];

  let pendingAdmissionsTotal = 0;
  let pendingYearbookTotal = 0;
  let pendingClubsTotal = 0;
  let pendingActivitiesTotal = 0;

  if (session.user.role === "admin") {
    try {
      pendingAdmissionsTotal = await safeCount(
        db.select({ n: sql<number>`count(*)` }).from(admissions).where(eq(admissions.status, "Pending"))
      );
      const recentAdmissions = await db
        .select()
        .from(admissions)
        .where(eq(admissions.status, "Pending"))
        .orderBy(desc(admissions.createdAt))
        .limit(4);

      for (const adm of recentAdmissions) {
        notifs.push({
          id: `adm_${adm.id}`,
          title: "New Admission Application",
          desc: `${adm.studentName} · ${adm.grade}`,
          time: formatRelativeTime(adm.createdAt || adm.submittedDate),
          href: "/admin/admissions",
          unread: true,
          type: "admission",
        });
      }
    } catch {
      // ignore
    }
  }

  try {
    pendingYearbookTotal = await safeCount(
      db.select({ n: sql<number>`count(*)` }).from(yearbookAlumni).where(eq(yearbookAlumni.status, "pending_review"))
    );
    const pendingYearbook = await db
      .select()
      .from(yearbookAlumni)
      .where(eq(yearbookAlumni.status, "pending_review"))
      .orderBy(desc(yearbookAlumni.createdAt))
      .limit(3);

    for (const yb of pendingYearbook) {
      notifs.push({
        id: `yb_${yb.id}`,
        title: "Yearbook Draft Pending",
        desc: `${yb.name} submitted a student profile`,
        time: formatRelativeTime(yb.createdAt),
        href: "/admin/yearbook",
        unread: true,
        type: "yearbook",
      });
    }
  } catch {
    // ignore
  }

  try {
    pendingClubsTotal = await safeCount(
      db.select({ n: sql<number>`count(*)` }).from(clubs).where(eq(clubs.status, "pending_review"))
    );
    const pendingClubs = await db
      .select()
      .from(clubs)
      .where(eq(clubs.status, "pending_review"))
      .orderBy(desc(clubs.createdAt))
      .limit(3);

    for (const cl of pendingClubs) {
      notifs.push({
        id: `cl_${cl.id}`,
        title: "Club Proposal Pending",
        desc: `${cl.name} awaiting review`,
        time: formatRelativeTime(cl.createdAt),
        href: "/admin/clubs",
        unread: true,
        type: "club",
      });
    }
  } catch {
    // ignore
  }

  try {
    pendingActivitiesTotal = await safeCount(
      db.select({ n: sql<number>`count(*)` }).from(activities).where(eq(activities.reviewStatus, "pending_review"))
    );
    const pendingActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.reviewStatus, "pending_review"))
      .orderBy(desc(activities.createdAt))
      .limit(3);

    for (const act of pendingActivities) {
      notifs.push({
        id: `act_${act.id}`,
        title: "Activity Proposal Pending",
        desc: `${act.title} awaiting review`,
        time: formatRelativeTime(act.createdAt),
        href: "/admin/clubs",
        unread: true,
        type: "activity",
      });
    }
  } catch {
    // ignore
  }

  if (notifs.length === 0) {
    notifs.push({
      id: "sys_all_good",
      title: "All Reviews Up to Date",
      desc: "No pending admissions or student contributor drafts right now.",
      time: "clear",
      href: "/admin",
      unread: false,
      type: "system",
    });
  }

  return {
    totalPendingCount:
      pendingAdmissionsTotal + pendingYearbookTotal + pendingClubsTotal + pendingActivitiesTotal,
    notifications: notifs,
  };
}
