import { getAuth } from "./auth";
import { getDb, users, accounts } from "@/lib/db";
import { eq } from "drizzle-orm";
import { logAudit } from "./rbac";

/**
 * Ensures the initial administrator account (thawyezaw@gmail.com / TYZ)
 * exists in Better Auth users and accounts tables.
 */
export async function bootstrapInitialAdmin() {
  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || "thawyezaw@gmail.com").toLowerCase().trim();
  const adminName = process.env.INITIAL_ADMIN_NAME || "TYZ";
  const initialPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (!initialPassword) {
    console.warn("Bootstrap: INITIAL_ADMIN_PASSWORD not provided in environment variables.");
    return { success: false, message: "INITIAL_ADMIN_PASSWORD is required in environment variables." };
  }

  const db = await getDb();
  const auth = await getAuth();

  // Check if admin already exists
  const existing = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (existing.length > 0) {
    // Update role to admin and status to active if needed
    await db
      .update(users)
      .set({
        name: adminName,
        role: "admin",
        status: "active",
        title: "Principal & Founder",
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing[0].id));

    return {
      success: true,
      message: `Administrator account (${adminEmail}) is already configured and active.`,
      userId: existing[0].id,
    };
  }

  // Create via Better Auth API
  try {
    const newUser = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: initialPassword,
        name: adminName,
      },
    });

    if (newUser?.user) {
      await db
        .update(users)
        .set({
          role: "admin",
          status: "active",
          title: "Principal & Founder",
          campusId: "ywarma-campus",
        })
        .where(eq(users.id, newUser.user.id));

      await logAudit({
        actor: {
          id: newUser.user.id,
          email: adminEmail,
          name: adminName,
          role: "admin",
          status: "active",
        },
        action: "BOOTSTRAP_INITIAL_ADMIN",
        resource: "users",
        resourceId: newUser.user.id,
        details: { email: adminEmail, name: adminName },
      });

      return {
        success: true,
        message: `Successfully provisioned initial administrator account for ${adminEmail}.`,
        userId: newUser.user.id,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to bootstrap initial administrator: ${err?.message || String(err)}`,
    };
  }

  return { success: false, message: "Unable to create initial administrator." };
}
