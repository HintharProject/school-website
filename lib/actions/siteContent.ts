"use server";

import { getDb, siteContent } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth/rbac";
import {
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_CONTACT_INFO,
  DEFAULT_FAQS,
  DEFAULT_HIGHLIGHTS,
  DEFAULT_PROGRAMS,
  DEFAULT_SUBJECT_CATALOG,
  DEFAULT_ADMISSION_OPTIONS,
  SITE_CONTENT_KEYS,
  type ContactInfoItem,
  type FaqItem,
  type KeyHighlight,
  type AcademicProgram,
  type SiteContentKey,
  type SubjectEntry,
  type AdmissionOptions,
} from "@/lib/content/defaults";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";


export interface SiteContentMap {
  announcements?: string[];
  heroHighlights?: KeyHighlight[];
  faqs?: FaqItem[];
  programs?: AcademicProgram[];
  contactInfo?: ContactInfoItem[];
  subjectCatalog?: SubjectEntry[];
  admissionOptions?: AdmissionOptions;
}

export type {
  ContactInfoItem,
  FaqItem,
  KeyHighlight,
  AcademicProgram,
  SubjectEntry,
  AdmissionOptions,
};

/**
 * Reads every site-content override from D1 and parses the JSON payloads.
 * Safe to call publicly — invalid rows are skipped, never thrown.
 */
export async function getSiteContentMap(): Promise<SiteContentMap> {
  try {
    const db = await getDb();
    const rows = await db.select().from(siteContent);
    const map: SiteContentMap = {};

    for (const row of rows) {
      if (!(SITE_CONTENT_KEYS as readonly string[]).includes(row.key)) continue;
      try {
        const parsed = JSON.parse(row.value);
        (map as Record<string, unknown>)[row.key] = parsed;
      } catch {
        console.warn(`site_content "${row.key}" holds invalid JSON — skipped.`);
      }
    }

    return map;
  } catch (err) {
    console.warn("getSiteContentMap note:", err);
    return {};
  }
}

/** Merged view (defaults + overrides) used by the admin editor. */
export async function getEffectiveSiteContent(): Promise<Required<SiteContentMap>> {
  const overrides = await getSiteContentMap();
  return {
    announcements: overrides.announcements ?? DEFAULT_ANNOUNCEMENTS,
    heroHighlights: overrides.heroHighlights ?? DEFAULT_HIGHLIGHTS,
    faqs: overrides.faqs ?? DEFAULT_FAQS,
    programs: overrides.programs ?? DEFAULT_PROGRAMS,
    contactInfo: overrides.contactInfo ?? DEFAULT_CONTACT_INFO,
    subjectCatalog: overrides.subjectCatalog ?? DEFAULT_SUBJECT_CATALOG,
    admissionOptions: overrides.admissionOptions ?? DEFAULT_ADMISSION_OPTIONS,
  };
}

function parsePayload(key: SiteContentKey, value: unknown): string | null {
  try {
    switch (key) {
      case "announcements":
        if (!Array.isArray(value) || value.some((v) => typeof v !== "string" || v.trim().length < 3)) return null;
        return JSON.stringify(value.map((v: string) => v.trim()));
      case "heroHighlights":
        if (!Array.isArray(value)) return null;
        for (const h of value) {
          if (typeof h?.value !== "string" || typeof h?.label !== "string") return null;
        }
        return JSON.stringify(value);
      case "faqs":
        if (!Array.isArray(value)) return null;
        for (const f of value) {
          if (typeof f?.question !== "string" || typeof f?.answer !== "string" || !f.question.trim() || !f.answer.trim())
            return null;
        }
        return JSON.stringify(
          value.map((f: FaqItem, i: number) => ({
            id: String(f.id || `faq-${i + 1}`),
            question: f.question.trim(),
            answer: f.answer.trim(),
          }))
        );
      case "programs":
        if (!Array.isArray(value)) return null;
        for (const p of value) {
          if (
            typeof p?.title !== "string" ||
            typeof p?.description !== "string" ||
            !Array.isArray(p?.highlights)
          )
            return null;
        }
        return JSON.stringify(value);
      case "contactInfo":
        if (!Array.isArray(value)) return null;
        for (const c of value) {
          if (typeof c?.text !== "string" || typeof c?.href !== "string") return null;
        }
        return JSON.stringify(value);
      case "subjectCatalog":
        if (!Array.isArray(value)) return null;
        for (const s of value) {
          if (
            typeof s?.id !== "string" ||
            typeof s?.name !== "string" ||
            typeof s?.track !== "string" ||
            typeof s?.level !== "string"
          ) return null;
        }
        return JSON.stringify(value);
      case "admissionOptions": {
        if (!value || typeof value !== "object") return null;
        const v = value as Record<string, unknown>;
        const lists: (keyof AdmissionOptions)[] = ["intendedStartTerms", "studyModes", "academicStreams", "relationships"];
        for (const k of lists) {
          if (!Array.isArray(v[k]) || (v[k] as unknown[]).some((s) => typeof s !== "string" || (s as string).trim().length < 1)) return null;
        }
        return JSON.stringify({
          intendedStartTerms: (v.intendedStartTerms as string[]).map((s) => s.trim()),
          studyModes: (v.studyModes as string[]).map((s) => s.trim()),
          academicStreams: (v.academicStreams as string[]).map((s) => s.trim()),
          relationships: (v.relationships as string[]).map((s) => s.trim()),
        });
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/** Admin-only upsert of one site-content section. Pass value=null to reset to defaults. */
export async function upsertSiteContentAction(
  key: SiteContentKey,
  value: unknown | null
): Promise<{ success: boolean; message: string }> {
  const user = await requireAdmin();

  if (!(SITE_CONTENT_KEYS as readonly string[]).includes(key)) {
    return { success: false, message: `Unknown content section "${key}".` };
  }

  const db = await getDb();
  const now = new Date().toISOString();

  if (value === null) {
    await db.delete(siteContent).where(eq(siteContent.key, key));
    safeRevalidate(["/", "/admin/content"]);
    await logAudit({
      actor: user,
      action: "ADMIN_RESET_SITE_CONTENT",
      resource: "site_content",
      resourceId: key,
    });
    return { success: true, message: `"${key}" reset to defaults.` };
  }

  const encoded = parsePayload(key, value);
  if (encoded === null) {
    return { success: false, message: `Invalid data supplied for "${key}".` };
  }

  await db
    .insert(siteContent)
    .values({ key, value: encoded, updatedBy: user.email, updatedAt: now })
    .onConflictDoUpdate({
      target: siteContent.key,
      set: { value: encoded, updatedBy: user.email, updatedAt: now },
    });

  safeRevalidate(["/"]);
  await logAudit({
    actor: user,
    action: "ADMIN_UPDATED_SITE_CONTENT",
    resource: "site_content",
    resourceId: key,
  });

  return { success: true, message: `"${key}" published successfully.` };
}

function safeRevalidate(paths: string[]) {
  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch (err) {
      // Never fail an already-committed mutation because of cache revalidation
      // (e.g. Workers deployments without an incremental cache binding).
      console.warn(`revalidatePath(${p}) skipped:`, err);
    }
  }
}

// ==============================================================================
// SUBJECT CATALOG — standalone helpers (reads are public; writes are admin-only)
// ==============================================================================

/**
 * Returns the master subject catalog from D1, falling back to the compiled
 * DEFAULT_SUBJECT_CATALOG when no override has been saved yet.
 * Safe to call from any Server Component or action — never throws.
 */
export async function getSubjectCatalog(): Promise<SubjectEntry[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.key, "subjectCatalog"));
    if (rows[0]?.value) {
      const parsed = JSON.parse(rows[0].value);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as SubjectEntry[];
    }
  } catch (err) {
    console.warn("getSubjectCatalog note:", err);
  }
  return DEFAULT_SUBJECT_CATALOG;
}

/**
 * Admin-only upsert of the full subject catalog.
 * Pass an empty array to reset to defaults (it deletes the override row).
 */
export async function upsertSubjectCatalogAction(
  subjects: SubjectEntry[]
): Promise<{ success: boolean; message: string }> {
  const user = await requireAdmin();

  if (!Array.isArray(subjects)) {
    return { success: false, message: "subjects must be an array." };
  }

  const db = await getDb();
  const now = new Date().toISOString();

  if (subjects.length === 0) {
    await db.delete(siteContent).where(eq(siteContent.key, "subjectCatalog"));
    safeRevalidate(["/admission", "/admin/classes"]);
    return { success: true, message: "Subject catalog reset to defaults." };
  }

  const encoded = JSON.stringify(subjects);
  await db
    .insert(siteContent)
    .values({ key: "subjectCatalog", value: encoded, updatedBy: user.email, updatedAt: now })
    .onConflictDoUpdate({
      target: siteContent.key,
      set: { value: encoded, updatedBy: user.email, updatedAt: now },
    });

  safeRevalidate(["/admission", "/admin/classes"]);
  await logAudit({
    actor: user,
    action: "ADMIN_UPDATED_SUBJECT_CATALOG",
    resource: "site_content",
    resourceId: "subjectCatalog",
  });

  return { success: true, message: `Subject catalog updated — ${subjects.length} subjects saved.` };
}

// ==============================================================================
// ADMISSION OPTIONS — 4 lists stored in single site_content key
// ==============================================================================

export async function getAdmissionOptions(): Promise<AdmissionOptions> {
  try {
    const db = await getDb();
    const rows = await db.select().from(siteContent).where(eq(siteContent.key, "admissionOptions"));
    if (rows[0]?.value) {
      const parsed = JSON.parse(rows[0].value) as Partial<AdmissionOptions>;
      if (parsed.intendedStartTerms && parsed.studyModes && parsed.academicStreams && parsed.relationships) {
        return parsed as AdmissionOptions;
      }
    }
  } catch (err) {
    console.warn("getAdmissionOptions note:", err);
  }
  return DEFAULT_ADMISSION_OPTIONS;
}

export async function upsertAdmissionOptionsAction(
  opts: AdmissionOptions
): Promise<{ success: boolean; message: string }> {
  const user = await requireAdmin();
  if (!opts || typeof opts !== "object") return { success: false, message: "Invalid options." };
  const lists: (keyof AdmissionOptions)[] = ["intendedStartTerms", "studyModes", "academicStreams", "relationships"];
  for (const k of lists) {
    if (!Array.isArray(opts[k]) || (opts[k] as string[]).some((s) => typeof s !== "string" || s.trim().length < 1)) {
      return { success: false, message: `Invalid list: ${k}` };
    }
  }
  const cleaned: AdmissionOptions = {
    intendedStartTerms: opts.intendedStartTerms.map((s) => s.trim()),
    studyModes: opts.studyModes.map((s) => s.trim()),
    academicStreams: opts.academicStreams.map((s) => s.trim()),
    relationships: opts.relationships.map((s) => s.trim()),
  };
  const db = await getDb();
  const now = new Date().toISOString();
  const encoded = JSON.stringify(cleaned);
  await db
    .insert(siteContent)
    .values({ key: "admissionOptions", value: encoded, updatedBy: user.email, updatedAt: now })
    .onConflictDoUpdate({ target: siteContent.key, set: { value: encoded, updatedBy: user.email, updatedAt: now } });
  safeRevalidate(["/admission", "/admin/admissions"]);
  await logAudit({ actor: user, action: "ADMIN_UPDATED_ADMISSION_OPTIONS", resource: "site_content", resourceId: "admissionOptions" });
  return { success: true, message: "Admission options updated." };
}

export async function resetAdmissionOptionsAction(): Promise<{ success: boolean; message: string }> {
  const user = await requireAdmin();
  const db = await getDb();
  await db.delete(siteContent).where(eq(siteContent.key, "admissionOptions"));
  safeRevalidate(["/admission", "/admin/admissions"]);
  await logAudit({ actor: user, action: "ADMIN_RESET_ADMISSION_OPTIONS", resource: "site_content", resourceId: "admissionOptions" });
  return { success: true, message: "Admission options reset to defaults." };
}

