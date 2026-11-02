"use server";

import {
  getDb,
  yearbookAlumni,
  yearbookBatches,
  type NewYearbookScholar,
} from "@/lib/db";
import { and, asc, desc, eq, getTableColumns, or } from "drizzle-orm";
import {
  logAudit,
  requireAdmin,
  requireStudentOrAdmin,
} from "@/lib/auth/rbac";
import { cachedPublicRead, invalidatePublicCache } from "@/lib/cache/publicCache";
import { z } from "zod";

const yearbookSchema = z.object({
  name: z.string().trim().min(2).max(200),
  batchId: z.string().trim().min(1).max(100),
  role: z.string().trim().min(2).max(200),
  roleMy: z.string().trim().max(200).optional().nullable(),
  destination: z.string().trim().max(300).optional().nullable(),
  subjects: z.string().trim().max(500).optional().nullable(),
  quote: z.string().trim().min(5).max(1000),
  quoteMy: z.string().trim().max(1000).optional().nullable(),
  image: z.string().trim().min(1).default("/images/g5.jpg"),
  badge: z.string().trim().max(120).optional().nullable(),
  badgeMy: z.string().trim().max(120).optional().nullable(),
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

function flushYearbookCache() {
  invalidatePublicCache(["yearbook"], ["/yearbook", "/admin", "/admin/yearbook"]);
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
  if (!rows[0]) throw new Error("Please select a valid Yearbook batch.");
  return rows[0];
}

/** Fast cached public reader — never calls getServerSession(). */
export async function getPublicYearbookBatches() {
  return cachedPublicRead("public-yearbook-batches", ["yearbook"], async () => {
    try {
      const db = await getDb();
      return await db
        .select()
        .from(yearbookBatches)
        .where(eq(yearbookBatches.isActive, true))
        .orderBy(asc(yearbookBatches.region), desc(yearbookBatches.sortOrder), desc(yearbookBatches.createdAt));
    } catch {
      return [];
    }
  });
}

/** Fast cached public reader — strictly published entries in active batches. */
export async function getPublicYearbook() {
  return cachedPublicRead("public-yearbook-entries", ["yearbook"], async () => {
    try {
      const db = await getDb();
      return await db
        .select(yearbookSelection)
        .from(yearbookAlumni)
        .innerJoin(yearbookBatches, eq(yearbookAlumni.batchId, yearbookBatches.id))
        .where(and(eq(yearbookAlumni.status, "published"), eq(yearbookBatches.isActive, true)))
        .orderBy(asc(yearbookBatches.region), desc(yearbookBatches.sortOrder), desc(yearbookAlumni.id));
    } catch {
      return [];
    }
  });
}

/** Authenticated Portal reader for Admins & Student Contributors. */
export async function getPortalYearbookBatches(includeInactive = false) {
  const user = await requireStudentOrAdmin();
  const db = await getDb();
  const showInactive = includeInactive && user.role === "admin";
  return db
    .select()
    .from(yearbookBatches)
    .where(showInactive ? undefined : eq(yearbookBatches.isActive, true))
    .orderBy(asc(yearbookBatches.region), desc(yearbookBatches.sortOrder), desc(yearbookBatches.createdAt));
}

export async function getPortalYearbook() {
  const user = await requireStudentOrAdmin();
  const db = await getDb();
  const baseOrder = [
    asc(yearbookBatches.region),
    desc(yearbookBatches.sortOrder),
    desc(yearbookAlumni.id),
  ] as const;

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

export async function createYearbookBatchAction(data: unknown) {
  const user = await requireAdmin();
  const validated = batchSchema.parse(data);
  const db = await getDb();
  const slug = validated.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const id = `${validated.region.toLowerCase()}-${slug || Date.now()}`;
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
  flushYearbookCache();
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
  flushYearbookCache();
  return { success: true as const };
}

export async function deleteYearbookBatchAction(id: string) {
  const user = await requireAdmin();
  const db = await getDb();
  const inUse = await db
    .select({ id: yearbookAlumni.id })
    .from(yearbookAlumni)
    .where(eq(yearbookAlumni.batchId, id))
    .limit(1);
  if (inUse.length > 0) {
    return {
      success: false as const,
      error: "Cannot delete a batch that still contains student entries. Reassign or delete those entries first.",
    };
  }
  await db.delete(yearbookBatches).where(eq(yearbookBatches.id, id));
  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_YEARBOOK_BATCH",
    resource: "yearbook_batches",
    resourceId: id,
  });
  flushYearbookCache();
  return { success: true as const };
}

export async function createYearbookAction(data: unknown) {
  const user = await requireStudentOrAdmin();
  const validated = yearbookSchema.parse(data);
  const batch = await requireBatch(validated.batchId, user.role !== "admin");
  const db = await getDb();
  const status = user.role === "admin" ? "published" : "pending_review";

  const insertData: NewYearbookScholar = {
    name: validated.name,
    batchId: batch.id,
    category: batch.name,
    campus: batch.region === "Yangon" ? "yangon-all" : "mawlamyine-campus",
    role: validated.role,
    roleMy: validated.roleMy || null,
    destination: validated.destination || null,
    subjects: validated.subjects || null,
    quote: validated.quote,
    quoteMy: validated.quoteMy || null,
    image: validated.image || "/images/g5.jpg",
    badge: validated.badge || null,
    badgeMy: validated.badgeMy || null,
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
    details: { name: validated.name, batchId: batch.id, status },
  });
  flushYearbookCache();
  return { success: true as const, id: result[0]?.id, status };
}

export async function updateYearbookAction(id: number, data: unknown) {
  const user = await requireStudentOrAdmin();
  const validated = yearbookSchema.partial().parse(data);
  const db = await getDb();

  const existing = await db.select().from(yearbookAlumni).where(eq(yearbookAlumni.id, id)).limit(1);
  if (!existing.length) {
    return { success: false as const, error: "Yearbook entry not found." };
  }

  let nextStatus = existing[0].status;
  if (user.role === "student") {
    if (existing[0].submittedBy !== user.id) {
      return { success: false as const, error: "You can only edit your own Yearbook submission." };
    }
    nextStatus = "pending_review";
  }

  let category = existing[0].category;
  let campus = existing[0].campus;
  if (validated.batchId) {
    const batch = await requireBatch(validated.batchId, user.role !== "admin");
    category = batch.name;
    campus = batch.region === "Yangon" ? "yangon-all" : "mawlamyine-campus";
  }

  await db
    .update(yearbookAlumni)
    .set({
      ...validated,
      roleMy: validated.roleMy !== undefined ? validated.roleMy || null : undefined,
      quoteMy: validated.quoteMy !== undefined ? validated.quoteMy || null : undefined,
      badgeMy: validated.badgeMy !== undefined ? validated.badgeMy || null : undefined,
      destination: validated.destination !== undefined ? validated.destination || null : undefined,
      subjects: validated.subjects !== undefined ? validated.subjects || null : undefined,
      badge: validated.badge !== undefined ? validated.badge || null : undefined,
      category,
      campus,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(yearbookAlumni.id, id));

  await logAudit({
    actor: user,
    action: user.role === "admin" ? "ADMIN_UPDATED_YEARBOOK_ENTRY" : "STUDENT_UPDATED_YEARBOOK_ENTRY",
    resource: "yearbook_alumni",
    resourceId: String(id),
  });
  flushYearbookCache();
  return { success: true as const };
}

export async function setYearbookStatusAction(
  id: number,
  status: "published" | "pending_review" | "archived",
  reviewerNotes?: string
) {
  const user = await requireAdmin();
  const db = await getDb();
  const validStatus = z.enum(["published", "pending_review", "archived"]).parse(status);

  const updated = await db
    .update(yearbookAlumni)
    .set({
      status: validStatus,
      reviewerNotes: reviewerNotes ?? null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(yearbookAlumni.id, id))
    .returning({ id: yearbookAlumni.id });

  if (!updated.length) return { success: false as const, error: "Entry not found." };

  await logAudit({
    actor: user,
    action: `ADMIN_SET_YEARBOOK_STATUS_${validStatus.toUpperCase()}`,
    resource: "yearbook_alumni",
    resourceId: String(id),
    details: { status: validStatus, reviewerNotes },
  });
  flushYearbookCache();
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
  flushYearbookCache();
  return { success: true as const };
}
