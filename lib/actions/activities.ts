"use server";

import { getDb, activities, type NewActivity } from "@/lib/db";
import { and, desc, eq, or } from "drizzle-orm";
import { requireAdmin, requireStudentOrAdmin, logAudit } from "@/lib/auth/rbac";
import { cachedPublicRead, invalidatePublicCache } from "@/lib/cache/publicCache";
import { z } from "zod";

const activitySchema = z.object({
  clubId: z.number().optional().nullable(),
  title: z.string().trim().min(2).max(200),
  titleMy: z.string().trim().max(200).optional().nullable(),
  category: z.enum(["academic", "sports", "cultural", "science"]),
  date: z.string().trim().min(2),
  month: z.string().trim().min(2).max(12),
  day: z.string().trim().min(1).max(6),
  time: z.string().trim().min(2),
  location: z.string().trim().min(2),
  locationMy: z.string().trim().max(200).optional().nullable(),
  description: z.string().trim().min(5),
  descriptionMy: z.string().trim().optional().nullable(),
  image: z.string().trim().default("/images/engineering.avif"),
  status: z.enum(["Upcoming", "Active Registration", "Past Highlight"]).default("Upcoming"),
  campus: z.string().trim().default("both-campuses"),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

function flushActivitiesCache() {
  invalidatePublicCache(["activities"], ["/clubs", "/admin", "/admin/clubs"]);
}

/** Fast cached public reader — never calls getServerSession(). */
export async function getPublicActivities() {
  return cachedPublicRead("public-activities", ["activities"], async () => {
    try {
      const db = await getDb();
      return await db
        .select()
        .from(activities)
        .where(and(eq(activities.reviewStatus, "published"), eq(activities.isActive, true)))
        .orderBy(desc(activities.featured), desc(activities.id));
    } catch {
      return [];
    }
  });
}

/** Authenticated Portal reader for Admins & Student Contributors. */
export async function getPortalActivities() {
  const user = await requireStudentOrAdmin();
  const db = await getDb();
  if (user.role === "admin") {
    return db
      .select()
      .from(activities)
      .orderBy(desc(activities.featured), desc(activities.id));
  }
  return db
    .select()
    .from(activities)
    .where(or(eq(activities.reviewStatus, "published"), eq(activities.submittedBy, user.id)))
    .orderBy(desc(activities.featured), desc(activities.id));
}

export async function createActivityAction(data: unknown) {
  const user = await requireStudentOrAdmin();
  const validated = activitySchema.parse(data);
  const db = await getDb();

  const reviewStatus = user.role === "admin" ? "published" : "pending_review";

  const insertData: NewActivity = {
    clubId: validated.clubId ?? null,
    title: validated.title,
    titleMy: validated.titleMy || null,
    category: validated.category,
    date: validated.date,
    month: validated.month,
    day: validated.day,
    time: validated.time,
    location: validated.location,
    locationMy: validated.locationMy || null,
    description: validated.description,
    descriptionMy: validated.descriptionMy || null,
    image: validated.image,
    status: validated.status,
    campus: validated.campus,
    featured: user.role === "admin" ? validated.featured : false,
    isActive: validated.isActive,
    reviewStatus,
    submittedBy: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await db.insert(activities).values(insertData).returning({ id: activities.id });

  await logAudit({
    actor: user,
    action: user.role === "admin" ? "ADMIN_CREATED_ACTIVITY" : "STUDENT_PROPOSED_ACTIVITY",
    resource: "activities",
    resourceId: String(result[0]?.id),
    details: { title: validated.title, category: validated.category, reviewStatus },
  });

  flushActivitiesCache();
  return { success: true as const, id: result[0]?.id, reviewStatus };
}

export async function updateActivityAction(id: number, data: unknown) {
  const user = await requireStudentOrAdmin();
  const validated = activitySchema.partial().parse(data);
  const db = await getDb();

  let resetToReview = false;
  if (user.role === "student") {
    const existing = await db.select().from(activities).where(eq(activities.id, id)).limit(1);
    if (!existing.length || existing[0].submittedBy !== user.id) {
      return { success: false as const, error: "You can only edit your own activity proposals." };
    }
    resetToReview = true;
  }

  const updateData: Partial<NewActivity> = {
    ...validated,
    titleMy: validated.titleMy !== undefined ? validated.titleMy || null : undefined,
    locationMy: validated.locationMy !== undefined ? validated.locationMy || null : undefined,
    descriptionMy: validated.descriptionMy !== undefined ? validated.descriptionMy || null : undefined,
    clubId: validated.clubId !== undefined ? validated.clubId : undefined,
    updatedAt: new Date().toISOString(),
  };
  if (resetToReview) {
    updateData.reviewStatus = "pending_review";
  }

  const updated = await db
    .update(activities)
    .set(updateData)
    .where(eq(activities.id, id))
    .returning({ id: activities.id });

  if (!updated.length) {
    return { success: false as const, error: "Activity not found." };
  }

  await logAudit({
    actor: user,
    action: user.role === "admin" ? "ADMIN_UPDATED_ACTIVITY" : "STUDENT_UPDATED_ACTIVITY",
    resource: "activities",
    resourceId: String(id),
    details: validated,
  });

  flushActivitiesCache();
  return { success: true as const };
}

export async function setActivityReviewStatusAction(
  id: number,
  reviewStatus: "published" | "pending_review" | "archived"
) {
  const user = await requireAdmin();
  const db = await getDb();
  const validStatus = z.enum(["published", "pending_review", "archived"]).parse(reviewStatus);

  const updated = await db
    .update(activities)
    .set({ reviewStatus: validStatus, updatedAt: new Date().toISOString() })
    .where(eq(activities.id, id))
    .returning({ id: activities.id });

  if (!updated.length) return { success: false as const, error: "Activity not found." };

  await logAudit({
    actor: user,
    action: `ADMIN_SET_ACTIVITY_STATUS_${validStatus.toUpperCase()}`,
    resource: "activities",
    resourceId: String(id),
    details: { reviewStatus: validStatus },
  });

  flushActivitiesCache();
  return { success: true as const };
}

export async function deleteActivityAction(id: number) {
  const user = await requireAdmin();
  const db = await getDb();
  await db.delete(activities).where(eq(activities.id, id));
  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_ACTIVITY",
    resource: "activities",
    resourceId: String(id),
  });
  flushActivitiesCache();
  return { success: true as const };
}
