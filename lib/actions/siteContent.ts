"use server";

import { getDb, siteContent } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth/rbac";
import { cachedPublicRead, invalidatePublicCache } from "@/lib/cache/publicCache";
import {
  DEFAULT_ABOUT_PRINCIPAL,
  DEFAULT_ADMISSIONS_CONFIG,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_BRAND_AND_FOOTER,
  DEFAULT_CAMPUSES_PAGE,
  DEFAULT_CLUBS_PAGE,
  DEFAULT_FAQS,
  DEFAULT_HERO,
  DEFAULT_HOME_SECTIONS,
  DEFAULT_YEARBOOK_PAGE,
  SITE_CONTENT_KEYS,
  type AboutPrincipalContent,
  type AdmissionsConfigContent,
  type AnnouncementItem,
  type BrandAndFooterContent,
  type ClubsPageContent,
  type FaqItem,
  type FullSiteContent,
  type HeroContent,
  type HomeSectionsContent,
  type InnerPageHeaderContent,
  type SiteContentKey,
} from "@/lib/content/defaults";
import { eq } from "drizzle-orm";
import { z } from "zod";

export type {
  AboutPrincipalContent,
  AdmissionsConfigContent,
  AnnouncementItem,
  BrandAndFooterContent,
  ClubsPageContent,
  FaqItem,
  FullSiteContent,
  HeroContent,
  HomeSectionsContent,
  InnerPageHeaderContent,
  SiteContentKey,
};

function mergeSection<T extends object>(defaults: T, raw: unknown): T {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return defaults;
  return { ...defaults, ...(raw as Partial<T>) };
}

function normalizeAnnouncements(raw: unknown): AnnouncementItem[] {
  if (!Array.isArray(raw)) return DEFAULT_ANNOUNCEMENTS;
  const items = raw
    .map((item, idx): AnnouncementItem | null => {
      if (typeof item === "string" && item.trim()) {
        return { id: `ann-${idx + 1}`, text: item.trim() };
      }
      if (item && typeof item === "object" && "text" in item) {
        const o = item as Partial<AnnouncementItem>;
        const text = String(o.text ?? "").trim();
        if (!text) return null;
        return {
          id: String(o.id || `ann-${idx + 1}`),
          text,
          textMy: o.textMy?.trim() || undefined,
          href: o.href?.trim() || undefined,
        };
      }
      return null;
    })
    .filter((x): x is AnnouncementItem => x !== null);
  return items.length > 0 ? items : DEFAULT_ANNOUNCEMENTS;
}

function normalizeFaqs(raw: unknown): FaqItem[] {
  if (!Array.isArray(raw)) return DEFAULT_FAQS;
  const items = raw
    .map((f, idx): FaqItem | null => {
      if (!f || typeof f !== "object") return null;
      const o = f as Partial<FaqItem>;
      const question = String(o.question ?? "").trim();
      const answer = String(o.answer ?? "").trim();
      if (!question || !answer) return null;
      return {
        id: String(o.id || `faq-${idx + 1}`),
        question,
        questionMy: o.questionMy?.trim() || undefined,
        answer,
        answerMy: o.answerMy?.trim() || undefined,
        defaultOpen: Boolean(o.defaultOpen ?? idx === 0),
      };
    })
    .filter((x): x is FaqItem => x !== null);
  return items.length > 0 ? items : DEFAULT_FAQS;
}

async function fetchRawSiteContentFromDb(): Promise<Partial<Record<SiteContentKey, unknown>>> {
  try {
    const db = await getDb();
    const rows = await db.select().from(siteContent);
    const out: Partial<Record<SiteContentKey, unknown>> = {};
    for (const row of rows) {
      if (!(SITE_CONTENT_KEYS as readonly string[]).includes(row.key)) continue;
      try {
        out[row.key as SiteContentKey] = JSON.parse(row.value);
      } catch {
        // Ignore malformed legacy override
      }
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Cached public loader returning complete, merged site content for all 5 pages.
 * Never throws; always falls back cleanly to compiled defaults.
 */
export async function getEffectiveSiteContent(): Promise<FullSiteContent> {
  return cachedPublicRead("effective-site-content", ["site-content"], async () => {
    const raw = await fetchRawSiteContentFromDb();

    const heroMerged = mergeSection(DEFAULT_HERO, raw.hero);
    if (!Array.isArray(heroMerged.highlights) || heroMerged.highlights.length === 0) {
      heroMerged.highlights = DEFAULT_HERO.highlights;
    }

    const aboutMerged = mergeSection(DEFAULT_ABOUT_PRINCIPAL, raw.aboutPrincipal);
    if (!Array.isArray(aboutMerged.stats) || aboutMerged.stats.length === 0) {
      aboutMerged.stats = DEFAULT_ABOUT_PRINCIPAL.stats;
    }

    const admissionsMerged = mergeSection(DEFAULT_ADMISSIONS_CONFIG, raw.admissionsConfig);
    admissionsMerged.documentRules = mergeSection(
      DEFAULT_ADMISSIONS_CONFIG.documentRules,
      (raw.admissionsConfig as Partial<AdmissionsConfigContent> | undefined)?.documentRules
    );

    const brandMerged = mergeSection(DEFAULT_BRAND_AND_FOOTER, raw.brand);
    if (!Array.isArray(brandMerged.socialLinks)) {
      brandMerged.socialLinks = DEFAULT_BRAND_AND_FOOTER.socialLinks;
    }

    return {
      brand: brandMerged,
      announcements: normalizeAnnouncements(raw.announcements),
      hero: heroMerged,
      aboutPrincipal: aboutMerged,
      homeSections: mergeSection(DEFAULT_HOME_SECTIONS, raw.homeSections),
      campusesPage: mergeSection(DEFAULT_CAMPUSES_PAGE, raw.campusesPage),
      yearbookPage: mergeSection(DEFAULT_YEARBOOK_PAGE, raw.yearbookPage),
      clubsPage: mergeSection(DEFAULT_CLUBS_PAGE, raw.clubsPage),
      admissionsConfig: admissionsMerged,
      faqs: normalizeFaqs(raw.faqs),
    };
  });
}

export async function getAdmissionsConfig(): Promise<AdmissionsConfigContent> {
  const all = await getEffectiveSiteContent();
  return all.admissionsConfig;
}

const nonEmptyStr = z.string().trim().min(1);
const optStr = z.string().trim().optional().default("");

const sectionSchemas: Record<SiteContentKey, z.ZodTypeAny> = {
  brand: z.object({
    schoolName: nonEmptyStr,
    subtitleEn: nonEmptyStr,
    subtitleMy: optStr,
    logoUrl: nonEmptyStr,
    footerBlurbEn: nonEmptyStr,
    footerBlurbMy: optStr,
    primaryPhone: nonEmptyStr,
    secondaryPhone: optStr,
    admissionsEmail: z.string().trim().email(),
    addressSummaryEn: nonEmptyStr,
    addressSummaryMy: optStr,
    copyrightEn: nonEmptyStr,
    copyrightMy: optStr,
    socialLinks: z
      .array(
        z.object({
          platform: z.enum(["facebook", "youtube", "telegram", "viber", "linkedin", "website"]),
          label: nonEmptyStr,
          url: z.string().trim().url(),
        })
      )
      .default([]),
  }),
  announcements: z
    .array(
      z.object({
        id: optStr,
        text: nonEmptyStr,
        textMy: optStr,
        href: optStr,
      })
    )
    .min(1),
  hero: z.object({
    credentialBadgeEn: nonEmptyStr,
    credentialBadgeMy: optStr,
    intakePillEn: nonEmptyStr,
    intakePillMy: optStr,
    titleLine1En: nonEmptyStr,
    titleLine1My: optStr,
    titleHighlightEn: nonEmptyStr,
    titleHighlightMy: optStr,
    subtitleEn: nonEmptyStr,
    subtitleMy: optStr,
    primaryCtaEn: nonEmptyStr,
    primaryCtaMy: optStr,
    secondaryCtaEn: nonEmptyStr,
    secondaryCtaMy: optStr,
    trustNoteEn: optStr,
    trustNoteMy: optStr,
    heroImageUrl: nonEmptyStr,
    heroImageCaptionEn: optStr,
    heroImageCaptionMy: optStr,
    highlights: z
      .array(
        z.object({
          value: nonEmptyStr,
          valueMy: optStr,
          label: nonEmptyStr,
          labelMy: optStr,
          sub: optStr,
          subMy: optStr,
        })
      )
      .min(1)
      .max(6),
  }),
  aboutPrincipal: z.object({
    badgeEn: nonEmptyStr,
    badgeMy: optStr,
    titleEn: nonEmptyStr,
    titleMy: optStr,
    titleHighlightEn: optStr,
    titleHighlightMy: optStr,
    paragraph1En: nonEmptyStr,
    paragraph1My: optStr,
    paragraph2En: optStr,
    paragraph2My: optStr,
    exploreCampusesCtaEn: nonEmptyStr,
    exploreCampusesCtaMy: optStr,
    principalName: nonEmptyStr,
    principalRoleEn: nonEmptyStr,
    principalRoleMy: optStr,
    principalImageUrl: nonEmptyStr,
    principalQuoteEn: nonEmptyStr,
    principalQuoteMy: optStr,
    stats: z
      .array(
        z.object({
          value: nonEmptyStr,
          valueMy: optStr,
          label: nonEmptyStr,
          labelMy: optStr,
        })
      )
      .min(1)
      .max(4),
  }),
  homeSections: z.object({
    classesBadgeEn: nonEmptyStr,
    classesBadgeMy: optStr,
    classesTitleEn: nonEmptyStr,
    classesTitleMy: optStr,
    classesSubtitleEn: nonEmptyStr,
    classesSubtitleMy: optStr,
    guidanceTitleEn: nonEmptyStr,
    guidanceTitleMy: optStr,
    guidanceSubtitleEn: nonEmptyStr,
    guidanceSubtitleMy: optStr,
    guidanceCtaEn: nonEmptyStr,
    guidanceCtaMy: optStr,
    campusesBadgeEn: nonEmptyStr,
    campusesBadgeMy: optStr,
    campusesTitleEn: nonEmptyStr,
    campusesTitleMy: optStr,
    campusesSubtitleEn: nonEmptyStr,
    campusesSubtitleMy: optStr,
    testimonialsBadgeEn: nonEmptyStr,
    testimonialsBadgeMy: optStr,
    testimonialsTitleEn: nonEmptyStr,
    testimonialsTitleMy: optStr,
    testimonialsSubtitleEn: nonEmptyStr,
    testimonialsSubtitleMy: optStr,
    faqBadgeEn: nonEmptyStr,
    faqBadgeMy: optStr,
    faqTitleEn: nonEmptyStr,
    faqTitleMy: optStr,
    faqSubtitleEn: nonEmptyStr,
    faqSubtitleMy: optStr,
  }),
  campusesPage: z.object({
    badgeEn: nonEmptyStr,
    badgeMy: optStr,
    titleEn: nonEmptyStr,
    titleMy: optStr,
    subtitleEn: nonEmptyStr,
    subtitleMy: optStr,
  }),
  yearbookPage: z.object({
    badgeEn: nonEmptyStr,
    badgeMy: optStr,
    titleEn: nonEmptyStr,
    titleMy: optStr,
    subtitleEn: nonEmptyStr,
    subtitleMy: optStr,
  }),
  clubsPage: z.object({
    badgeEn: nonEmptyStr,
    badgeMy: optStr,
    titleEn: nonEmptyStr,
    titleMy: optStr,
    subtitleEn: nonEmptyStr,
    subtitleMy: optStr,
    activitiesBadgeEn: nonEmptyStr,
    activitiesBadgeMy: optStr,
    activitiesTitleEn: nonEmptyStr,
    activitiesTitleMy: optStr,
    activitiesSubtitleEn: nonEmptyStr,
    activitiesSubtitleMy: optStr,
  }),
  admissionsConfig: z.object({
    badgeEn: nonEmptyStr,
    badgeMy: optStr,
    titleEn: nonEmptyStr,
    titleMy: optStr,
    subtitleEn: nonEmptyStr,
    subtitleMy: optStr,
    trackTitleEn: nonEmptyStr,
    trackTitleMy: optStr,
    trackSubtitleEn: nonEmptyStr,
    trackSubtitleMy: optStr,
    intendedStartTerms: z.array(nonEmptyStr).min(1),
    studyModes: z.array(nonEmptyStr).min(1),
    academicStreams: z.array(nonEmptyStr).min(1),
    relationships: z.array(nonEmptyStr).min(1),
    documentRules: z.object({
      identityRequired: z.boolean(),
      reportRequired: z.boolean(),
      photoRequired: z.boolean(),
    }),
  }),
  faqs: z
    .array(
      z.object({
        id: optStr,
        question: nonEmptyStr,
        questionMy: optStr,
        answer: nonEmptyStr,
        answerMy: optStr,
        defaultOpen: z.boolean().optional(),
      })
    )
    .min(1),
};

const ALL_PUBLIC_PATHS = [
  "/",
  "/campuses",
  "/yearbook",
  "/clubs",
  "/admission",
  "/admin",
  "/admin/home",
  "/admin/admissions",
];

/**
 * Admin-only upsert of any site_content section. Pass value = null to reset to compiled defaults.
 */
export async function upsertSiteContentAction(
  key: SiteContentKey,
  value: unknown | null
): Promise<{ success: boolean; message: string }> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return { success: false, message: "Administrator session required. Please sign in again." };
  }

  if (!(SITE_CONTENT_KEYS as readonly string[]).includes(key)) {
    return { success: false, message: `Unknown content section "${key}".` };
  }

  const db = await getDb();
  const now = new Date().toISOString();

  if (value === null) {
    await db.delete(siteContent).where(eq(siteContent.key, key));
    invalidatePublicCache(["site-content"], ALL_PUBLIC_PATHS);
    await logAudit({
      actor: user,
      action: "ADMIN_RESET_SITE_CONTENT",
      resource: "site_content",
      resourceId: key,
    });
    return { success: true, message: `Section "${key}" reset to default values.` };
  }

  const schema = sectionSchemas[key];
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const path = firstIssue?.path.join(".") || key;
    return {
      success: false,
      message: `Validation error in ${path}: ${firstIssue?.message ?? "Please fill in all required English fields."}`,
    };
  }

  const encoded = JSON.stringify(parsed.data);

  await db
    .insert(siteContent)
    .values({ key, value: encoded, updatedBy: user.email, updatedAt: now })
    .onConflictDoUpdate({
      target: siteContent.key,
      set: { value: encoded, updatedBy: user.email, updatedAt: now },
    });

  invalidatePublicCache(["site-content"], ALL_PUBLIC_PATHS);
  await logAudit({
    actor: user,
    action: "ADMIN_UPDATED_SITE_CONTENT",
    resource: "site_content",
    resourceId: key,
  });

  return { success: true, message: "Website content saved and published immediately." };
}
