"use server";

import { getDb, activities, NewActivity } from "@/lib/db";
import { eq, desc, or } from "drizzle-orm";
import { requireAdmin, requireStudentOrAdmin, logAudit, getServerSession } from "@/lib/auth/rbac";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const activitySchema = z.object({
  clubId: z.number().optional().nullable(),
  title: z.string().min(2).max(200),
  category: z.enum(["academic", "sports", "cultural", "science"]),
  date: z.string().min(2),
  month: z.string().min(2).max(10),
  day: z.string().min(1).max(5),
  time: z.string().min(2),
  location: z.string().min(2),
  description: z.string().min(5),
  image: z.string().default("/images/engineering.avif"),
  status: z.enum(["Upcoming", "Active Registration", "Past Highlight"]).default("Upcoming"),
  campus: z.string().default("both-campuses"),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function getActivities() {
  const db = await getDb();
  const { user } = await getServerSession();

  if (!user) {
    return db
      .select()
      .from(activities)
      .where(eq(activities.reviewStatus, "published"))
      .orderBy(desc(activities.featured), desc(activities.id));
  }
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

  const isAutoPublished = user.role === "admin";
  const reviewStatus = isAutoPublished ? "published" : "pending_review";

  const insertData: NewActivity = {
    ...validated,
    clubId: validated.clubId ?? null,
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
    details: { title: validated.title, category: validated.category },
  });

  revalidatePath("/activities");
  revalidatePath("/admin/clubs");
  return { success: true, id: result[0]?.id };
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
    resetToReview =
      !existing[0].reviewStatus || existing[0].reviewStatus === "published" || existing[0].reviewStatus === "archived";
  }

  const updateData: Partial<NewActivity> = {
    ...validated,
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
    return { success: false as const, error: "Activity not found. It may have been deleted." };
  }

  await logAudit({
    actor: user,
    action: user.role === "admin" ? "ADMIN_UPDATED_ACTIVITY" : "STUDENT_UPDATED_ACTIVITY",
    resource: "activities",
    resourceId: String(id),
    details: validated,
  });

  revalidatePath("/activities");
  revalidatePath("/admin/clubs");
  return { success: true };
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

  revalidatePath("/activities");
  revalidatePath("/admin/clubs");
  return { success: true };
}
