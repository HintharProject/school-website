"use server";

import { getDb, campuses, type NewCampus } from "@/lib/db";
import { asc, desc, eq } from "drizzle-orm";
import { requireAdmin, logAudit } from "@/lib/auth/rbac";
import { cachedPublicRead, invalidatePublicCache } from "@/lib/cache/publicCache";
import { z } from "zod";

export interface CampusActionResult {
  success: boolean;
  message: string;
}

export interface PublicCampusItem {
  id: string;
  name: string;
  nameMy: string | null;
  city: "Yangon" | "Mawlamyine";
  tagline: string;
  taglineMy: string | null;
  address: string;
  addressMy: string | null;
  phone: string;
  email: string;
  gradesServed: string;
  gradesServedMy: string | null;
  facilitiesEn: string[];
  facilitiesMy: string[];
  imageUrl: string;
  galleryUrls: string[];
  mapUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

const DEFAULT_CAMPUS_FALLBACKS: PublicCampusItem[] = [
  {
    id: "ywarma-campus",
    name: "Ywarma Campus",
    nameMy: "Ywarma Campus (လှိုင်မြို့နယ်)",
    city: "Yangon",
    tagline: "Flagship Academic Centre & Pearson Examination Hall",
    taglineMy: "ပင်မ စာသင်ဆောင်နှင့် Pearson စာမေးပွဲခန်းမ",
    address: "No. 23B, Ywar Ma Kyaung Lane, Hlaing Township, Yangon, Myanmar (11051)",
    addressMy: "အမှတ် ၂၃(B)၊ ရွာမကျောင်းလမ်း၊ လှိုင်မြို့နယ်၊ ရန်ကုန်မြို့",
    phone: "+95 9 894 332200 / +95 9 894 332211",
    email: "ywarma.admissions@hinthar.education",
    gradesServed: "Lower Secondary (Year 7–9) · Pearson IGCSE · Pearson IAL",
    gradesServedMy: "Lower Secondary (Year 7–9) · Pearson IGCSE · Pearson IAL",
    facilitiesEn: ["Pearson Exam Hall", "Physics & Chemistry Labs", "Computing Suite", "Academic Library"],
    facilitiesMy: ["Pearson စာမေးပွဲခန်းမ", "သိပ္ပံလက်တွေ့ဓာတ်ခွဲခန်း", "ကွန်ပျူတာခန်းမ", "စာကြည့်တိုက်"],
    imageUrl: "/images/g2.jpg",
    galleryUrls: ["/images/g2.jpg", "/images/g4.jpg", "/images/g1.jpg"],
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Ywar+Ma+Kyaung+Lane,+Hlaing+Township,+Yangon,+Myanmar",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "shwe-padauk-campus",
    name: "Shwe Padauk Campus",
    nameMy: "Shwe Padauk Campus (ရန်ကုန်)",
    city: "Yangon",
    tagline: "Senior STEM, Computing & Pre-University Hub",
    taglineMy: "အထက်တန်း STEM နှင့် တက္ကသိုလ်အကြို သင်ကြားရေးစင်တာ",
    address: "Shwe Padauk Road, Hlaing Township, Yangon, Myanmar",
    addressMy: "ရွှေပိတောက်လမ်း၊ လှိုင်မြို့နယ်၊ ရန်ကုန်မြို့",
    phone: "+95 9 894 332222",
    email: "shwepadauk@hinthar.education",
    gradesServed: "Pearson IGCSE & Pearson IAL (STEM & Computing)",
    gradesServedMy: "Pearson IGCSE နှင့် Pearson IAL (STEM & Computing)",
    facilitiesEn: ["STEM Innovation Lab", "Robotics & Coding Studio", "IAL Study Lounge"],
    facilitiesMy: ["STEM ဓာတ်ခွဲခန်း", "Robotics နှင့် Coding ခန်းမ", "IAL စာကြည့်နားနေဆောင်"],
    imageUrl: "/images/engineering.avif",
    galleryUrls: ["/images/engineering.avif", "/images/g3.jpg"],
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Shwe+Padauk+Road,+Yangon,+Myanmar",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "shwe-pone-nyet-campus",
    name: "Shwe Pone Nyet Campus",
    nameMy: "Shwe Pone Nyet Campus (ရန်ကုန်)",
    city: "Yangon",
    tagline: "Lower Secondary & Foundation Scholars Wing",
    taglineMy: "အလယ်တန်း Lower Secondary သီးသန့် စာသင်ဆောင်",
    address: "Shwe Pone Nyet Street, Yangon, Myanmar",
    addressMy: "ရွှေပုန်းညက်လမ်း၊ ရန်ကုန်မြို့",
    phone: "+95 9 894 332233",
    email: "shweponenyet@hinthar.education",
    gradesServed: "Lower Secondary (Year 7–9) & Creative Societies",
    gradesServedMy: "Lower Secondary (Year 7–9) နှင့် ကျောင်းသားအသင်းအဖွဲ့များ",
    facilitiesEn: ["Multimedia Classrooms", "Junior Science Lab", "Debate & Arts Studio"],
    facilitiesMy: ["မာလ်တီမီဒီယာ စာသင်ခန်းများ", "သိပ္ပံစမ်းသပ်ခန်း", "အနုပညာနှင့် စကားရည်လုခန်းမ"],
    imageUrl: "/images/g8.jpg",
    galleryUrls: ["/images/g8.jpg", "/images/g5.jpg"],
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Shwe+Pone+Nyet+Street,+Yangon,+Myanmar",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "mawlamyine-campus",
    name: "Mawlamyine Campus",
    nameMy: "Mawlamyine Campus (မော်လမြိုင်)",
    city: "Mawlamyine",
    tagline: "Mon State Regional Centre of Academic Excellence",
    taglineMy: "မွန်ပြည်နယ် ဒေသဆိုင်ရာ နိုင်ငံတကာ ပညာရေးစင်တာ",
    address: "Main Strand Road, Mawlamyine, Mon State, Myanmar",
    addressMy: "ကမ်းနားလမ်းမကြီး၊ မော်လမြိုင်မြို့၊ မွန်ပြည်နယ်",
    phone: "+95 9 894 332288 / +95 32 202 888",
    email: "mawlamyine@hinthar.education",
    gradesServed: "Lower Secondary (Year 7–9) · Pearson IGCSE · Pearson IAL",
    gradesServedMy: "Lower Secondary (Year 7–9) · Pearson IGCSE · Pearson IAL",
    facilitiesEn: ["Science Practical Labs", "Digital Learning Suite", "Student Counseling Centre"],
    facilitiesMy: ["သိပ္ပံလက်တွေ့ခန်းများ", "ဒစ်ဂျစ်တယ် စာသင်ခန်း", "ပညာရေး ဆွေးနွေးအကြံပေးရုံး"],
    imageUrl: "/images/g7.jpg",
    galleryUrls: ["/images/g7.jpg", "/images/g6.jpg"],
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Strand+Road,+Mawlamyine,+Mon+State,+Myanmar",
    sortOrder: 4,
    isActive: true,
  },
];

const campusSchema = z.object({
  id: z.string().trim().min(2).max(100),
  name: z.string().trim().min(2).max(200),
  nameMy: z.string().trim().max(200).optional().nullable().or(z.literal("")),
  city: z.enum(["Yangon", "Mawlamyine"]),
  tagline: z.string().trim().min(3).max(300),
  taglineMy: z.string().trim().max(300).optional().nullable().or(z.literal("")),
  address: z.string().trim().min(5).max(500),
  addressMy: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  phone: z.string().trim().min(5).max(120),
  email: z.string().trim().email(),
  gradesServed: z.string().trim().min(2).max(300),
  gradesServedMy: z.string().trim().max(300).optional().nullable().or(z.literal("")),
  facilitiesEn: z.array(z.string().trim().min(1)).max(12).default([]),
  facilitiesMy: z.array(z.string().trim()).max(12).default([]),
  imageUrl: z.string().trim().min(1),
  galleryUrls: z.array(z.string().trim().min(1)).max(12).default([]),
  mapUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p.map((s) => String(s ?? "").trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function mapCampusRow(row: typeof campuses.$inferSelect): PublicCampusItem {
  return {
    id: row.id,
    name: row.name,
    nameMy: row.nameMy || null,
    city: row.city === "Mawlamyine" ? "Mawlamyine" : "Yangon",
    tagline: row.tagline,
    taglineMy: row.taglineMy || null,
    address: row.address,
    addressMy: row.addressMy || null,
    phone: row.phone,
    email: row.email,
    gradesServed: row.gradesServed,
    gradesServedMy: row.gradesServedMy || null,
    facilitiesEn: parseJsonArray(row.facilitiesEn),
    facilitiesMy: parseJsonArray(row.facilitiesMy),
    imageUrl: row.imageUrl || "/images/g2.jpg",
    galleryUrls: parseJsonArray(row.galleryUrls),
    mapUrl: row.mapUrl || null,
    sortOrder: row.sortOrder ?? 0,
    isActive: row.isActive,
  };
}

export async function getPublicCampuses(): Promise<PublicCampusItem[]> {
  return cachedPublicRead("public-campuses", ["campuses"], async () => {
    try {
      const db = await getDb();
      const rows = await db
        .select()
        .from(campuses)
        .where(eq(campuses.isActive, true))
        .orderBy(asc(campuses.sortOrder), desc(campuses.city));
      if (rows.length > 0) return rows.map(mapCampusRow);
    } catch {
      // Fallback
    }
    return DEFAULT_CAMPUS_FALLBACKS;
  });
}

export async function getCampusesForAdmin(): Promise<PublicCampusItem[]> {
  await requireAdmin();
  const db = await getDb();
  const rows = await db
    .select()
    .from(campuses)
    .orderBy(asc(campuses.sortOrder), desc(campuses.city));
  return rows.length > 0 ? rows.map(mapCampusRow) : DEFAULT_CAMPUS_FALLBACKS;
}

async function ensureCampusesSeeded() {
  const db = await getDb();
  const existing = await db.select({ id: campuses.id }).from(campuses).limit(1);
  if (existing.length > 0) return;
  const now = new Date().toISOString();
  for (const c of DEFAULT_CAMPUS_FALLBACKS) {
    await db
      .insert(campuses)
      .values({
        id: c.id,
        name: c.name,
        nameMy: c.nameMy,
        city: c.city,
        tagline: c.tagline,
        taglineMy: c.taglineMy,
        address: c.address,
        addressMy: c.addressMy,
        phone: c.phone,
        email: c.email,
        gradesServed: c.gradesServed,
        gradesServedMy: c.gradesServedMy,
        facilitiesEn: JSON.stringify(c.facilitiesEn),
        facilitiesMy: JSON.stringify(c.facilitiesMy),
        imageUrl: c.imageUrl,
        galleryUrls: JSON.stringify(c.galleryUrls),
        mapUrl: c.mapUrl,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing();
  }
}

export async function upsertCampusAction(data: unknown): Promise<CampusActionResult> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return { success: false, message: "Administrator session required. Please sign in again." };
  }

  const parsed = campusSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    };
  }

  const v = parsed.data;
  await ensureCampusesSeeded();
  const db = await getDb();
  const now = new Date().toISOString();

  const payload: NewCampus = {
    id: v.id,
    name: v.name,
    nameMy: v.nameMy || null,
    city: v.city,
    tagline: v.tagline,
    taglineMy: v.taglineMy || null,
    address: v.address,
    addressMy: v.addressMy || null,
    phone: v.phone,
    email: v.email,
    gradesServed: v.gradesServed,
    gradesServedMy: v.gradesServedMy || null,
    facilitiesEn: JSON.stringify(v.facilitiesEn),
    facilitiesMy: JSON.stringify(v.facilitiesMy.filter(Boolean)),
    imageUrl: v.imageUrl,
    galleryUrls: JSON.stringify(v.galleryUrls),
    mapUrl: v.mapUrl || null,
    sortOrder: v.sortOrder,
    isActive: v.isActive,
    createdAt: now,
    updatedAt: now,
  };

  await db
    .insert(campuses)
    .values(payload)
    .onConflictDoUpdate({
      target: campuses.id,
      set: {
        ...payload,
        createdAt: undefined,
        updatedAt: now,
      },
    });

  invalidatePublicCache(["campuses"], ["/", "/campuses", "/admin/campuses"]);
  await logAudit({
    actor: user,
    action: "ADMIN_UPSERTED_CAMPUS",
    resource: "campuses",
    resourceId: v.id,
    details: { name: v.name, city: v.city, isActive: v.isActive },
  });

  return { success: true, message: `Campus "${v.name}" saved.` };
}

export async function deleteCampusAction(id: string): Promise<CampusActionResult> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return { success: false, message: "Administrator session required." };
  }
  await ensureCampusesSeeded();
  const db = await getDb();
  await db.delete(campuses).where(eq(campuses.id, id));
  invalidatePublicCache(["campuses"], ["/", "/campuses", "/admin/campuses"]);
  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_CAMPUS",
    resource: "campuses",
    resourceId: id,
  });
  return { success: true, message: "Campus deleted." };
}
