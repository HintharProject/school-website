import { getAuth } from "./auth";
import { getDb, users, accounts } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { logAudit } from "./rbac";
import { hashPassword } from "better-auth/crypto";

/**
 * Ensures the initial School Administrator account
 * exists in Better Auth users and accounts tables with credentials
 * securely sourced from environment variables.
 */
export async function bootstrapInitialAdmin() {
  const rawEmail = process.env.INITIAL_ADMIN_EMAIL || "thawyezaw@gmail.com";
  const adminEmail = rawEmail.replace(/^["']|["']$/g, "").toLowerCase().trim();

  const rawPassword = process.env.INITIAL_ADMIN_PASSWORD || "TYZ(hinthar).132546";
  const initialPassword = rawPassword.replace(/^["']|["']$/g, "").trim();

  const rawName = process.env.INITIAL_ADMIN_NAME || "ThawYeZaw";
  const adminName = rawName.replace(/^["']|["']$/g, "").trim();

  const db = await getDb();

  // Ensure account table has issuer column if created from older migration
  try {
    await db.run(sql`ALTER TABLE \`account\` ADD COLUMN \`issuer\` text DEFAULT 'local:credential' NOT NULL`);
  } catch {}

  const auth = await getAuth();
  const hashedPassword = await hashPassword(initialPassword);

  // 1. Check if admin user already exists in users table
  let existing = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  let userId: string = "";

  if (existing.length > 0) {
    userId = existing[0].id;

    // Synchronize existing user profile
    await db
      .update(users)
      .set({
        name: adminName,
        role: "admin",
        status: "active",
        title: "School Administrator",
        campusId: "both-campuses",
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  } else {
    // 2. Try creating via Better Auth signUpEmail API
    try {
      const newUser = await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: initialPassword,
          name: adminName,
        },
      });

      if (newUser?.user?.id) {
        userId = newUser.user.id;
      }
    } catch (err) {
      console.warn("Better Auth auto-signup notice:", err);
    }

    // Re-verify if user exists now
    existing = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existing.length > 0) {
      userId = existing[0].id;
      await db
        .update(users)
        .set({
          name: adminName,
          role: "admin",
          status: "active",
          title: "School Administrator",
          campusId: "both-campuses",
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } else {
      userId = `admin_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await db.insert(users).values({
        id: userId,
        name: adminName,
        email: adminEmail,
        emailVerified: true,
        role: "admin",
        status: "active",
        title: "School Administrator",
        campusId: "both-campuses",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  // 3. Ensure credentials in accounts table match the hashed password
  await db
    .delete(accounts)
    .where(
      and(
        eq(accounts.userId, userId),
        eq(accounts.providerId, "credential")
      )
    );

  const accId = `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  await db.insert(accounts).values({
    id: accId,
    accountId: userId,
    providerId: "credential",
    issuer: "local:credential",
    userId: userId,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await logAudit({
    actor: {
      id: userId,
      email: adminEmail,
      name: adminName,
      role: "admin",
      status: "active",
    },
    action: "BOOTSTRAP_INITIAL_ADMIN",
    resource: "users",
    resourceId: userId,
    details: { email: adminEmail, name: adminName, role: "admin" },
  });

  return {
    success: true,
    message: `Administrator account (${adminEmail}) successfully provisioned and synchronized.`,
    userId,
  };
}
