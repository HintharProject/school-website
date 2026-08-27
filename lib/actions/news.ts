"use server";

import { getDb, newsPosts } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth/rbac";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const newsSchema = z.object({
  title: z.string().min(3).max(300),
  excerpt: z.string().max(500).optional().nullable(),
  body: z.string().min(3).max(50000),
  category: z.string().max(60).default("Announcement"),
  image: z.string().max(500).optional().nullable(),
  status: z.enum(["published", "draft", "archived"]).default("published"),
});

export interface PublicNewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  image: string | null;
  publishedAt: string | null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Published posts for the public news page, newest first. */
export async function getPublishedNews(limit = 50): Promise<PublicNewsItem[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select({
        id: newsPosts.id,
        title: newsPosts.title,
        slug: newsPosts.slug,
        excerpt: newsPosts.excerpt,
        category: newsPosts.category,
        image: newsPosts.image,
        publishedAt: newsPosts.publishedAt,
      })
      .from(newsPosts)
      .where(eq(newsPosts.status, "published"))
      .orderBy(desc(newsPosts.publishedAt), desc(newsPosts.createdAt))
      .limit(limit);
    return rows;
  } catch (err) {
    console.warn("getPublishedNews note:", err);
    return [];
  }
}

/** Single published post by slug (public detail page). */
export async function getNewsBySlug(slug: string): Promise<PublicNewsItem & { body: string } | null> {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return null;
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(newsPosts)
      .where(and(eq(newsPosts.slug, slug), eq(newsPosts.status, "published")))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      category: row.category,
      image: row.image,
      publishedAt: row.publishedAt,
      body: row.body,
    };
  } catch (err) {
    console.warn("getNewsBySlug note:", err);
    return null;
  }
}

/** All posts for the admin manager, newest first. */
export async function getAllNews() {
  await requireAdmin();
  const db = await getDb();
  return db.select().from(newsPosts).orderBy(desc(newsPosts.createdAt));
}

export async function createNewsAction(
  data: unknown
): Promise<{ success: boolean; error?: string; slug?: string }> {
  const user = await requireAdmin();
  const parsed = newsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Please provide a title and a message body." };
  }
  const validated = parsed.data;
  const db = await getDb();

  const baseSlug = slugify(validated.title) || "post";
  let slug = baseSlug;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const clash = await db.select({ id: newsPosts.id }).from(newsPosts).where(eq(newsPosts.slug, slug)).limit(1);
    if (!clash.length) break;
    slug = `${baseSlug}-${attempt + 1}`;
  }

  await db.insert(newsPosts).values({
    title: validated.title.trim(),
    slug,
    excerpt: validated.excerpt?.trim() || validated.body.replace(/<[^>]*>/g, "").slice(0, 180),
    body: validated.body.trim(),
    category: validated.category.trim() || "Announcement",
    image: validated.image?.trim() || null,
    status: validated.status,
    publishedAt: validated.status === "published" ? new Date().toISOString() : null,
    createdBy: user.id,
  });

  await logAudit({
    actor: user,
    action: "ADMIN_CREATED_NEWS",
    resource: "news_posts",
    resourceId: slug,
    details: { title: validated.title, status: validated.status },
  });

  revalidatePath("/news");
  revalidatePath("/admin/news");
  return { success: true, slug };
}

export async function updateNewsAction(
  id: number,
  data: unknown
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAdmin();
  const parsed = newsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Please provide a title and a message body." };
  }
  const validated = parsed.data;
  const db = await getDb();

  const updated = await db
    .update(newsPosts)
    .set({
      title: validated.title.trim(),
      excerpt: validated.excerpt?.trim() || null,
      body: validated.body.trim(),
      category: validated.category.trim() || "Announcement",
      image: validated.image?.trim() || null,
      status: validated.status,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(newsPosts.id, id))
    .returning({ slug: newsPosts.slug, publishedAt: newsPosts.publishedAt });

  if (!updated.length) {
    return { success: false, error: "News post not found." };
  }

  // Stamp publishedAt on first publish
  if (validated.status === "published" && !updated[0].publishedAt) {
    await db.update(newsPosts).set({ publishedAt: new Date().toISOString() }).where(eq(newsPosts.id, id));
  }

  await logAudit({
    actor: user,
    action: "ADMIN_UPDATED_NEWS",
    resource: "news_posts",
    resourceId: String(id),
    details: { title: validated.title, status: validated.status },
  });

  revalidatePath("/news");
  revalidatePath("/admin/news");
  return { success: true };
}

export async function deleteNewsAction(id: number): Promise<{ success: boolean; error?: string }> {
  const user = await requireAdmin();
  const db = await getDb();

  const deleted = await db.delete(newsPosts).where(eq(newsPosts.id, id)).returning({ id: newsPosts.id });
  if (!deleted.length) {
    return { success: false, error: "News post not found." };
  }

  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_NEWS",
    resource: "news_posts",
    resourceId: String(id),
  });

  revalidatePath("/news");
  revalidatePath("/admin/news");
  return { success: true };
}
