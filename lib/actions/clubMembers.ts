"use server";

import { getDb, clubMembers, clubs, NewClubMember } from "@/lib/db";
import { and, asc, eq } from "drizzle-orm";
import { requireAdmin, logAudit } from "@/lib/auth/rbac";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const memberSchema = z.object({
  studentName: z.string().min(2).max(200),
  grade: z.string().max(100).optional().nullable(),
  contactEmail: z.string().email().optional().or(z.literal("")).nullable(),
  contactPhone: z.string().max(50).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export async function getClubMembersAction(clubId: number) {
  await requireAdmin();
  const db = await getDb();

  return db
    .select()
    .from(clubMembers)
    .where(eq(clubMembers.clubId, clubId))
    .orderBy(asc(clubMembers.studentName));
}

export async function addClubMemberAction(
  clubId: number,
  data: unknown
): Promise<{ success: boolean; error?: string; id?: number }> {
  const user = await requireAdmin();

  const parsedClubId = z.number().int().positive().safeParse(clubId);
  if (!parsedClubId.success) {
    return { success: false, error: "Invalid club." };
  }

  const parsed = memberSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please provide a valid student name (and a valid email if entered).",
      ...({ fieldErrors: parsed.error.flatten().fieldErrors } as object),
    };
  }
  const validated = parsed.data;

  const db = await getDb();

  // Verify the club exists before attaching a member
  const clubExists = await db
    .select({ id: clubs.id })
    .from(clubs)
    .where(eq(clubs.id, parsedClubId.data))
    .limit(1);

  if (!clubExists.length) {
    return { success: false, error: "Club not found. It may have been deleted." };
  }

  // Prevent duplicate active memberships for the same student in the same club
  const duplicate = await db
    .select({ id: clubMembers.id })
    .from(clubMembers)
    .where(
      and(
        eq(clubMembers.clubId, parsedClubId.data),
        eq(clubMembers.studentName, validated.studentName.trim()),
        eq(clubMembers.status, "active")
      )
    )
    .limit(1);

  if (duplicate.length) {
    return { success: false, error: `${validated.studentName} is already an active member of this club.` };
  }

  const insertData: NewClubMember = {
    clubId: parsedClubId.data,
    studentName: validated.studentName.trim(),
    grade: validated.grade || null,
    contactEmail: validated.contactEmail || null,
    contactPhone: validated.contactPhone || null,
    notes: validated.notes || null,
    status: "active",
    addedBy: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await db.insert(clubMembers).values(insertData).returning({ id: clubMembers.id });

  await logAudit({
    actor: user,
    action: "ADMIN_ADDED_CLUB_MEMBER",
    resource: "club_members",
    resourceId: String(result[0]?.id),
    details: { clubId: parsedClubId.data, studentName: validated.studentName },
  });

  revalidatePath("/clubs");
  revalidatePath("/admin/clubs");
  return { success: true, id: result[0]?.id };
}

export async function removeClubMemberAction(memberId: number): Promise<{ success: boolean; error?: string }> {
  const user = await requireAdmin();
  const db = await getDb();

  const deleted = await db
    .delete(clubMembers)
    .where(eq(clubMembers.id, memberId))
    .returning({ id: clubMembers.id });

  if (!deleted.length) {
    return { success: false, error: "Membership record not found." };
  }

  await logAudit({
    actor: user,
    action: "ADMIN_REMOVED_CLUB_MEMBER",
    resource: "club_members",
    resourceId: String(memberId),
  });

  revalidatePath("/clubs");
  revalidatePath("/admin/clubs");
  return { success: true };
}
