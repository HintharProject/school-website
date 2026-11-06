"use server";

import { getDb, activities, type NewActivity } from "@/lib/db";
import { and, desc, eq, or } from "drizzle-orm";
import { requireAdmin, requireStudentOrAdmin, logAudit } from "@/lib/auth/rbac";
import { cachedPublicRead, invalidatePublicCache } from "@/lib/cache/publicCache";
import { z } from "zod";

const activitySchema = z.object({
  clubId: z.number().optional().nullable(),
  title: z.string().trim().min(2, "Activity title must be at least 2 characters.").max(200),
  titleMy: z.string().trim().max(200).optional().nullable(),
  category: z.string().trim().min(2, "Category is required.").max(50),
  date: z.string().trim().min(1, "Date is required.").default("Schedule TBD"),
  month: z.string().trim().min(1, "Month code is required.").max(20).default("TBD"),
  day: z.string().trim().min(1, "Day is required.").max(20).default("TBD"),
  time: z.string().trim().min(1, "Time is required.").default("TBD"),
  location: z.string().trim().min(1, "Location is required.").default("Hinthar Campus"),
  locationMy: z.string().trim().max(200).optional().nullable(),
  description: z.string().trim().min(2, "Description must be at least 2 characters."),
  descriptionMy: z.string().trim().optional().nullable(),
  image: z.preprocess(
    (val) => (typeof val === "string" && val.trim() ? val.trim() : "/images/engineering.avif"),
    z.string().trim().min(1)
  ),
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
  try {
    const user = await requireStudentOrAdmin();
    const db = await getDb();
    if (user.role === "admin") {
      return await db
        .select()
        .from(activities)
        .orderBy(desc(activities.featured), desc(activities.id));
    }
    return await db
      .select()
      .from(activities)
      .where(or(eq(activities.reviewStatus, "published"), eq(activities.submittedBy, user.id)))
      .orderBy(desc(activities.featured), desc(activities.id));
  } catch (err) {
    console.warn("getPortalActivities query failed:", err);
    return [];
  }
}

export async function createActivityAction(data: unknown): Promise<{
  success: boolean;
  id?: number;
  reviewStatus?: string;
  error?: string;
}> {
  let user;
  try {
    user = await requireStudentOrAdmin();
  } catch (authErr: any) {
    return { success: false, error: authErr.message || "Unauthorized: Student or Admin session required." };
  }

  const parsed = activitySchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => `${i.path.join(".") || "field"}: ${i.message}`).join("; ");
    return { success: false, error: errorMsg };
  }
  const validated = parsed.data;

  try {
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
    return { success: true, id: result[0]?.id, reviewStatus };
  } catch (err: any) {
    console.error("Failed to create activity:", err);
    return { success: false, error: err?.message || "Database error creating activity." };
  }
}

export async function updateActivityAction(
  id: number,
  data: unknown
): Promise<{ success: boolean; error?: string }> {
  let user;
  try {
    user = await requireStudentOrAdmin();
  } catch (authErr: any) {
    return { success: false, error: authErr.message || "Unauthorized: Student or Admin session required." };
  }

  const parsed = activitySchema.partial().safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => `${i.path.join(".") || "field"}: ${i.message}`).join("; ");
    return { success: false, error: errorMsg };
  }
  const validated = parsed.data;

  try {
    const db = await getDb();
    let resetToReview = false;
    if (user.role === "student") {
      const existing = await db.select().from(activities).where(eq(activities.id, id)).limit(1);
      if (!existing.length || existing[0].submittedBy !== user.id) {
        return { success: false, error: "You can only edit your own activity proposals." };
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
      return { success: false, error: "Activity not found." };
    }

    await logAudit({
      actor: user,
      action: user.role === "admin" ? "ADMIN_UPDATED_ACTIVITY" : "STUDENT_UPDATED_ACTIVITY",
      resource: "activities",
      resourceId: String(id),
      details: { id, title: validated.title, category: validated.category },
    });

    flushActivitiesCache();
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update activity:", err);
    return { success: false, error: err?.message || "Database error updating activity." };
  }
}

export async function setActivityReviewStatusAction(
  id: number,
  reviewStatus: "published" | "pending_review" | "archived"
): Promise<{ success: boolean; error?: string }> {
  let user;
  try {
    user = await requireAdmin();
  } catch (authErr: any) {
    return { success: false, error: authErr.message || "Unauthorized: Administrator role required." };
  }

  const validStatus = z.enum(["published", "pending_review", "archived"]).safeParse(reviewStatus);
  if (!validStatus.success) {
    return { success: false, error: "Invalid status value." };
  }

  try {
    const db = await getDb();
    const updated = await db
      .update(activities)
      .set({ reviewStatus: validStatus.data, updatedAt: new Date().toISOString() })
      .where(eq(activities.id, id))
      .returning({ id: activities.id });

    if (!updated.length) return { success: false, error: "Activity not found." };

    await logAudit({
      actor: user,
      action: `ADMIN_SET_ACTIVITY_STATUS_${validStatus.data.toUpperCase()}`,
      resource: "activities",
      resourceId: String(id),
      details: { reviewStatus: validStatus.data },
    });

    flushActivitiesCache();
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update activity status:", err);
    return { success: false, error: err?.message || "Database error updating activity status." };
  }
}

export async function deleteActivityAction(id: number): Promise<{ success: boolean; error?: string }> {
  let user;
  try {
    user = await requireAdmin();
  } catch (authErr: any) {
    return { success: false, error: authErr.message || "Unauthorized: Administrator role required." };
  }

  try {
    const db = await getDb();
    await db.delete(activities).where(eq(activities.id, id));
    await logAudit({
      actor: user,
      action: "ADMIN_DELETED_ACTIVITY",
      resource: "activities",
      resourceId: String(id),
    });
    flushActivitiesCache();
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete activity:", err);
    return { success: false, error: err?.message || "Database error deleting activity." };
  }
}
