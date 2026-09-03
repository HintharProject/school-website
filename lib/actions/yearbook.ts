"use server";

import {
  getDb,
  yearbookAlumni,
  yearbookBatches,
  type NewYearbookScholar,
} from "@/lib/db";
import { and, asc, desc, eq, getTableColumns, or } from "drizzle-orm";
import {
  getServerSession,
  logAudit,
  requireAdmin,
  requireStudentOrAdmin,
} from "@/lib/auth/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const yearbookSchema = z.object({
  name: z.string().trim().min(2).max(200),
  batchId: z.string().trim().min(1).max(100),
  role: z.string().trim().min(2).max(200),
  destination: z.string().trim().max(300).optional().nullable(),
  subjects: z.string().trim().max(500).optional().nullable(),
  quote: z.string().trim().min(5).max(1000),
  image: z.string().trim().min(1).default("/images/g5.jpg"),
  badge: z.string().trim().max(120).optional().nullable(),
});

const batchSchema = z.object({
  name: z.string().trim().min(2).max(100),
  region: z.enum(["Yangon", "Mawlamyine"]),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true),
});

const yearbookSelection = {
  ...getTableColumns(yearbookAlumni),
  batchName: yearbookBatches.name,
  batchRegion: yearbookBatches.region,
  batchSortOrder: yearbookBatches.sortOrder,
  batchIsActive: yearbookBatches.isActive,
};

function revalidateYearbook() {
  revalidatePath("/yearbook");
  revalidatePath("/admin/yearbook");
}

async function requireBatch(batchId: string, activeOnly: boolean) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(yearbookBatches)
    .where(
      activeOnly
        ? and(eq(yearbookBatches.id, batchId), eq(yearbookBatches.isActive, true))
        : eq(yearbookBatches.id, batchId)
    )
    .limit(1);
  if (!rows[0]) throw new Error("Please select an active Yearbook batch.");
  return rows[0];
}

export async function getYearbookBatches(options?: { includeInactive?: boolean }) {
  const db = await getDb();
  const includeInactive = options?.includeInactive === true;
  if (includeInactive) await requireAdmin();
  return db
    .select()
    .from(yearbookBatches)
    .where(includeInactive ? undefined : eq(yearbookBatches.isActive, true))
    .orderBy(asc(yearbookBatches.region), desc(yearbookBatches.sortOrder), desc(yearbookBatches.createdAt));
}

export async function createYearbookBatchAction(data: unknown) {
  const user = await requireAdmin();
  const validated = batchSchema.parse(data);
  const db = await getDb();
  const id = `${validated.region.toLowerCase()}-${crypto.randomUUID()}`;
  await db.insert(yearbookBatches).values({
    id,
    ...validated,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  await logAudit({
    actor: user,
    action: "ADMIN_CREATED_YEARBOOK_BATCH",
    resource: "yearbook_batches",
    resourceId: id,
    details: validated,
  });
  revalidateYearbook();
  return { success: true as const, id };
}

export async function updateYearbookBatchAction(id: string, data: unknown) {
  const user = await requireAdmin();
  const validated = batchSchema.partial().parse(data);
  const db = await getDb();
  const updated = await db
    .update(yearbookBatches)
    .set({ ...validated, updatedAt: new Date().toISOString() })
    .where(eq(yearbookBatches.id, id))
    .returning({ id: yearbookBatches.id });
  if (!updated.length) return { success: false as const, error: "Batch not found." };
  await logAudit({
    actor: user,
    action: "ADMIN_UPDATED_YEARBOOK_BATCH",
    resource: "yearbook_batches",
    resourceId: id,
    details: validated,
  });
  revalidateYearbook();
  return { success: true as const };
}

export async function getYearbook() {
  const db = await getDb();
  const { user } = await getServerSession();
  const baseOrder = [
    asc(yearbookBatches.region),
    desc(yearbookBatches.sortOrder),
    desc(yearbookAlumni.id),
  ] as const;

  if (!user) {
    return db
      .select(yearbookSelection)
      .from(yearbookAlumni)
      .innerJoin(yearbookBatches, eq(yearbookAlumni.batchId, yearbookBatches.id))
      .where(and(eq(yearbookAlumni.status, "published"), eq(yearbookBatches.isActive, true)))
      .orderBy(...baseOrder);
  }
  if (user.role === "admin") {
    return db
      .select(yearbookSelection)
      .from(yearbookAlumni)
      .innerJoin(yearbookBatches, eq(yearbookAlumni.batchId, yearbookBatches.id))
      .orderBy(...baseOrder);
  }
  return db
    .select(yearbookSelection)
    .from(yearbookAlumni)
    .innerJoin(yearbookBatches, eq(yearbookAlumni.batchId, yearbookBatches.id))
    .where(or(eq(yearbookAlumni.status, "published"), eq(yearbookAlumni.submittedBy, user.id)))
    .orderBy(...baseOrder);
}

export async function createYearbookAction(data: unknown) {
  const user = await requireStudentOrAdmin();
  const validated = yearbookSchema.parse(data);
  const batch = await requireBatch(validated.batchId, true);
  const db = await getDb();
  const status = user.role === "admin" ? "published" : "pending_review";
  const insertData: NewYearbookScholar = {
    ...validated,
    category: batch.name,
    campus: batch.region === "Yangon" ? "yangon-all" : "mawlamyine-campus",
    destination: validated.destination || null,
    subjects: validated.subjects || null,
    badge: validated.badge || null,
    status,
    submittedBy: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const result = await db
    .insert(yearbookAlumni)
    .values(insertData)
    .returning({ id: yearbookAlumni.id });
  await logAudit({
    actor: user,
    action: user.role === "admin" ? "ADMIN_CREATED_YEARBOOK_ENTRY" : "STUDENT_SUBMITTED_YEARBOOK_ENTRY",
    resource: "yearbook_alumni",
    resourceId: String(result[0]?.id),
    details: { name: validated.name, batchId: batch.id, batchName: batch.name, region: batch.region, status },
  });
  revalidateYearbook();
  return { success: true as const, id: result[0]?.id, status };
}

export async function updateYearbookAction(id: number, data: unknown) {
  const user = await requireStudentOrAdmin();
  const validated = yearbookSchema.partial().parse(data);
  const db = await getDb();
  const existing = await db.select().from(yearbookAlumni).where(eq(yearbookAlumni.id, id)).limit(1);
  if (!existing[0]) return { success: false as const, error: "Yearbook entry not found." };
  if (user.role === "student" && existing[0].submittedBy !== user.id) {
    return { success: false as const, error: "You can only edit your own yearbook submissions." };
  }

  const updateData: Partial<NewYearbookScholar> = {
    ...validated,
    updatedAt: new Date().toISOString(),
  };
  if (validated.batchId) {
    const batch = await requireBatch(validated.batchId, user.role === "student");
    updateData.category = batch.name;
    updateData.campus = batch.region === "Yangon" ? "yangon-all" : "mawlamyine-campus";
  }
  if (user.role === "student" && existing[0].status !== "pending_review") {
    updateData.status = "pending_review";
  }

  await db.update(yearbookAlumni).set(updateData).where(eq(yearbookAlumni.id, id));
  await logAudit({
    actor: user,
    action: user.role === "admin" ? "ADMIN_UPDATED_YEARBOOK_ENTRY" : "STUDENT_UPDATED_YEARBOOK_ENTRY",
    resource: "yearbook_alumni",
    resourceId: String(id),
    details: validated,
  });
  revalidateYearbook();
  return { success: true as const };
}

export async function setYearbookStatusAction(id: number, status: string, reviewerNotes?: string) {
  const user = await requireAdmin();
  const validStatus = z.enum(["published", "pending_review", "archived"]).parse(status);
  const db = await getDb();
  const updated = await db
    .update(yearbookAlumni)
    .set({ status: validStatus, reviewerNotes, updatedAt: new Date().toISOString() })
    .where(eq(yearbookAlumni.id, id))
    .returning({ id: yearbookAlumni.id });
  if (!updated.length) return { success: false as const, error: "Yearbook entry not found." };
  await logAudit({
    actor: user,
    action: `ADMIN_SET_YEARBOOK_STATUS_${validStatus.toUpperCase()}`,
    resource: "yearbook_alumni",
    resourceId: String(id),
    details: { status: validStatus, reviewerNotes },
  });
  revalidateYearbook();
  return { success: true as const };
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
  revalidateYearbook();
  return { success: true as const };
}
