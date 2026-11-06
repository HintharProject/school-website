"use server";

import { getDb, clubs, type NewClub } from "@/lib/db";
import { and, desc, eq, or } from "drizzle-orm";
import { requireAdmin, requireStudentOrAdmin, logAudit } from "@/lib/auth/rbac";
import { cachedPublicRead, invalidatePublicCache } from "@/lib/cache/publicCache";
import { z } from "zod";

const clubSchema = z.object({
  name: z.string().trim().min(2, "Club name must be at least 2 characters.").max(200),
  category: z.string().trim().min(2, "Category is required.").max(100),
  icon: z.string().trim().default("users"),
  members: z.string().trim().default("25+ Scholars"),
  meetingTime: z.string().trim().min(1, "Meeting schedule is required.").default("Schedule TBD"),
  meetingTimeMy: z.string().trim().optional().nullable(),
  leadership: z.string().trim().min(1, "Leadership/Advisor is required.").default("Advisor: Faculty Lead"),
  leadershipMy: z.string().trim().optional().nullable(),
  description: z.string().trim().min(2, "Club description must be at least 2 characters."),
  descriptionMy: z.string().trim().optional().nullable(),
  image: z.preprocess(
    (val) => (typeof val === "string" && val.trim() ? val.trim() : "/images/engineering.avif"),
    z.string().trim().min(1)
  ),
  galleryUrls: z.preprocess((val) => {
    if (Array.isArray(val)) {
      return val.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
    }
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          return parsed.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
        }
      } catch {
        return [];
      }
    }
    return [];
  }, z.array(z.string().trim()).max(24).default([])),
  campus: z.string().trim().default("both-campuses"),
  isActive: z.boolean().default(true),
});

function flushClubsCache() {
  invalidatePublicCache(["clubs"], ["/clubs", "/admin", "/admin/clubs"]);
}

/** Fast cached public reader — never calls getServerSession(). */
export async function getPublicClubs() {
  return cachedPublicRead("public-clubs", ["clubs"], async () => {
    try {
      const db = await getDb();
      return await db
        .select()
        .from(clubs)
        .where(and(eq(clubs.status, "published"), eq(clubs.isActive, true)))
        .orderBy(desc(clubs.id));
    } catch {
      return [];
    }
  });
}

/** Authenticated Portal reader for Admins & Student Contributors. */
export async function getPortalClubs() {
  try {
    const user = await requireStudentOrAdmin();
    const db = await getDb();
    if (user.role === "admin") {
      return await db.select().from(clubs).orderBy(desc(clubs.id));
    }
    return await db
      .select()
      .from(clubs)
      .where(or(eq(clubs.status, "published"), eq(clubs.submittedBy, user.id)))
      .orderBy(desc(clubs.id));
  } catch (err) {
    console.warn("getPortalClubs query failed:", err);
    return [];
  }
}

export async function createClubAction(data: unknown): Promise<{
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

  const parsed = clubSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => `${i.path.join(".") || "field"}: ${i.message}`).join("; ");
    return { success: false, error: errorMsg };
  }
  const validated = parsed.data;

  try {
    const db = await getDb();
    const status = user.role === "admin" ? "published" : "pending_review";

    const insertData: NewClub = {
      name: validated.name,
      category: validated.category,
      icon: validated.icon,
      members: validated.members,
      meetingTime: validated.meetingTime,
      meetingTimeMy: validated.meetingTimeMy || null,
      leadership: validated.leadership,
      leadershipMy: validated.leadershipMy || null,
      description: validated.description,
      descriptionMy: validated.descriptionMy || null,
      image: validated.image,
      galleryUrls: JSON.stringify(validated.galleryUrls),
      campus: validated.campus,
      isActive: validated.isActive,
      status,
      submittedBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.insert(clubs).values(insertData).returning({ id: clubs.id });

    await logAudit({
      actor: user,
      action: user.role === "admin" ? "ADMIN_CREATED_CLUB" : "STUDENT_PROPOSED_CLUB",
      resource: "clubs",
      resourceId: String(result[0]?.id),
      details: { name: validated.name, status, category: validated.category },
    });

    flushClubsCache();
    return { success: true, id: result[0]?.id, status };
  } catch (err: any) {
    console.error("Failed to create club:", err);
    return { success: false, error: err?.message || "Database error creating club." };
  }
}

export async function updateClubAction(
  id: number,
  data: unknown
): Promise<{ success: boolean; error?: string }> {
  let user;
  try {
    user = await requireStudentOrAdmin();
  } catch (authErr: any) {
    return { success: false, error: authErr.message || "Unauthorized: Student or Admin session required." };
  }

  const parsed = clubSchema.partial().safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => `${i.path.join(".") || "field"}: ${i.message}`).join("; ");
    return { success: false, error: errorMsg };
  }
  const validated = parsed.data;

  try {
    const db = await getDb();
    let resetToReview = false;
    if (user.role === "student") {
      const existing = await db.select().from(clubs).where(eq(clubs.id, id)).limit(1);
      if (!existing.length || existing[0].submittedBy !== user.id) {
        return { success: false, error: "You can only edit your own club proposals." };
      }
      resetToReview = true;
    }

    const updateData: Partial<NewClub> = {
      ...validated,
      meetingTimeMy: validated.meetingTimeMy !== undefined ? validated.meetingTimeMy || null : undefined,
      leadershipMy: validated.leadershipMy !== undefined ? validated.leadershipMy || null : undefined,
      descriptionMy: validated.descriptionMy !== undefined ? validated.descriptionMy || null : undefined,
      galleryUrls: validated.galleryUrls ? JSON.stringify(validated.galleryUrls) : undefined,
      updatedAt: new Date().toISOString(),
    };
    if (resetToReview) {
      updateData.status = "pending_review";
    }

    const updated = await db
      .update(clubs)
      .set(updateData)
      .where(eq(clubs.id, id))
      .returning({ id: clubs.id });

    if (!updated.length) {
      return { success: false, error: "Club not found." };
    }

    await logAudit({
      actor: user,
      action: user.role === "admin" ? "ADMIN_UPDATED_CLUB" : "STUDENT_UPDATED_CLUB",
      resource: "clubs",
      resourceId: String(id),
      details: { id, name: validated.name, category: validated.category },
    });

    flushClubsCache();
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update club:", err);
    return { success: false, error: err?.message || "Database error updating club." };
  }
}

export async function setClubStatusAction(
  id: number,
  status: "published" | "pending_review" | "archived"
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
      .update(clubs)
      .set({ status: validStatus.data, updatedAt: new Date().toISOString() })
      .where(eq(clubs.id, id))
      .returning({ id: clubs.id });

    if (!updated.length) return { success: false, error: "Club not found." };

    await logAudit({
      actor: user,
      action: `ADMIN_SET_CLUB_STATUS_${validStatus.data.toUpperCase()}`,
      resource: "clubs",
      resourceId: String(id),
      details: { status: validStatus.data },
    });

    flushClubsCache();
    return { success: true };
  } catch (err: any) {
    console.error("Failed to set club status:", err);
    return { success: false, error: err?.message || "Database error updating club status." };
  }
}

export async function deleteClubAction(id: number): Promise<{ success: boolean; error?: string }> {
  let user;
  try {
    user = await requireAdmin();
  } catch (authErr: any) {
    return { success: false, error: authErr.message || "Unauthorized: Administrator role required." };
  }

  try {
    const db = await getDb();
    await db.delete(clubs).where(eq(clubs.id, id));
    await logAudit({
      actor: user,
      action: "ADMIN_DELETED_CLUB",
      resource: "clubs",
      resourceId: String(id),
    });
    flushClubsCache();
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete club:", err);
    return { success: false, error: err?.message || "Database error deleting club." };
  }
}
