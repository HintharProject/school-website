"use server";

import { getDb, staffProfiles } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth/rbac";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const staffSchema = z.object({
  name: z.string().min(2).max(200),
  role: z.string().min(2).max(200),
  department: z.string().max(100).default("General"),
  qualifications: z.string().max(500).optional().nullable(),
  bio: z.string().max(3000).optional().nullable(),
  email: z.string().max(200).optional().nullable(),
  phone: z.string().max(60).optional().nullable(),
  image: z.string().max(500).optional().nullable(),
  campusId: z.string().max(100).default("both-campuses"),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  status: z.enum(["published", "archived"]).default("published"),
});

export interface PublicStaffMember {
  id: number;
  name: string;
  role: string;
  department: string;
  qualifications: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  campusId: string;
}

/** Published staff profiles for the public directory, sorted by sortOrder. */
export async function getPublishedStaff(): Promise<PublicStaffMember[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select({
        id: staffProfiles.id,
        name: staffProfiles.name,
        role: staffProfiles.role,
        department: staffProfiles.department,
        qualifications: staffProfiles.qualifications,
        bio: staffProfiles.bio,
        email: staffProfiles.email,
        phone: staffProfiles.phone,
        image: staffProfiles.image,
        campusId: staffProfiles.campusId,
      })
      .from(staffProfiles)
      .where(eq(staffProfiles.status, "published"))
      .orderBy(asc(staffProfiles.sortOrder), asc(staffProfiles.name));
    return rows;
  } catch (err) {
    console.warn("getPublishedStaff note:", err);
    return [];
  }
}

/** All profiles for the admin manager. */
export async function getAllStaff() {
  await requireAdmin();
  const db = await getDb();
  return db.select().from(staffProfiles).orderBy(asc(staffProfiles.sortOrder), asc(staffProfiles.name));
}

export async function createStaffAction(
  data: unknown
): Promise<{ success: boolean; error?: string; id?: number }> {
  const user = await requireAdmin();
  const parsed = staffSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Please provide at least a name and a role." };
  }
  const validated = parsed.data;
  const db = await getDb();

  const result = await db
    .insert(staffProfiles)
    .values({
      name: validated.name.trim(),
      role: validated.role.trim(),
      department: validated.department.trim() || "General",
      qualifications: validated.qualifications?.trim() || null,
      bio: validated.bio?.trim() || null,
      email: validated.email?.trim() || null,
      phone: validated.phone?.trim() || null,
      image: validated.image?.trim() || null,
      campusId: validated.campusId || "both-campuses",
      sortOrder: validated.sortOrder,
      status: validated.status,
    })
    .returning({ id: staffProfiles.id });

  await logAudit({
    actor: user,
    action: "ADMIN_CREATED_STAFF_PROFILE",
    resource: "staff_profiles",
    resourceId: String(result[0]?.id),
    details: { name: validated.name, role: validated.role },
  });

  revalidatePath("/staff");
  revalidatePath("/admin/staff");
  return { success: true, id: result[0]?.id };
}

export async function updateStaffAction(
  id: number,
  data: unknown
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAdmin();
  const parsed = staffSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Please provide at least a name and a role." };
  }
  const validated = parsed.data;
  const db = await getDb();

  const updated = await db
    .update(staffProfiles)
    .set({
      name: validated.name.trim(),
      role: validated.role.trim(),
      department: validated.department.trim() || "General",
      qualifications: validated.qualifications?.trim() || null,
      bio: validated.bio?.trim() || null,
      email: validated.email?.trim() || null,
      phone: validated.phone?.trim() || null,
      image: validated.image?.trim() || null,
      campusId: validated.campusId || "both-campuses",
      sortOrder: validated.sortOrder,
      status: validated.status,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(staffProfiles.id, id))
    .returning({ id: staffProfiles.id });

  if (!updated.length) {
    return { success: false, error: "Staff profile not found." };
  }

  await logAudit({
    actor: user,
    action: "ADMIN_UPDATED_STAFF_PROFILE",
    resource: "staff_profiles",
    resourceId: String(id),
    details: { name: validated.name },
  });

  revalidatePath("/staff");
  revalidatePath("/admin/staff");
  return { success: true };
}

export async function deleteStaffAction(id: number): Promise<{ success: boolean; error?: string }> {
  const user = await requireAdmin();
  const db = await getDb();

  const deleted = await db.delete(staffProfiles).where(eq(staffProfiles.id, id)).returning({ id: staffProfiles.id });
  if (!deleted.length) {
    return { success: false, error: "Staff profile not found." };
  }

  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_STAFF_PROFILE",
    resource: "staff_profiles",
    resourceId: String(id),
  });

  revalidatePath("/staff");
  revalidatePath("/admin/staff");
  return { success: true };
}
