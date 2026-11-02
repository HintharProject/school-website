"use server";

import { getDb, clubs, type NewClub } from "@/lib/db";
import { and, desc, eq, or } from "drizzle-orm";
import { requireAdmin, requireStudentOrAdmin, logAudit } from "@/lib/auth/rbac";
import { cachedPublicRead, invalidatePublicCache } from "@/lib/cache/publicCache";
import { z } from "zod";

const clubSchema = z.object({
  name: z.string().trim().min(2).max(200),
  category: z.enum([
    "STEM & Tech",
    "Academic & Debate",
    "STEM & Science",
    "Creative Arts",
    "Sports & Fitness",
  ]),
  icon: z.string().trim().default("users"),
  members: z.string().trim().default("25+ Scholars"),
  meetingTime: z.string().trim().min(2),
  meetingTimeMy: z.string().trim().optional().nullable(),
  leadership: z.string().trim().min(2),
  leadershipMy: z.string().trim().optional().nullable(),
  description: z.string().trim().min(5),
  descriptionMy: z.string().trim().optional().nullable(),
  image: z.string().trim().default("/images/g2.jpg"),
  galleryUrls: z.array(z.string().trim().min(1)).max(12).default([]),
  campus: z.string().trim().default("both-campuses"),
  isActive: z.boolean().default(true),
});

function flushClubsCache() {
  invalidatePublicCache(["clubs"], ["/clubs", "/admin", "/admin/clubs"]);
}

/** Fast cached public reader — never calls getServerSession(). */
export async function getPublicClubs() {
  return cachedPublicRead("public-clubs", ["clubs"], async () => {
    try {
      const db = await getDb();
      return await db
        .select()
        .from(clubs)
        .where(and(eq(clubs.status, "published"), eq(clubs.isActive, true)))
        .orderBy(desc(clubs.id));
    } catch {
      return [];
    }
  });
}

/** Authenticated Portal reader for Admins & Student Contributors. */
export async function getPortalClubs() {
  const user = await requireStudentOrAdmin();
  const db = await getDb();
  if (user.role === "admin") {
    return db.select().from(clubs).orderBy(desc(clubs.id));
  }
  return db
    .select()
    .from(clubs)
    .where(or(eq(clubs.status, "published"), eq(clubs.submittedBy, user.id)))
    .orderBy(desc(clubs.id));
}

export async function createClubAction(data: unknown) {
  const user = await requireStudentOrAdmin();
  const validated = clubSchema.parse(data);
  const db = await getDb();

  const status = user.role === "admin" ? "published" : "pending_review";

  const insertData: NewClub = {
    name: validated.name,
    category: validated.category,
    icon: validated.icon,
    members: validated.members,
    meetingTime: validated.meetingTime,
    meetingTimeMy: validated.meetingTimeMy || null,
    leadership: validated.leadership,
    leadershipMy: validated.leadershipMy || null,
    description: validated.description,
    descriptionMy: validated.descriptionMy || null,
    image: validated.image,
    galleryUrls: JSON.stringify(validated.galleryUrls),
    campus: validated.campus,
    isActive: validated.isActive,
    status,
    submittedBy: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await db.insert(clubs).values(insertData).returning({ id: clubs.id });

  await logAudit({
    actor: user,
    action: user.role === "admin" ? "ADMIN_CREATED_CLUB" : "STUDENT_PROPOSED_CLUB",
    resource: "clubs",
    resourceId: String(result[0]?.id),
    details: { name: validated.name, status },
  });

  flushClubsCache();
  return { success: true as const, id: result[0]?.id, status };
}

export async function updateClubAction(id: number, data: unknown) {
  const user = await requireStudentOrAdmin();
  const validated = clubSchema.partial().parse(data);
  const db = await getDb();

  let resetToReview = false;
  if (user.role === "student") {
    const existing = await db.select().from(clubs).where(eq(clubs.id, id)).limit(1);
    if (!existing.length || existing[0].submittedBy !== user.id) {
      return { success: false as const, error: "You can only edit your own club proposals." };
    }
    resetToReview = true;
  }

  const updateData: Partial<NewClub> = {
    ...validated,
    meetingTimeMy: validated.meetingTimeMy !== undefined ? validated.meetingTimeMy || null : undefined,
    leadershipMy: validated.leadershipMy !== undefined ? validated.leadershipMy || null : undefined,
    descriptionMy: validated.descriptionMy !== undefined ? validated.descriptionMy || null : undefined,
    galleryUrls: validated.galleryUrls ? JSON.stringify(validated.galleryUrls) : undefined,
    updatedAt: new Date().toISOString(),
  };
  if (resetToReview) {
    updateData.status = "pending_review";
  }

  const updated = await db
    .update(clubs)
    .set(updateData)
    .where(eq(clubs.id, id))
    .returning({ id: clubs.id });

  if (!updated.length) {
    return { success: false as const, error: "Club not found." };
  }

  await logAudit({
    actor: user,
    action: user.role === "admin" ? "ADMIN_UPDATED_CLUB" : "STUDENT_UPDATED_CLUB",
    resource: "clubs",
    resourceId: String(id),
    details: validated,
  });

  flushClubsCache();
  return { success: true as const };
}

export async function setClubStatusAction(
  id: number,
  status: "published" | "pending_review" | "archived"
) {
  const user = await requireAdmin();
  const db = await getDb();
  const validStatus = z.enum(["published", "pending_review", "archived"]).parse(status);

  const updated = await db
    .update(clubs)
    .set({ status: validStatus, updatedAt: new Date().toISOString() })
    .where(eq(clubs.id, id))
    .returning({ id: clubs.id });

  if (!updated.length) return { success: false as const, error: "Club not found." };

  await logAudit({
    actor: user,
    action: `ADMIN_SET_CLUB_STATUS_${validStatus.toUpperCase()}`,
    resource: "clubs",
    resourceId: String(id),
    details: { status: validStatus },
  });

  flushClubsCache();
  return { success: true as const };
}

export async function deleteClubAction(id: number) {
  const user = await requireAdmin();
  const db = await getDb();
  await db.delete(clubs).where(eq(clubs.id, id));
  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_CLUB",
    resource: "clubs",
    resourceId: String(id),
  });
  flushClubsCache();
  return { success: true as const };
}
