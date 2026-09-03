"use server";

import { getDb, clubs, NewClub } from "@/lib/db";
import { eq, desc, or } from "drizzle-orm";
import { requireAdmin, requireStudentOrAdmin, logAudit, getServerSession } from "@/lib/auth/rbac";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const clubSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.enum([
    "STEM & Tech",
    "Academic & Debate",
    "STEM & Science",
    "Creative Arts",
    "Sports & Fitness",
  ]),
  icon: z.string().default("groups"),
  members: z.string().default("25+ Scholars"),
  meetingTime: z.string().min(2),
  leadership: z.string().min(2),
  description: z.string().min(5),
  image: z.string().default("/images/g2.jpg"),
  galleryUrls: z.array(z.string().min(1)).max(12).default([]),
  campus: z.string().default("both-campuses"),
  isActive: z.boolean().default(true),
});

export async function getClubs() {
  const db = await getDb();
  const { user } = await getServerSession();

  // Unauthenticated visitors only ever see published clubs.
  if (!user) {
    return db
      .select()
      .from(clubs)
      .where(eq(clubs.status, "published"))
      .orderBy(desc(clubs.id));
  }
  if (user.role === "admin") {
    return db.select().from(clubs).orderBy(desc(clubs.id));
  }
  // Students: published clubs plus their own submissions in any state.
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

  const isAutoPublished = user.role === "admin";
  const status = isAutoPublished ? "published" : "pending_review";

  const insertData: NewClub = {
    ...validated,
    galleryUrls: JSON.stringify(validated.galleryUrls),
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

  revalidatePath("/clubs");
  revalidatePath("/admin/clubs");
  return { success: true, id: result[0]?.id, status };
}

export async function updateClubAction(id: number, data: unknown) {
  const user = await requireStudentOrAdmin();
  const validated = clubSchema.partial().parse(data);
  const db = await getDb();

  // If student, verify ownership and preserve moderation flow
  let resetToReview = false;
  if (user.role === "student") {
    const existing = await db.select().from(clubs).where(eq(clubs.id, id)).limit(1);
    if (!existing.length || existing[0].submittedBy !== user.id) {
      return { success: false as const, error: "You can only edit your own club proposals." };
    }
    if (!existing[0].status || existing[0].status === "published" || existing[0].status === "archived") {
      resetToReview = true;
    }
  }

  const updateData: Partial<NewClub> = {
    ...validated,
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
    return { success: false as const, error: "Club not found. It may have been deleted." };
  }

  await logAudit({
    actor: user,
    action: user.role === "admin" ? "ADMIN_UPDATED_CLUB" : "STUDENT_UPDATED_CLUB",
    resource: "clubs",
    resourceId: String(id),
    details: validated,
  });

  revalidatePath("/clubs");
  revalidatePath("/admin/clubs");
  return { success: true };
}

export async function setClubStatusAction(id: number, status: string) {
  const user = await requireAdmin();
  const db = await getDb();

  const statusSchema = z.enum(["published", "pending_review", "archived"]);
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid club status." };
  }
  const validStatus = parsed.data;

  const updated = await db
    .update(clubs)
    .set({
      status: validStatus,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(clubs.id, id))
    .returning({ id: clubs.id });

  if (!updated.length) {
    return { success: false as const, error: "Club not found. It may have been deleted." };
  }

  await logAudit({
    actor: user,
    action: `ADMIN_SET_CLUB_STATUS_${validStatus.toUpperCase()}`,
    resource: "clubs",
    resourceId: String(id),
    details: { status: validStatus },
  });

  revalidatePath("/clubs");
  revalidatePath("/admin/clubs");
  return { success: true };
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

  revalidatePath("/clubs");
  revalidatePath("/admin/clubs");
  return { success: true };
}
