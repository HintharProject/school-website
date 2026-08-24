"use server";

import { getDb, classesCourses, bulletinNotices, NewClassCourse, NewBulletinNotice } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin, requireStudentOrAdmin, logAudit } from "@/lib/auth/rbac";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const courseSchema = z.object({
  id: z.string().min(2).max(100),
  name: z.string().min(2).max(200),
  code: z.string().min(1).max(50),
  grade: z.enum(["Lower Secondary (Year 7–9)", "Pearson IGCSE", "Pearson IAL"]),
  category: z.enum(["STEM", "Business", "Computing", "Languages"]),
  time: z.string().min(2),
  instructor: z.string().min(2),
  room: z.string().optional().nullable(),
  credits: z.string().default("Core").optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

const bulletinSchema = z.object({
  title: z.string().min(3).max(300),
  date: z.string().min(4),
  type: z.enum(["Official Notice", "Academic", "General"]),
  content: z.string().min(5),
  isPinned: z.boolean().default(false),
});

export async function getCourses() {
  const db = await getDb();
  return db
    .select()
    .from(classesCourses)
    .orderBy(desc(classesCourses.createdAt));
}

export async function createCourseAction(data: unknown) {
  const user = await requireStudentOrAdmin();
  const validated = courseSchema.parse(data);
  const db = await getDb();

  const insertData: NewClassCourse = {
    ...validated,
    room: validated.room ?? null,
    credits: validated.credits ?? "Core",
    description: validated.description ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.insert(classesCourses).values(insertData);

  await logAudit({
    actor: user,
    action: user.role === "admin" ? "ADMIN_CREATED_COURSE" : "STUDENT_CREATED_COURSE",
    resource: "classes_courses",
    resourceId: validated.id,
    details: { name: validated.name, code: validated.code },
  });

  revalidatePath("/classes");
  revalidatePath("/admin/classes");
  return { success: true };
}

export async function updateCourseAction(id: string, data: unknown) {
  const user = await requireStudentOrAdmin();
  const validated = courseSchema.partial().parse(data);
  const db = await getDb();

  const updated = await db
    .update(classesCourses)
    .set({
      ...validated,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(classesCourses.id, id))
    .returning({ id: classesCourses.id });

  if (!updated.length) {
    return { success: false as const, error: "Course not found. It may have been deleted." };
  }

  await logAudit({
    actor: user,
    action: user.role === "admin" ? "ADMIN_UPDATED_COURSE" : "STUDENT_UPDATED_COURSE",
    resource: "classes_courses",
    resourceId: id,
    details: validated,
  });

  revalidatePath("/classes");
  revalidatePath("/admin/classes");
  return { success: true };
}

export async function deleteCourseAction(id: string) {
  const user = await requireAdmin();
  const db = await getDb();

  await db.delete(classesCourses).where(eq(classesCourses.id, id));

  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_COURSE",
    resource: "classes_courses",
    resourceId: id,
  });

  revalidatePath("/classes");
  revalidatePath("/admin/classes");
  return { success: true };
}

export async function getBulletins() {
  const db = await getDb();
  return db
    .select()
    .from(bulletinNotices)
    .orderBy(desc(bulletinNotices.isPinned), desc(bulletinNotices.id));
}

export async function createBulletinAction(data: unknown) {
  const user = await requireAdmin();
  const validated = bulletinSchema.parse(data);
  const db = await getDb();

  const result = await db.insert(bulletinNotices).values({
    ...validated,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).returning({ id: bulletinNotices.id });

  await logAudit({
    actor: user,
    action: "ADMIN_CREATED_BULLETIN",
    resource: "bulletin_notices",
    resourceId: String(result[0]?.id),
    details: { title: validated.title },
  });

  revalidatePath("/classes");
  revalidatePath("/admin/classes");
  return { success: true, id: result[0]?.id };
}

export async function deleteBulletinAction(id: number) {
  const user = await requireAdmin();
  const db = await getDb();

  await db.delete(bulletinNotices).where(eq(bulletinNotices.id, id));

  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_BULLETIN",
    resource: "bulletin_notices",
    resourceId: String(id),
  });

  revalidatePath("/classes");
  revalidatePath("/admin/classes");
  return { success: true };
}
