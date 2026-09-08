"use server";

import {
  getDb,
  academicPrograms,
  academicSubjects,
  programSubjectLinks,
  type NewAcademicProgram,
  type NewAcademicSubject,
} from "@/lib/db";
import type { CatalogProgram, CatalogSubject } from "@/lib/academic/catalog";
import { eq, desc, asc, inArray, and } from "drizzle-orm";
import { requireAdmin, requireStudentOrAdmin, logAudit } from "@/lib/auth/rbac";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const programSchema = z.object({
  id: z.string().min(2).max(100),
  nameEn: z.string().min(2).max(300),
  nameMy: z.string().max(300).optional().nullable(),
  summaryEn: z.string().max(500).optional().nullable(),
  summaryMy: z.string().max(500).optional().nullable(),
  descriptionEn: z.string().max(8000).optional().nullable(),
  descriptionMy: z.string().max(8000).optional().nullable(),
  curriculum: z.string().min(2).max(100),
  category: z.enum(["cambridge", "pearson", "vocational", "alevel", "foundation"]),
  duration: z.string().max(100).optional().nullable(),
  campus: z.enum(["yangon", "mawlamyine", "both"]),
  studyMode: z.string().max(200).optional().nullable(),
  programLevel: z.enum(["lower_secondary", "igcse", "ial"]).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  subjectIds: z.array(z.string()).default([]),
});

const subjectSchema = z.object({
  id: z.string().min(2).max(100),
  nameEn: z.string().min(2).max(200),
  nameMy: z.string().max(200).optional().nullable(),
  code: z.string().max(50).optional().nullable(),
  track: z.enum(["STEM", "Business", "Computing", "Languages", "General"]),
  isActive: z.boolean().default(true),
});

function mapSubjectRow(row: typeof academicSubjects.$inferSelect): CatalogSubject {
  return {
    id: row.id,
    nameEn: row.nameEn,
    nameMy: row.nameMy,
    code: row.code,
    track: row.track,
    isActive: row.isActive,
  };
}

async function loadProgramsWithSubjects(activeOnly = false): Promise<CatalogProgram[]> {
  const db = await getDb();
  const programRows = activeOnly
    ? await db
        .select()
        .from(academicPrograms)
        .where(eq(academicPrograms.isActive, true))
        .orderBy(asc(academicPrograms.sortOrder), desc(academicPrograms.createdAt))
    : await db
        .select()
        .from(academicPrograms)
        .orderBy(asc(academicPrograms.sortOrder), desc(academicPrograms.createdAt));

  if (!programRows.length) return [];

  const programIds = programRows.map((p) => p.id);
  const links = await db
    .select()
    .from(programSubjectLinks)
    .where(inArray(programSubjectLinks.programId, programIds));

  const subjectIds = [...new Set(links.map((l) => l.subjectId))];
  const subjectRows =
    subjectIds.length > 0
      ? await db
          .select()
          .from(academicSubjects)
          .where(
            activeOnly
              ? and(inArray(academicSubjects.id, subjectIds), eq(academicSubjects.isActive, true))
              : inArray(academicSubjects.id, subjectIds)
          )
      : [];

  const subjectById = new Map(subjectRows.map((s) => [s.id, mapSubjectRow(s)]));
  const subjectsByProgram = new Map<string, CatalogSubject[]>();
  for (const link of links) {
    const subject = subjectById.get(link.subjectId);
    if (!subject) continue;
    const list = subjectsByProgram.get(link.programId) ?? [];
    list.push(subject);
    subjectsByProgram.set(link.programId, list);
  }

  return programRows.map((p) => ({
    id: p.id,
    nameEn: p.nameEn,
    nameMy: p.nameMy,
    summaryEn: p.summaryEn,
    summaryMy: p.summaryMy,
    descriptionEn: p.descriptionEn,
    descriptionMy: p.descriptionMy,
    curriculum: p.curriculum,
    category: p.category,
    duration: p.duration,
    campus: p.campus,
    studyMode: p.studyMode,
    programLevel: p.programLevel,
    sortOrder: p.sortOrder,
    isActive: p.isActive,
    subjects: subjectsByProgram.get(p.id) ?? [],
  }));
}

export async function getPublicPrograms(): Promise<CatalogProgram[]> {
  return loadProgramsWithSubjects(true);
}

export async function getProgramsForAdmin(): Promise<CatalogProgram[]> {
  await requireStudentOrAdmin();
  return loadProgramsWithSubjects(false);
}

export async function getSubjectsForAdmin(): Promise<CatalogSubject[]> {
  await requireStudentOrAdmin();
  const db = await getDb();
  const rows = await db
    .select()
    .from(academicSubjects)
    .orderBy(asc(academicSubjects.nameEn));
  return rows.map(mapSubjectRow);
}

export async function getActiveProgramById(programId: string): Promise<CatalogProgram | null> {
  const programs = await getPublicPrograms();
  return programs.find((p) => p.id === programId) ?? null;
}

export async function getCatalogSubjectCount(): Promise<number> {
  const db = await getDb();
  const rows = await db
    .select({ id: academicPrograms.id })
    .from(academicPrograms)
    .where(eq(academicPrograms.isActive, true));
  return rows.length;
}

async function syncProgramSubjects(programId: string, subjectIds: string[]) {
  const db = await getDb();
  await db.delete(programSubjectLinks).where(eq(programSubjectLinks.programId, programId));
  if (subjectIds.length === 0) return;
  await db.insert(programSubjectLinks).values(
    subjectIds.map((subjectId) => ({ programId, subjectId }))
  );
}

function revalidateCatalogPaths() {
  revalidatePath("/classes");
  revalidatePath("/admin/classes");
  revalidatePath("/admission");
}

export async function createProgramAction(data: unknown) {
  const user = await requireStudentOrAdmin();
  const validated = programSchema.parse(data);
  const db = await getDb();
  const now = new Date().toISOString();
  const { subjectIds, ...programFields } = validated;

  const insertData: NewAcademicProgram = {
    ...programFields,
    nameMy: programFields.nameMy ?? null,
    summaryEn: programFields.summaryEn ?? null,
    summaryMy: programFields.summaryMy ?? null,
    descriptionEn: programFields.descriptionEn ?? null,
    descriptionMy: programFields.descriptionMy ?? null,
    duration: programFields.duration ?? null,
    studyMode: programFields.studyMode ?? null,
    programLevel: programFields.programLevel ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(academicPrograms).values(insertData);
  await syncProgramSubjects(validated.id, subjectIds);

  await logAudit({
    actor: user,
    action: user.role === "admin" ? "ADMIN_CREATED_PROGRAM" : "STUDENT_CREATED_PROGRAM",
    resource: "academic_programs",
    resourceId: validated.id,
    details: { nameEn: validated.nameEn },
  });

  revalidateCatalogPaths();
  return { success: true as const };
}

export async function updateProgramAction(id: string, data: unknown) {
  const user = await requireStudentOrAdmin();
  const validated = programSchema.partial().parse(data);
  const db = await getDb();
  const { subjectIds, ...programFields } = validated;

  const updated = await db
    .update(academicPrograms)
    .set({ ...programFields, updatedAt: new Date().toISOString() })
    .where(eq(academicPrograms.id, id))
    .returning({ id: academicPrograms.id });

  if (!updated.length) {
    return { success: false as const, error: "Program not found." };
  }

  if (subjectIds !== undefined) {
    await syncProgramSubjects(id, subjectIds);
  }

  await logAudit({
    actor: user,
    action: user.role === "admin" ? "ADMIN_UPDATED_PROGRAM" : "STUDENT_UPDATED_PROGRAM",
    resource: "academic_programs",
    resourceId: id,
    details: validated,
  });

  revalidateCatalogPaths();
  return { success: true as const };
}

export async function deleteProgramAction(id: string) {
  const user = await requireAdmin();
  const db = await getDb();
  await db.delete(academicPrograms).where(eq(academicPrograms.id, id));

  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_PROGRAM",
    resource: "academic_programs",
    resourceId: id,
  });

  revalidateCatalogPaths();
  return { success: true as const };
}

export async function createSubjectAction(data: unknown) {
  const user = await requireAdmin();
  const validated = subjectSchema.parse(data);
  const db = await getDb();
  const now = new Date().toISOString();

  const insertData: NewAcademicSubject = {
    ...validated,
    nameMy: validated.nameMy ?? null,
    code: validated.code ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(academicSubjects).values(insertData);

  await logAudit({
    actor: user,
    action: "ADMIN_CREATED_SUBJECT",
    resource: "academic_subjects",
    resourceId: validated.id,
    details: { nameEn: validated.nameEn },
  });

  revalidateCatalogPaths();
  return { success: true as const };
}

export async function updateSubjectAction(id: string, data: unknown) {
  const user = await requireAdmin();
  const validated = subjectSchema.partial().parse(data);
  const db = await getDb();

  const updated = await db
    .update(academicSubjects)
    .set({ ...validated, updatedAt: new Date().toISOString() })
    .where(eq(academicSubjects.id, id))
    .returning({ id: academicSubjects.id });

  if (!updated.length) {
    return { success: false as const, error: "Subject not found." };
  }

  await logAudit({
    actor: user,
    action: "ADMIN_UPDATED_SUBJECT",
    resource: "academic_subjects",
    resourceId: id,
    details: validated,
  });

  revalidateCatalogPaths();
  return { success: true as const };
}

export async function deleteSubjectAction(id: string) {
  const user = await requireAdmin();
  const db = await getDb();
  await db.delete(academicSubjects).where(eq(academicSubjects.id, id));

  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_SUBJECT",
    resource: "academic_subjects",
    resourceId: id,
  });

  revalidateCatalogPaths();
  return { success: true as const };
}

/** Admission + legacy siteContent bridge */
export async function getCatalogSubjectsAsLegacyEntries(): Promise<
  { id: string; name: string; nameMy?: string | null; track: string; level: string; code?: string; isActive: boolean }[]
> {
  const db = await getDb();
  const rows = await db.select().from(academicSubjects).orderBy(asc(academicSubjects.nameEn));
  if (!rows.length) return [];
  return rows.map((s) => ({
    id: s.id,
    name: s.nameEn,
    nameMy: s.nameMy,
    track: s.track,
    level: "Both",
    code: s.code ?? undefined,
    isActive: s.isActive,
  }));
}

export async function getSubjectsForProgramId(programId: string): Promise<CatalogSubject[]> {
  const program = await getActiveProgramById(programId);
  return program?.subjects ?? [];
}

export async function validateAdmissionSubjects(
  programId: string | null | undefined,
  selectedSubjects: string[],
  programLevel?: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const catalogRows = await getCatalogSubjectsAsLegacyEntries();
  const useCatalog = catalogRows.length > 0;

  if (programId && useCatalog) {
    const program = await getActiveProgramById(programId);
    if (!program) {
      return { ok: false, error: "The selected program is no longer available. Please refresh and choose again." };
    }
    const allowed = new Set(program.subjects.map((s) => s.nameEn));
    if (selectedSubjects.some((s) => !allowed.has(s))) {
      return {
        ok: false,
        error: "One or more selected subjects are not available for this program. Please refresh and choose again.",
      };
    }
    return { ok: true };
  }

  if (!useCatalog) {
    return { ok: true };
  }

  const activeNames = new Set(catalogRows.filter((s) => s.isActive).map((s) => s.name));
  if (selectedSubjects.some((s) => !activeNames.has(s))) {
    return { ok: false, error: "One or more selected subjects are no longer available." };
  }

  return { ok: true };
}
