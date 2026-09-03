"use server";

import { getDb, campuses, NewCampus } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin, logAudit } from "@/lib/auth/rbac";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export interface CampusActionResult {
  success: boolean;
  message: string;
}

const campusSchema = z.object({
  id: z.string().trim().min(2).max(100),
  name: z.string().trim().min(2).max(200),
  nameMy: z.string().trim().max(200).optional().nullable().or(z.literal("")),
  city: z.enum(["Yangon", "Mawlamyine"]),
  tagline: z.string().trim().min(5).max(300),
  taglineMy: z.string().trim().max(300).optional().nullable().or(z.literal("")),
  address: z.string().trim().min(5).max(500),
  addressMy: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  phone: z.string().trim().min(5).max(100),
  email: z.string().trim().email(),
  gradesServed: z.string().trim().min(2),
  imageUrl: z.string().trim().min(1),
  galleryUrls: z.array(z.string().trim().min(1)).max(12).default([]),
  mapUrl: z
    .string()
    .trim()
    .url()
    .optional()
    .nullable()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
});

/**
 * Revalidation must never fail an already-committed mutation.
 * (On Workers, revalidatePath can throw when no incremental cache is configured —
 * the D1 write has already succeeded at that point, so swallow/cache errors here.)
 */
function safeRevalidate(paths: string[]) {
  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch (err) {
      console.warn(`revalidatePath(${p}) skipped:`, err);
    }
  }
}

/** Trims incoming strings / drops empty optionals so stored rows validate cleanly. */
function normalizeCampusInput(data: unknown) {
  if (!data || typeof data !== "object") return data;
  const d = { ...(data as Record<string, unknown>) };
  const bilingualMyKeys = ["nameMy", "taglineMy", "addressMy"];
  for (const key of Object.keys(d)) {
    if (typeof d[key] === "string") {
      const trimmed = (d[key] as string).trim();
      if (!trimmed && (key === "mapUrl" || bilingualMyKeys.includes(key))) {
        d[key] = "";
        continue;
      }
      d[key] = trimmed;
    }
  }
  return d;
}

/** Converts a ZodError into a single human-readable sentence. */
function friendlyZodMessage(err: z.ZodError): string {
  return err.issues
    .map((i) => {
      const field = i.path.join(".") || "(form)";
      switch (i.message) {
        case "Invalid email":
          return `${field} is not a valid email address`;
        case "Invalid url":
          return `${field} must be a full URL (https://…)`;
        default:
          return `${field}: ${i.message}`;
      }
    })
    .join("; ");
}

async function auditCampus(
  actor: Awaited<ReturnType<typeof requireAdmin>>,
  action: string,
  id: string,
  details?: Record<string, unknown>
) {
  await logAudit({ actor, action, resource: "campuses", resourceId: id, details });
}

export async function getCampuses() {
  const db = await getDb();
  const rows = await db
    .select()
    .from(campuses)
    .orderBy(desc(campuses.city));

  return rows;
}

export async function createCampusAction(data: unknown): Promise<CampusActionResult> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return { success: false, message: "Your session has expired. Please sign in again." };
  }

  try {
    const validated = campusSchema.parse(normalizeCampusInput(data));
    const db = await getDb();

    const insertData: NewCampus = {
      ...validated,
      galleryUrls: JSON.stringify(validated.galleryUrls),
      mapUrl: validated.mapUrl || undefined,
      nameMy: (validated as Record<string, unknown>).nameMy ? (validated as Record<string, unknown>).nameMy as string : undefined,
      taglineMy: (validated as Record<string, unknown>).taglineMy ? (validated as Record<string, unknown>).taglineMy as string : undefined,
      addressMy: (validated as Record<string, unknown>).addressMy ? (validated as Record<string, unknown>).addressMy as string : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.insert(campuses).values(insertData);

    await auditCampus(user, "ADMIN_CREATED_CAMPUS", validated.id, {
      name: validated.name,
      city: validated.city,
    });

    safeRevalidate(["/campuses", "/admin/campuses"]);
    return { success: true, message: `Campus "${validated.name}" created.` };
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error("[createCampusAction] validation failed:", err.issues);
      return { success: false, message: `Please fix these fields — ${friendlyZodMessage(err)}` };
    }
    console.error("[createCampusAction] unexpected error:", err);
    return { success: false, message: "Could not create the campus. Please try again." };
  }
}

export async function updateCampusAction(id: string, data: unknown): Promise<CampusActionResult> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return { success: false, message: "Your session has expired. Please sign in again." };
  }

  try {
    const parsed = campusSchema.partial().parse(normalizeCampusInput(data));
    const db = await getDb();

    const updateData: Partial<NewCampus> = {
      ...parsed,
      galleryUrls: parsed.galleryUrls ? JSON.stringify(parsed.galleryUrls) : undefined,
      // empty string means "clear the link" — store null so it disappears from public pages
      mapUrl: parsed.mapUrl === "" ? null : parsed.mapUrl,
      nameMy: (parsed as Record<string, unknown>).nameMy === "" ? null : (parsed as Record<string, unknown>).nameMy as string | undefined,
      taglineMy: (parsed as Record<string, unknown>).taglineMy === "" ? null : (parsed as Record<string, unknown>).taglineMy as string | undefined,
      addressMy: (parsed as Record<string, unknown>).addressMy === "" ? null : (parsed as Record<string, unknown>).addressMy as string | undefined,
      updatedAt: new Date().toISOString(),
    } as Partial<NewCampus>;

    const updated = await db
      .update(campuses)
      .set(updateData)
      .where(eq(campuses.id, id))
      .returning({ id: campuses.id });

    if (updated.length === 0) {
      return { success: false, message: `Campus "${id}" was not found. It may have been deleted.` };
    }

    await auditCampus(user, "ADMIN_UPDATED_CAMPUS", id, parsed);

    safeRevalidate(["/campuses", "/admin/campuses"]);
    return { success: true, message: "Campus updated successfully." };
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error("[updateCampusAction] validation failed:", err.issues);
      return { success: false, message: `Please fix these fields — ${friendlyZodMessage(err)}` };
    }
    console.error(`[updateCampusAction] unexpected error for "${id}":`, err);
    return { success: false, message: "Could not save the campus changes. Please try again." };
  }
}

export async function deleteCampusAction(id: string): Promise<CampusActionResult> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return { success: false, message: "Your session has expired. Please sign in again." };
  }

  try {
    const db = await getDb();
    await db.delete(campuses).where(eq(campuses.id, id));

    await auditCampus(user, "ADMIN_DELETED_CAMPUS", id);

    safeRevalidate(["/campuses", "/admin/campuses"]);
    return { success: true, message: "Campus deleted." };
  } catch (err) {
    console.error(`[deleteCampusAction] unexpected error for "${id}":`, err);
    return { success: false, message: "Could not delete the campus. Please try again." };
  }
}
