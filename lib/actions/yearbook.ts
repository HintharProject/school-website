"use server";

import {
  getDb,
  yearbookBatches,
  yearbookAlumni,
  type NewYearbookScholar,
} from "@/lib/db";
import { and, asc, desc, eq, getTableColumns, or } from "drizzle-orm";
import { requireAdmin, requireStudentOrAdmin, logAudit } from "@/lib/auth/rbac";
import { cachedPublicRead, invalidatePublicCache } from "@/lib/cache/publicCache";
import { z } from "zod";

const yearbookSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(200),
  batchId: z.string().trim().min(1, "Batch is required.").max(100),
  role: z.string().trim().min(1, "Role/Track is required.").max(200),
  roleMy: z.string().trim().max(200).optional().nullable(),
  destination: z.string().trim().max(300).optional().nullable(),
  subjects: z.string().trim().max(500).optional().nullable(),
  quote: z.string().trim().min(1, "Quote is required.").max(1000),
  quoteMy: z.string().trim().max(1000).optional().nullable(),
  image: z.preprocess(
    (val) => (typeof val === "string" && val.trim() ? val.trim() : "/images/g5.jpg"),
    z.string().trim().min(1)
  ),
  badge: z.string().trim().max(120).optional().nullable(),
  badgeMy: z.string().trim().max(120).optional().nullable(),
});

const batchSchema = z.object({
  name: z.string().trim().min(2, "Batch name must be at least 2 characters.").max(100),
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

async function requireBatch(batchId: string, enforceActive = true) {
  const db = await getDb();
  const found = await db
    .select()
    .from(yearbookBatches)
    .where(eq(yearbookBatches.id, batchId))
    .limit(1);
  if (!found.length) {
    throw new Error(`Batch "${batchId}" not found.`);
  }
  if (enforceActive && !found[0].isActive) {
    throw new Error(`Batch "${found[0].name}" is currently archived.`);
  }
  return found[0];
}

/** Public cached batch reader. */
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

/** Public cached yearbook alumni reader. */
export async function getPublicYearbook() {
  return cachedPublicRead("public-yearbook-alumni", ["yearbook"], async () => {
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

export async function getPortalYearbookBatches(includeInactive = false) {
  try {
    const user = await requireStudentOrAdmin();
    const db = await getDb();
    const showInactive = includeInactive && user.role === "admin";
    return await db
      .select()
      .from(yearbookBatches)
      .where(showInactive ? undefined : eq(yearbookBatches.isActive, true))
      .orderBy(asc(yearbookBatches.region), desc(yearbookBatches.sortOrder), desc(yearbookBatches.createdAt));
  } catch (err) {
    console.warn("getPortalYearbookBatches failed:", err);
    return [];
  }
}

export async function getPortalYearbook() {
  try {
    const user = await requireStudentOrAdmin();
    const db = await getDb();
    const baseOrder = [
      asc(yearbookBatches.region),
      desc(yearbookBatches.sortOrder),
      desc(yearbookAlumni.id),
    ] as const;

    if (user.role === "admin") {
      return await db
        .select(yearbookSelection)
        .from(yearbookAlumni)
        .innerJoin(yearbookBatches, eq(yearbookAlumni.batchId, yearbookBatches.id))
        .orderBy(...baseOrder);
    }

    return await db
      .select(yearbookSelection)
      .from(yearbookAlumni)
      .innerJoin(yearbookBatches, eq(yearbookAlumni.batchId, yearbookBatches.id))
      .where(or(eq(yearbookAlumni.status, "published"), eq(yearbookAlumni.submittedBy, user.id)))
      .orderBy(...baseOrder);
  } catch (err) {
    console.warn("getPortalYearbook failed:", err);
    return [];
  }
}

export async function createYearbookBatchAction(data: unknown): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  let user;
  try {
    user = await requireAdmin();
  } catch (authErr: any) {
    return { success: false, error: authErr.message || "Unauthorized: Administrator role required." };
  }

  const parsed = batchSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const validated = parsed.data;

  try {
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
    return { success: true, id };
  } catch (err: any) {
    console.error("Failed to create yearbook batch:", err);
    return { success: false, error: err?.message || "Database error creating yearbook batch." };
  }
}

export async function updateYearbookBatchAction(
  id: string,
  data: unknown
): Promise<{ success: boolean; error?: string }> {
  let user;
  try {
    user = await requireAdmin();
  } catch (authErr: any) {
    return { success: false, error: authErr.message || "Unauthorized: Administrator role required." };
  }

  const parsed = batchSchema.partial().safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const validated = parsed.data;

  try {
    const db = await getDb();
    const updated = await db
      .update(yearbookBatches)
      .set({ ...validated, updatedAt: new Date().toISOString() })
      .where(eq(yearbookBatches.id, id))
      .returning({ id: yearbookBatches.id });
    if (!updated.length) return { success: false, error: "Batch not found." };
    await logAudit({
      actor: user,
      action: "ADMIN_UPDATED_YEARBOOK_BATCH",
      resource: "yearbook_batches",
      resourceId: id,
      details: validated,
    });
    flushYearbookCache();
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update yearbook batch:", err);
    return { success: false, error: err?.message || "Database error updating yearbook batch." };
  }
}

export async function deleteYearbookBatchAction(id: string): Promise<{ success: boolean; error?: string }> {
  let user;
  try {
    user = await requireAdmin();
  } catch (authErr: any) {
    return { success: false, error: authErr.message || "Unauthorized: Administrator role required." };
  }

  try {
    const db = await getDb();
    const inUse = await db
      .select({ id: yearbookAlumni.id })
      .from(yearbookAlumni)
      .where(eq(yearbookAlumni.batchId, id))
      .limit(1);
    if (inUse.length > 0) {
      return {
        success: false,
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
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete yearbook batch:", err);
    return { success: false, error: err?.message || "Database error deleting yearbook batch." };
  }
}

export async function createYearbookAction(data: unknown): Promise<{
  success: boolean;
  id?: number;
  status?: string;
  error?: string;
}> {
  let user;
  try {
    user = await requireStudentOrAdmin();
  } catch (authErr: any) {
    return { success: false, error: authErr.message || "Unauthorized: Student or Admin session required." };
  }

  const parsed = yearbookSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const validated = parsed.data;

  try {
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
    return { success: true, id: result[0]?.id, status };
  } catch (err: any) {
    console.error("Failed to create yearbook entry:", err);
    return { success: false, error: err?.message || "Database error creating yearbook entry." };
  }
}

export async function updateYearbookAction(
  id: number,
  data: unknown
): Promise<{ success: boolean; error?: string }> {
  let user;
  try {
    user = await requireStudentOrAdmin();
  } catch (authErr: any) {
    return { success: false, error: authErr.message || "Unauthorized: Student or Admin session required." };
  }

  const parsed = yearbookSchema.partial().safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const validated = parsed.data;

  try {
    const db = await getDb();
    const existing = await db.select().from(yearbookAlumni).where(eq(yearbookAlumni.id, id)).limit(1);
    if (!existing.length) {
      return { success: false, error: "Yearbook entry not found." };
    }

    let nextStatus = existing[0].status;
    if (user.role === "student") {
      if (existing[0].submittedBy !== user.id) {
        return { success: false, error: "You can only edit your own Yearbook submission." };
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
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update yearbook entry:", err);
    return { success: false, error: err?.message || "Database error updating yearbook entry." };
  }
}

export async function setYearbookStatusAction(
  id: number,
  status: "published" | "pending_review" | "archived",
  reviewerNotes?: string
): Promise<{ success: boolean; error?: string }> {
  let user;
  try {
    user = await requireAdmin();
  } catch (authErr: any) {
    return { success: false, error: authErr.message || "Unauthorized: Administrator role required." };
  }

  const validStatus = z.enum(["published", "pending_review", "archived"]).safeParse(status);
  if (!validStatus.success) {
    return { success: false, error: "Invalid status value." };
  }

  try {
    const db = await getDb();
    const updated = await db
      .update(yearbookAlumni)
      .set({
        status: validStatus.data,
        reviewerNotes: reviewerNotes ?? null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(yearbookAlumni.id, id))
      .returning({ id: yearbookAlumni.id });

    if (!updated.length) return { success: false, error: "Entry not found." };

    await logAudit({
      actor: user,
      action: `ADMIN_SET_YEARBOOK_STATUS_${validStatus.data.toUpperCase()}`,
      resource: "yearbook_alumni",
      resourceId: String(id),
      details: { status: validStatus.data, reviewerNotes },
    });
    flushYearbookCache();
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update yearbook status:", err);
    return { success: false, error: err?.message || "Database error updating status." };
  }
}

export async function deleteYearbookAction(id: number): Promise<{ success: boolean; error?: string }> {
  let user;
  try {
    user = await requireAdmin();
  } catch (authErr: any) {
    return { success: false, error: authErr.message || "Unauthorized: Administrator role required." };
  }

  try {
    const db = await getDb();
    await db.delete(yearbookAlumni).where(eq(yearbookAlumni.id, id));
    await logAudit({
      actor: user,
      action: "ADMIN_DELETED_YEARBOOK_ENTRY",
      resource: "yearbook_alumni",
      resourceId: String(id),
    });
    flushYearbookCache();
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete yearbook entry:", err);
    return { success: false, error: err?.message || "Database error deleting yearbook entry." };
  }
}
