"use server";

import { getDb, testimonials } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth/rbac";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const testimonialSchema = z.object({
  authorName: z.string().min(2).max(200),
  authorRole: z.string().max(200).optional().nullable(),
  quote: z.string().min(5).max(2000),
  image: z.string().max(500).optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  status: z.enum(["published", "archived"]).default("published"),
});

export interface PublicTestimonial {
  id: number;
  authorName: string;
  authorRole: string | null;
  quote: string;
  image: string | null;
  rating: number | null;
}

/** Published testimonials for the homepage section. */
export async function getPublishedTestimonials(): Promise<PublicTestimonial[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select({
        id: testimonials.id,
        authorName: testimonials.authorName,
        authorRole: testimonials.authorRole,
        quote: testimonials.quote,
        image: testimonials.image,
        rating: testimonials.rating,
      })
      .from(testimonials)
      .where(eq(testimonials.status, "published"))
      .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
    return rows;
  } catch (err) {
    console.warn("getPublishedTestimonials note:", err);
    return [];
  }
}

/** All testimonials for the admin manager. */
export async function getAllTestimonials() {
  await requireAdmin();
  const db = await getDb();
  return db.select().from(testimonials).orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
}

export async function createTestimonialAction(
  data: unknown
): Promise<{ success: boolean; error?: string; id?: number }> {
  const user = await requireAdmin();
  const parsed = testimonialSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Please provide an author name and a quote." };
  }
  const validated = parsed.data;
  const db = await getDb();

  const result = await db
    .insert(testimonials)
    .values({
      authorName: validated.authorName.trim(),
      authorRole: validated.authorRole?.trim() || null,
      quote: validated.quote.trim(),
      image: validated.image?.trim() || null,
      rating: validated.rating ?? null,
      sortOrder: validated.sortOrder,
      status: validated.status,
    })
    .returning({ id: testimonials.id });

  await logAudit({
    actor: user,
    action: "ADMIN_CREATED_TESTIMONIAL",
    resource: "testimonials",
    resourceId: String(result[0]?.id),
    details: { authorName: validated.authorName },
  });

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { success: true, id: result[0]?.id };
}

export async function updateTestimonialAction(
  id: number,
  data: unknown
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAdmin();
  const parsed = testimonialSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Please provide an author name and a quote." };
  }
  const validated = parsed.data;
  const db = await getDb();

  const updated = await db
    .update(testimonials)
    .set({
      authorName: validated.authorName.trim(),
      authorRole: validated.authorRole?.trim() || null,
      quote: validated.quote.trim(),
      image: validated.image?.trim() || null,
      rating: validated.rating ?? null,
      sortOrder: validated.sortOrder,
      status: validated.status,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(testimonials.id, id))
    .returning({ id: testimonials.id });

  if (!updated.length) {
    return { success: false, error: "Testimonial not found." };
  }

  await logAudit({
    actor: user,
    action: "ADMIN_UPDATED_TESTIMONIAL",
    resource: "testimonials",
    resourceId: String(id),
  });

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { success: true };
}

export async function deleteTestimonialAction(id: number): Promise<{ success: boolean; error?: string }> {
  const user = await requireAdmin();
  const db = await getDb();

  const deleted = await db.delete(testimonials).where(eq(testimonials.id, id)).returning({ id: testimonials.id });
  if (!deleted.length) {
    return { success: false, error: "Testimonial not found." };
  }

  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_TESTIMONIAL",
    resource: "testimonials",
    resourceId: String(id),
  });

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { success: true };
}
