"use server";

import { getDb, testimonials } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth/rbac";
import { cachedPublicRead, invalidatePublicCache } from "@/lib/cache/publicCache";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";

const testimonialSchema = z.object({
  authorName: z.string().trim().min(2).max(200),
  authorRole: z.string().trim().max(200).optional().nullable(),
  authorRoleMy: z.string().trim().max(200).optional().nullable(),
  quote: z.string().trim().min(5).max(2000),
  quoteMy: z.string().trim().max(2000).optional().nullable(),
  image: z.string().trim().max(500).optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  status: z.enum(["published", "archived"]).default("published"),
});

export interface PublicTestimonial {
  id: number;
  authorName: string;
  authorRole: string | null;
  authorRoleMy: string | null;
  quote: string;
  quoteMy: string | null;
  image: string | null;
  rating: number | null;
}

const DEFAULT_TESTIMONIAL_FALLBACKS: PublicTestimonial[] = [
  {
    id: 1,
    authorName: "Daw Khin Thandar Aye",
    authorRole: "Parent of Pearson IAL Scholar (Ywarma Campus)",
    authorRoleMy: "Pearson IAL ကျောင်းသားမိဘ (Ywarma Campus)",
    quote:
      "Choosing Hinthar International School transformed our son's confidence. Small classes, caring subject specialists, and disciplined mock exams prepared him directly for UK engineering admission.",
    quoteMy:
      "Hinthar International School ကို ရွေးချယ်ခဲ့ခြင်းကြောင့် သားဖြစ်သူ၏ ပညာရေး ယုံကြည်မှု အလွန်တိုးတက်လာခဲ့ပါသည်။ အတန်းငယ်များဖြင့် အနီးကပ်သင်ကြားမှုနှင့် စနစ်ကျသော အကြိုစာမေးပွဲများကြောင့် UK အင်ဂျင်နီယာတက္ကသိုလ်ဝင်ခွင့် ရရှိခဲ့ပါသည်။",
    image: null,
    rating: 5,
  },
  {
    id: 2,
    authorName: "Lin Myat Thu",
    authorRole: "Class of 2026 · Pearson IAL Distinction Graduate",
    authorRoleMy: "Class of 2026 · Pearson IAL ထူးချွန်ကျောင်းသားဟောင်း",
    quote:
      "From laboratory practicals to university personal statement mentoring, our teachers at Hinthar International School guided every step of my Pearson Edexcel journey.",
    quoteMy:
      "သိပ္ပံလက်တွေ့ စမ်းသပ်ခန်းများမှစ၍ တက္ကသိုလ်လျှောက်လွှာ ပြင်ဆင်မှုအထိ Hinthar International School မှ ဆရာ၊ ဆရာမများက အဆင့်တိုင်းတွင် စေတနာအပြည့်ဖြင့် လမ်းညွှန်ပေးခဲ့ပါသည်။",
    image: "/images/g4.jpg",
    rating: 5,
  },
  {
    id: 3,
    authorName: "U Aung Kyaw Moe",
    authorRole: "Parent of IGCSE Student (Mawlamyine Campus)",
    authorRoleMy: "Pearson IGCSE ကျောင်းသူမိဘ (Mawlamyine Campus)",
    quote:
      "Having an approved Pearson Edexcel standard campus right here in Mawlamyine gives Mon State families world-class education without leaving home.",
    quoteMy:
      "မော်လမြိုင်မြို့တွင်ပင် နိုင်ငံတကာစံချိန်မီ Pearson Edexcel ပညာရေးကို တက်ရောက်သင်ယူနိုင်ခြင်းသည် ဒေသခံမိသားစုများအတွက် အလွန်တန်ဖိုးရှိသော အခွင့်အလမ်းဖြစ်ပါသည်။",
    image: null,
    rating: 5,
  },
];

export async function getPublishedTestimonials(): Promise<PublicTestimonial[]> {
  return cachedPublicRead("public-testimonials", ["testimonials"], async () => {
    try {
      const db = await getDb();
      const rows = await db
        .select({
          id: testimonials.id,
          authorName: testimonials.authorName,
          authorRole: testimonials.authorRole,
          authorRoleMy: testimonials.authorRoleMy,
          quote: testimonials.quote,
          quoteMy: testimonials.quoteMy,
          image: testimonials.image,
          rating: testimonials.rating,
        })
        .from(testimonials)
        .where(eq(testimonials.status, "published"))
        .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
      if (rows.length > 0) return rows;
    } catch {
      // Fallback
    }
    return DEFAULT_TESTIMONIAL_FALLBACKS;
  });
}

export async function getAllTestimonials() {
  await requireAdmin();
  const db = await getDb();
  const rows = await db
    .select()
    .from(testimonials)
    .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
  if (rows.length === 0) {
    for (const [idx, item] of DEFAULT_TESTIMONIAL_FALLBACKS.entries()) {
      await db.insert(testimonials).values({
        authorName: item.authorName,
        authorRole: item.authorRole,
        authorRoleMy: item.authorRoleMy,
        quote: item.quote,
        quoteMy: item.quoteMy,
        image: item.image,
        rating: item.rating,
        sortOrder: idx + 1,
        status: "published",
      });
    }
    return db
      .select()
      .from(testimonials)
      .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
  }
  return rows;
}

export async function createTestimonialAction(
  data: unknown
): Promise<{ success: boolean; error?: string; id?: number }> {
  const user = await requireAdmin();
  const parsed = testimonialSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Please provide an author name and quote." };
  }
  const v = parsed.data;
  const db = await getDb();

  const result = await db
    .insert(testimonials)
    .values({
      authorName: v.authorName,
      authorRole: v.authorRole || null,
      authorRoleMy: v.authorRoleMy || null,
      quote: v.quote,
      quoteMy: v.quoteMy || null,
      image: v.image || null,
      rating: v.rating ?? 5,
      sortOrder: v.sortOrder,
      status: v.status,
    })
    .returning({ id: testimonials.id });

  invalidatePublicCache(["testimonials"], ["/", "/admin/home"]);
  await logAudit({
    actor: user,
    action: "ADMIN_CREATED_TESTIMONIAL",
    resource: "testimonials",
    resourceId: String(result[0]?.id),
    details: { authorName: v.authorName },
  });

  return { success: true, id: result[0]?.id };
}

export async function updateTestimonialAction(
  id: number,
  data: unknown
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAdmin();
  const parsed = testimonialSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Please provide an author name and quote." };
  }
  const v = parsed.data;
  const db = await getDb();

  const updated = await db
    .update(testimonials)
    .set({
      authorName: v.authorName,
      authorRole: v.authorRole || null,
      authorRoleMy: v.authorRoleMy || null,
      quote: v.quote,
      quoteMy: v.quoteMy || null,
      image: v.image || null,
      rating: v.rating ?? 5,
      sortOrder: v.sortOrder,
      status: v.status,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(testimonials.id, id))
    .returning({ id: testimonials.id });

  if (!updated.length) return { success: false, error: "Testimonial not found." };

  invalidatePublicCache(["testimonials"], ["/", "/admin/home"]);
  await logAudit({
    actor: user,
    action: "ADMIN_UPDATED_TESTIMONIAL",
    resource: "testimonials",
    resourceId: String(id),
  });
  return { success: true };
}

export async function deleteTestimonialAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAdmin();
  const db = await getDb();
  await db.delete(testimonials).where(eq(testimonials.id, id));
  invalidatePublicCache(["testimonials"], ["/", "/admin/home"]);
  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_TESTIMONIAL",
    resource: "testimonials",
    resourceId: String(id),
  });
  return { success: true };
}
