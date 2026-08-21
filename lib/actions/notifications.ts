"use server";

import { getDb, admissions, yearbookAlumni, clubs } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "@/lib/auth/rbac";

export interface AdminNotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  icon: string;
  href: string;
  unread: boolean;
  type: "admission" | "yearbook" | "club" | "system";
}

export interface AdminNotificationResponse {
  totalPendingCount: number;
  notifications: AdminNotificationItem[];
}

function formatRelativeTime(dateStr?: string | Date | null): string {
  if (!dateStr) return "recently";
  try {
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    const now = Date.now();
    const diffMs = now - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  } catch {
    return "recently";
  }
}

export async function getAdminNotificationsAction(): Promise<AdminNotificationResponse> {
  const session = await getServerSession();
  if (!session?.user || session.user.status !== "active") {
    return { totalPendingCount: 0, notifications: [] };
  }

  const db = await getDb();
  const notifs: AdminNotificationItem[] = [];

  // 1. Pending Admissions (Admins only)
  let pendingAdmissionsCount = 0;
  if (session.user.role === "admin") {
    try {
      const pendingAdmissions = await db
        .select()
        .from(admissions)
        .where(eq(admissions.status, "Pending"))
        .orderBy(desc(admissions.createdAt))
        .limit(5);

      pendingAdmissionsCount = pendingAdmissions.length;

      for (const adm of pendingAdmissions) {
        notifs.push({
          id: `adm_${adm.id}`,
          title: "New Admission Application",
          desc: `${adm.studentName} applied for ${adm.grade}`,
          time: formatRelativeTime(adm.createdAt || adm.submittedDate),
          icon: "assignment_ind",
          href: "/admin/admissions",
          unread: true,
          type: "admission",
        });
      }
    } catch (err) {
      console.warn("Notifications admissions query note:", err);
    }
  }

  // 2. Pending Yearbook Alumni Submissions
  let pendingYearbookCount = 0;
  try {
    const pendingYearbook = await db
      .select()
      .from(yearbookAlumni)
      .where(eq(yearbookAlumni.status, "pending_review"))
      .orderBy(desc(yearbookAlumni.createdAt))
      .limit(5);

    pendingYearbookCount = pendingYearbook.length;

    for (const yb of pendingYearbook) {
      notifs.push({
        id: `yb_${yb.id}`,
        title: "Yearbook Entry Submitted",
        desc: `${yb.name} submitted ${yb.category} profile for review`,
        time: formatRelativeTime(yb.createdAt),
        icon: "auto_stories",
        href: "/admin/yearbook",
        unread: true,
        type: "yearbook",
      });
    }
  } catch (err) {
    console.warn("Notifications yearbook query note:", err);
  }

  // 3. Pending Club Proposals
  let pendingClubsCount = 0;
  try {
    const pendingClubs = await db
      .select()
      .from(clubs)
      .where(eq(clubs.status, "pending_review"))
      .limit(3);

    pendingClubsCount = pendingClubs.length;

    for (const cl of pendingClubs) {
      notifs.push({
        id: `cl_${cl.id}`,
        title: "Club Proposal Submitted",
        desc: `${cl.name} submitted for review`,
        time: "recently",
        icon: "groups",
        href: "/admin/clubs",
        unread: true,
        type: "club",
      });
    }
  } catch (err) {
    console.warn("Notifications club query note:", err);
  }

  const totalPending = pendingAdmissionsCount + pendingYearbookCount + pendingClubsCount;

  // Fallback items if everything is approved
  if (notifs.length === 0) {
    notifs.push({
      id: "sys_all_good",
      title: "All Approvals Caught Up",
      desc: "There are no pending admission or yearbook reviews at this time.",
      time: "all clear",
      icon: "check_circle",
      href: session.user.role === "admin" ? "/admin/admissions" : "/admin/yearbook",
      unread: false,
      type: "system",
    });
  }

  return {
    totalPendingCount: totalPending,
    notifications: notifs,
  };
}
