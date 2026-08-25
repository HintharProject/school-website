"use server";

import { getDb, siteContent } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth/rbac";
import {
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_CONTACT_INFO,
  DEFAULT_FAQS,
  DEFAULT_HIGHLIGHTS,
  DEFAULT_PROGRAMS,
  SITE_CONTENT_KEYS,
  type ContactInfoItem,
  type FaqItem,
  type KeyHighlight,
  type AcademicProgram,
  type SiteContentKey,
} from "@/lib/content/defaults";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface SiteContentMap {
  announcements?: string[];
  heroHighlights?: KeyHighlight[];
  faqs?: FaqItem[];
  programs?: AcademicProgram[];
  contactInfo?: ContactInfoItem[];
}

export type {
  ContactInfoItem,
  FaqItem,
  KeyHighlight,
  AcademicProgram,
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
