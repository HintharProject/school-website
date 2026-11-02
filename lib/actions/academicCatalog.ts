"use server";

import {
  getDb,
  academicPrograms,
  academicSubjects,
  programSubjectLinks,
} from "@/lib/db";
import type { CatalogProgram, CatalogSubject } from "@/lib/academic/catalog";
import {
  DEFAULT_PEARSON_PROGRAMS,
  DEFAULT_PEARSON_SUBJECTS,
} from "@/lib/content/defaults";
import { cachedPublicRead, invalidatePublicCache } from "@/lib/cache/publicCache";
import { eq, desc, asc, inArray, and } from "drizzle-orm";
import { requireAdmin, logAudit } from "@/lib/auth/rbac";
import { z } from "zod";

const programSchema = z.object({
  id: z.string().trim().min(2).max(100),
  nameEn: z.string().trim().min(2).max(300),
  nameMy: z.string().trim().max(300).optional().nullable(),
  badgeEn: z.string().trim().max(120).optional().nullable(),
  badgeMy: z.string().trim().max(120).optional().nullable(),
  ageRangeEn: z.string().trim().max(120).optional().nullable(),
  ageRangeMy: z.string().trim().max(120).optional().nullable(),
  summaryEn: z.string().trim().max(600).optional().nullable(),
  summaryMy: z.string().trim().max(600).optional().nullable(),
  descriptionEn: z.string().trim().max(8000).optional().nullable(),
  descriptionMy: z.string().trim().max(8000).optional().nullable(),
  highlightsEn: z.array(z.string().trim().min(1)).max(10).default([]),
  highlightsMy: z.array(z.string().trim()).max(10).default([]),
  curriculum: z.string().trim().min(2).max(100).default("Pearson Edexcel"),
  duration: z.string().trim().max(120).optional().nullable(),
  campus: z.enum(["yangon", "mawlamyine", "both"]).default("both"),
  studyMode: z.string().trim().max(200).optional().nullable(),
  programLevel: z.enum(["lower_secondary", "igcse", "ial"]).optional().nullable(),
  imageUrl: z.string().trim().max(500).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  subjectIds: z.array(z.string()).default([]),
});

const subjectSchema = z.object({
  id: z.string().trim().min(2).max(100),
  nameEn: z.string().trim().min(2).max(200),
  nameMy: z.string().trim().max(200).optional().nullable(),
  code: z.string().trim().max(50).optional().nullable(),
  level: z.enum(["Lower Secondary", "IGCSE", "IAL", "Both"]).default("Both"),
  track: z.enum(["STEM", "Business", "Computing", "Languages", "General"]).default("STEM"),
  isActive: z.boolean().default(true),
});

function parseStringArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((x) => String(x ?? "").trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function mapSubjectRow(row: typeof academicSubjects.$inferSelect): CatalogSubject {
  return {
    id: row.id,
    nameEn: row.nameEn,
    nameMy: row.nameMy,
    code: row.code,
    level: row.level || "Both",
    track: row.track || "STEM",
    isActive: row.isActive,
  };
}

function buildFallbackPrograms(): CatalogProgram[] {
  const subjectMap = new Map<string, CatalogSubject>(
    DEFAULT_PEARSON_SUBJECTS.map((s) => [
      s.id,
      {
        id: s.id,
        nameEn: s.nameEn,
        nameMy: s.nameMy,
        code: s.code,
        level: s.level,
        track: s.track,
        isActive: s.isActive,
      },
    ])
  );

  return DEFAULT_PEARSON_PROGRAMS.map((p) => ({
    id: p.id,
    nameEn: p.nameEn,
    nameMy: p.nameMy,
    badgeEn: p.badgeEn,
    badgeMy: p.badgeMy,
    ageRangeEn: p.ageRangeEn,
    ageRangeMy: p.ageRangeMy,
    summaryEn: p.summaryEn,
    summaryMy: p.summaryMy,
    descriptionEn: p.descriptionEn,
    descriptionMy: p.descriptionMy,
    highlightsEn: p.highlightsEn,
    highlightsMy: p.highlightsMy,
    curriculum: p.curriculum,
    duration: p.duration,
    campus: p.campus,
    studyMode: p.studyMode,
    programLevel: p.programLevel,
    imageUrl: p.imageUrl,
    sortOrder: p.sortOrder,
    isActive: true,
    subjects: p.subjectIds
      .map((id) => subjectMap.get(id))
      .filter((x): x is CatalogSubject => Boolean(x)),
  }));
}

async function loadProgramsFromDb(activeOnly: boolean): Promise<CatalogProgram[]> {
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
    badgeEn: p.badgeEn,
    badgeMy: p.badgeMy,
    ageRangeEn: p.ageRangeEn,
    ageRangeMy: p.ageRangeMy,
    summaryEn: p.summaryEn,
    summaryMy: p.summaryMy,
    descriptionEn: p.descriptionEn,
    descriptionMy: p.descriptionMy,
    highlightsEn: parseStringArray(p.highlightsEn),
    highlightsMy: parseStringArray(p.highlightsMy),
    curriculum: p.curriculum || "Pearson Edexcel",
    duration: p.duration,
    campus: p.campus,
    studyMode: p.studyMode,
    programLevel: p.programLevel,
    imageUrl: p.imageUrl,
    sortOrder: p.sortOrder,
    isActive: p.isActive,
    subjects: subjectsByProgram.get(p.id) ?? [],
  }));
}

/**
 * Cached public reader for Pearson Edexcel pathways + subjects.
 * Powers BOTH Home #classes AND /admission. Falls back to compiled defaults if DB is empty.
 */
export async function getPublicPrograms(): Promise<CatalogProgram[]> {
  return cachedPublicRead("public-pearson-programs", ["programs"], async () => {
    try {
      const fromDb = await loadProgramsFromDb(true);
      if (fromDb.length > 0) return fromDb;
    } catch {
      // Fallback to compiled Pearson defaults
    }
    return buildFallbackPrograms();
  });
}

export async function getPublicSubjects(): Promise<CatalogSubject[]> {
  return cachedPublicRead("public-pearson-subjects", ["programs"], async () => {
    try {
      const db = await getDb();
      const rows = await db
        .select()
        .from(academicSubjects)
        .where(eq(academicSubjects.isActive, true))
        .orderBy(asc(academicSubjects.track), asc(academicSubjects.nameEn));
      if (rows.length > 0) return rows.map(mapSubjectRow);
    } catch {
      // Fallback
    }
    return DEFAULT_PEARSON_SUBJECTS.map((s) => ({
      id: s.id,
      nameEn: s.nameEn,
      nameMy: s.nameMy,
      code: s.code,
      level: s.level,
      track: s.track,
      isActive: s.isActive,
    }));
  });
}

export async function getProgramsForAdmin(): Promise<CatalogProgram[]> {
  await requireAdmin();
  const fromDb = await loadProgramsFromDb(false);
  return fromDb.length > 0 ? fromDb : buildFallbackPrograms();
}

export async function getSubjectsForAdmin(): Promise<CatalogSubject[]> {
  await requireAdmin();
  const db = await getDb();
  const rows = await db
    .select()
    .from(academicSubjects)
    .orderBy(asc(academicSubjects.track), asc(academicSubjects.nameEn));
  if (rows.length > 0) return rows.map(mapSubjectRow);
  return DEFAULT_PEARSON_SUBJECTS.map((s) => ({
    id: s.id,
    nameEn: s.nameEn,
    nameMy: s.nameMy,
    code: s.code,
    level: s.level,
    track: s.track,
    isActive: s.isActive,
  }));
}

/** Ensures the D1 tables are populated with defaults before Admin mutates for the first time. */
async function ensureSeededIfEmpty() {
  const db = await getDb();
  const existingSubjects = await db.select({ id: academicSubjects.id }).from(academicSubjects).limit(1);
  if (existingSubjects.length === 0) {
    const now = new Date().toISOString();
    for (const s of DEFAULT_PEARSON_SUBJECTS) {
      await db
        .insert(academicSubjects)
        .values({
          id: s.id,
          nameEn: s.nameEn,
          nameMy: s.nameMy,
          code: s.code,
          level: s.level,
          track: s.track,
          isActive: s.isActive,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing();
    }
  }

  const existingPrograms = await db.select({ id: academicPrograms.id }).from(academicPrograms).limit(1);
  if (existingPrograms.length === 0) {
    const now = new Date().toISOString();
    for (const p of DEFAULT_PEARSON_PROGRAMS) {
      await db
        .insert(academicPrograms)
        .values({
          id: p.id,
          nameEn: p.nameEn,
          nameMy: p.nameMy,
          badgeEn: p.badgeEn,
          badgeMy: p.badgeMy,
          ageRangeEn: p.ageRangeEn,
          ageRangeMy: p.ageRangeMy,
          summaryEn: p.summaryEn,
          summaryMy: p.summaryMy,
          descriptionEn: p.descriptionEn,
          descriptionMy: p.descriptionMy,
          highlightsEn: JSON.stringify(p.highlightsEn),
          highlightsMy: JSON.stringify(p.highlightsMy),
          curriculum: p.curriculum,
          category: "pearson",
          duration: p.duration,
          campus: p.campus,
          studyMode: p.studyMode,
          programLevel: p.programLevel,
          imageUrl: p.imageUrl,
          sortOrder: p.sortOrder,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing();

      for (const subjectId of p.subjectIds) {
        await db
          .insert(programSubjectLinks)
          .values({ programId: p.id, subjectId })
          .onConflictDoNothing();
      }
    }
  }
}

export async function upsertProgramAction(
  data: unknown
): Promise<{ success: boolean; message: string }> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return { success: false, message: "Administrator session required." };
  }

  const parsed = programSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    };
  }

  const v = parsed.data;
  await ensureSeededIfEmpty();
  const db = await getDb();
  const now = new Date().toISOString();

  await db
    .insert(academicPrograms)
    .values({
      id: v.id,
      nameEn: v.nameEn,
      nameMy: v.nameMy || null,
      badgeEn: v.badgeEn || null,
      badgeMy: v.badgeMy || null,
      ageRangeEn: v.ageRangeEn || null,
      ageRangeMy: v.ageRangeMy || null,
      summaryEn: v.summaryEn || null,
      summaryMy: v.summaryMy || null,
      descriptionEn: v.descriptionEn || null,
      descriptionMy: v.descriptionMy || null,
      highlightsEn: JSON.stringify(v.highlightsEn),
      highlightsMy: JSON.stringify(v.highlightsMy.filter(Boolean)),
      curriculum: v.curriculum,
      category: "pearson",
      duration: v.duration || null,
      campus: v.campus,
      studyMode: v.studyMode || null,
      programLevel: v.programLevel || null,
      imageUrl: v.imageUrl || null,
      sortOrder: v.sortOrder,
      isActive: v.isActive,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: academicPrograms.id,
      set: {
        nameEn: v.nameEn,
        nameMy: v.nameMy || null,
        badgeEn: v.badgeEn || null,
        badgeMy: v.badgeMy || null,
        ageRangeEn: v.ageRangeEn || null,
        ageRangeMy: v.ageRangeMy || null,
        summaryEn: v.summaryEn || null,
        summaryMy: v.summaryMy || null,
        descriptionEn: v.descriptionEn || null,
        descriptionMy: v.descriptionMy || null,
        highlightsEn: JSON.stringify(v.highlightsEn),
        highlightsMy: JSON.stringify(v.highlightsMy.filter(Boolean)),
        curriculum: v.curriculum,
        category: "pearson",
        duration: v.duration || null,
        campus: v.campus,
        studyMode: v.studyMode || null,
        programLevel: v.programLevel || null,
        imageUrl: v.imageUrl || null,
        sortOrder: v.sortOrder,
        isActive: v.isActive,
        updatedAt: now,
      },
    });

  await db.delete(programSubjectLinks).where(eq(programSubjectLinks.programId, v.id));
  const uniqueIds = [...new Set(v.subjectIds)];
  for (const subjectId of uniqueIds) {
    await db.insert(programSubjectLinks).values({ programId: v.id, subjectId });
  }

  invalidatePublicCache(["programs"], ["/", "/admission", "/admin/home"]);
  await logAudit({
    actor: user,
    action: "ADMIN_UPSERTED_PEARSON_PROGRAM",
    resource: "academic_programs",
    resourceId: v.id,
    details: { nameEn: v.nameEn, campus: v.campus, subjectCount: uniqueIds.length },
  });

  return { success: true, message: `Pathway "${v.nameEn}" saved.` };
}

export async function deleteProgramAction(
  id: string
): Promise<{ success: boolean; message: string }> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return { success: false, message: "Administrator session required." };
  }
  await ensureSeededIfEmpty();
  const db = await getDb();
  await db.delete(academicPrograms).where(eq(academicPrograms.id, id));
  invalidatePublicCache(["programs"], ["/", "/admission", "/admin/home"]);
  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_PEARSON_PROGRAM",
    resource: "academic_programs",
    resourceId: id,
  });
  return { success: true, message: "Pathway deleted." };
}

export async function upsertSubjectAction(
  data: unknown
): Promise<{ success: boolean; message: string }> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return { success: false, message: "Administrator session required." };
  }
  const parsed = subjectSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    };
  }
  const v = parsed.data;
  await ensureSeededIfEmpty();
  const db = await getDb();
  const now = new Date().toISOString();

  await db
    .insert(academicSubjects)
    .values({
      id: v.id,
      nameEn: v.nameEn,
      nameMy: v.nameMy || null,
      code: v.code || null,
      level: v.level,
      track: v.track,
      isActive: v.isActive,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: academicSubjects.id,
      set: {
        nameEn: v.nameEn,
        nameMy: v.nameMy || null,
        code: v.code || null,
        level: v.level,
        track: v.track,
        isActive: v.isActive,
        updatedAt: now,
      },
    });

  invalidatePublicCache(["programs"], ["/", "/admission", "/admin/home"]);
  await logAudit({
    actor: user,
    action: "ADMIN_UPSERTED_PEARSON_SUBJECT",
    resource: "academic_subjects",
    resourceId: v.id,
    details: { nameEn: v.nameEn, code: v.code, track: v.track },
  });
  return { success: true, message: `Subject "${v.nameEn}" saved.` };
}

export async function deleteSubjectAction(
  id: string
): Promise<{ success: boolean; message: string }> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return { success: false, message: "Administrator session required." };
  }
  await ensureSeededIfEmpty();
  const db = await getDb();
  await db.delete(academicSubjects).where(eq(academicSubjects.id, id));
  invalidatePublicCache(["programs"], ["/", "/admission", "/admin/home"]);
  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_PEARSON_SUBJECT",
    resource: "academic_subjects",
    resourceId: id,
  });
  return { success: true, message: "Subject deleted." };
}

/**
 * Validates optional or selected subjects submitted during an admission application.
 */
export async function validateAdmissionSubjects(
  targetProgramId: string | null | undefined,
  selectedSubjects: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!selectedSubjects || selectedSubjects.length === 0) {
    return { ok: true };
  }

  const programs = await getPublicPrograms();
  if (targetProgramId) {
    const program = programs.find((p) => p.id === targetProgramId);
    if (!program) {
      return { ok: false, error: "Selected Pearson pathway is no longer active. Please refresh and choose again." };
    }
    if (program.subjects.length > 0) {
      const allowedNames = new Set(program.subjects.map((s) => s.nameEn));
      const allowedIds = new Set(program.subjects.map((s) => s.id));
      for (const sub of selectedSubjects) {
        if (!allowedNames.has(sub) && !allowedIds.has(sub)) {
          return { ok: false, error: `Subject "${sub}" is not offered in ${program.nameEn}.` };
        }
      }
    }
  }
  return { ok: true };
}
