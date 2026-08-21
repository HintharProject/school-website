"use server";

import { getDb, campuses, NewCampus } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin, logAudit, getServerSession } from "@/lib/auth/rbac";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const campusSchema = z.object({
  id: z.string().min(2).max(100),
  name: z.string().min(2).max(200),
  city: z.enum(["Yangon", "Mawlamyine"]),
  tagline: z.string().min(5).max(300),
  address: z.string().min(5).max(500),
  phone: z.string().min(5).max(100),
  email: z.string().email(),
  officeHours: z.string().default("Mon–Sat: 08:30 AM – 05:00 PM"),
  gradesServed: z.string().min(2),
  facilities: z.array(z.string()).default([]),
  imageUrl: z.string().min(1),
  mapUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function getCampuses() {
  const db = await getDb();
  const rows = await db
    .select()
    .from(campuses)
    .orderBy(desc(campuses.city));

  return rows.map((r) => ({
    ...r,
    facilities: typeof r.facilities === "string" ? JSON.parse(r.facilities || "[]") : r.facilities,
  }));
}

export async function createCampusAction(data: unknown) {
  const user = await requireAdmin();
  const validated = campusSchema.parse(data);
  const db = await getDb();

  const insertData: NewCampus = {
    ...validated,
    facilities: JSON.stringify(validated.facilities),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.insert(campuses).values(insertData);

  await logAudit({
    actor: user,
    action: "ADMIN_CREATED_CAMPUS",
    resource: "campuses",
    resourceId: validated.id,
    details: { name: validated.name, city: validated.city },
  });

  revalidatePath("/campuses");
  revalidatePath("/admin/campuses");
  return { success: true };
}

export async function updateCampusAction(id: string, data: unknown) {
  const user = await requireAdmin();
  const validated = campusSchema.partial().parse(data);
  const db = await getDb();

  const updateData: Partial<NewCampus> = {
    ...validated,
    facilities: validated.facilities ? JSON.stringify(validated.facilities) : undefined,
    updatedAt: new Date().toISOString(),
  };

  await db
    .update(campuses)
    .set(updateData)
    .where(eq(campuses.id, id));

  await logAudit({
    actor: user,
    action: "ADMIN_UPDATED_CAMPUS",
    resource: "campuses",
    resourceId: id,
    details: validated,
  });

  revalidatePath("/campuses");
  revalidatePath("/admin/campuses");
  return { success: true };
}

export async function deleteCampusAction(id: string) {
  const user = await requireAdmin();
  const db = await getDb();

  await db.delete(campuses).where(eq(campuses.id, id));

  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_CAMPUS",
    resource: "campuses",
    resourceId: id,
  });

  revalidatePath("/campuses");
  revalidatePath("/admin/campuses");
  return { success: true };
}
