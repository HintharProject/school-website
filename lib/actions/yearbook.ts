"use server";

import { getDb, yearbookAlumni, NewYearbookScholar } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin, requireStudentOrAdmin, logAudit } from "@/lib/auth/rbac";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const yearbookSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.enum([
    "Class of 2026",
    "Class of 2025",
    "Class of 2024",
    "University Placements",
    "Competitions",
  ]),
  role: z.string().min(2).max(200),
  destination: z.string().optional().nullable(),
  subjects: z.string().optional().nullable(),
  quote: z.string().min(5),
  image: z.string().default("/images/g5.jpg"),
  badge: z.string().optional().nullable(),
  campus: z.string().default("both-campuses"),
});

export async function getYearbook() {
  const db = await getDb();
  return db
    .select()
    .from(yearbookAlumni)
    .orderBy(desc(yearbookAlumni.category), desc(yearbookAlumni.id));
}

export async function createYearbookAction(data: unknown) {
  const user = await requireStudentOrAdmin();
  const validated = yearbookSchema.parse(data);
  const db = await getDb();

  const isAutoPublished = user.role === "admin";
  const status = isAutoPublished ? "published" : "pending_review";

  const insertData: NewYearbookScholar = {
    ...validated,
    destination: validated.destination ?? null,
    subjects: validated.subjects ?? null,
    badge: validated.badge ?? null,
    status,
    submittedBy: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await db.insert(yearbookAlumni).values(insertData).returning({ id: yearbookAlumni.id });

  await logAudit({
    actor: user,
    action: user.role === "admin" ? "ADMIN_CREATED_YEARBOOK_ENTRY" : "STUDENT_SUBMITTED_YEARBOOK_ENTRY",
    resource: "yearbook_alumni",
    resourceId: String(result[0]?.id),
    details: { name: validated.name, category: validated.category, status },
  });

  revalidatePath("/yearbook");
  revalidatePath("/admin/yearbook");
  return { success: true, id: result[0]?.id, status };
}

export async function updateYearbookAction(id: number, data: unknown) {
  const user = await requireStudentOrAdmin();
  const validated = yearbookSchema.partial().parse(data);
  const db = await getDb();

  if (user.role === "student") {
    const existing = await db.select().from(yearbookAlumni).where(eq(yearbookAlumni.id, id)).limit(1);
    if (!existing.length || existing[0].submittedBy !== user.id) {
      throw new Error("FORBIDDEN: You can only edit your own yearbook submissions.");
    }
  }

  await db
    .update(yearbookAlumni)
    .set({
      ...validated,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(yearbookAlumni.id, id));

  await logAudit({
    actor: user,
    action: user.role === "admin" ? "ADMIN_UPDATED_YEARBOOK_ENTRY" : "STUDENT_UPDATED_YEARBOOK_ENTRY",
    resource: "yearbook_alumni",
    resourceId: String(id),
    details: validated,
  });

  revalidatePath("/yearbook");
  revalidatePath("/admin/yearbook");
  return { success: true };
}

export async function setYearbookStatusAction(id: number, status: "published" | "pending_review" | "archived", reviewerNotes?: string) {
  const user = await requireAdmin();
  const db = await getDb();

  await db
    .update(yearbookAlumni)
    .set({
      status,
      reviewerNotes: reviewerNotes ?? undefined,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(yearbookAlumni.id, id));

  await logAudit({
    actor: user,
    action: `ADMIN_SET_YEARBOOK_STATUS_${status.toUpperCase()}`,
    resource: "yearbook_alumni",
    resourceId: String(id),
    details: { status, reviewerNotes },
  });

  revalidatePath("/yearbook");
  revalidatePath("/admin/yearbook");
  return { success: true };
}

export async function deleteYearbookAction(id: number) {
  const user = await requireAdmin();
  const db = await getDb();

  await db.delete(yearbookAlumni).where(eq(yearbookAlumni.id, id));

  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_YEARBOOK_ENTRY",
    resource: "yearbook_alumni",
    resourceId: String(id),
  });

  revalidatePath("/yearbook");
  revalidatePath("/admin/yearbook");
  return { success: true };
}
