"use server";

import { getDb, newsletterSubscribers } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth/rbac";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { sendAdmissionEmail } from "@/lib/email/email";
import { revalidatePath } from "next/cache";

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  source: z.string().max(60).default("footer"),
});

/**
 * Public newsletter signup. Idempotent: re-subscribing an existing email
 * simply reactivates it and resends the welcome email.
 */
export async function subscribeNewsletterAction(
  data: unknown
): Promise<{ success: boolean; error?: string; message?: string }> {
  const parsed = subscribeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Please enter a valid email address." };
  }
  const { email, source } = parsed.data;

  try {
    const db = await getDb();

    await db
      .insert(newsletterSubscribers)
      .values({ email, source: source.slice(0, 60) || "footer", status: "active" })
      .onConflictDoUpdate({
        target: newsletterSubscribers.email,
        set: { status: "active" },
      });

    // Welcome email (non-fatal — subscription itself already succeeded)
    let emailSent = false;
    try {
      const result = await sendAdmissionEmail({
        type: "newsletter_welcome",
        recipientEmail: email,
      });
      emailSent = result.sent;
    } catch (err) {
      console.warn("Newsletter welcome email error:", err);
    }

    return {
      success: true,
      message: emailSent
        ? "Subscribed! Please check your inbox for a confirmation email."
        : "You're on the list! Watch your inbox for school updates.",
    };
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return { success: false, error: "Could not subscribe right now. Please try again later." };
  }
}

/** Admin: list subscribers, newest first. */
export async function getNewsletterSubscribers() {
  await requireAdmin();
  const db = await getDb();
  return db
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.createdAt));
}

/** Admin: unsubscribe/remove a subscriber. */
export async function removeSubscriberAction(id: number): Promise<{ success: boolean; error?: string }> {
  const user = await requireAdmin();
  const db = await getDb();

  const deleted = await db
    .delete(newsletterSubscribers)
    .where(eq(newsletterSubscribers.id, id))
    .returning({ id: newsletterSubscribers.id });

  if (!deleted.length) {
    return { success: false, error: "Subscriber not found." };
  }

  await logAudit({
    actor: user,
    action: "ADMIN_REMOVED_NEWSLETTER_SUBSCRIBER",
    resource: "newsletter_subscribers",
    resourceId: String(id),
  });

  revalidatePath("/admin/content");
  return { success: true };
}
