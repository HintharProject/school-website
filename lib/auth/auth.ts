import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/lib/db/schema";
import { getDb } from "@/lib/db";

/**
 * Creates or retrieves the Better Auth instance.
 * Supports Cloudflare D1 via Drizzle Adapter with secure sessions and closed registration.
 */
export async function getAuth(explicitDb?: D1Database) {
  const db = await getDb(explicitDb);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        ...schema,
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: true,
      minPasswordLength: 8,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "student",
          required: false,
        },
        status: {
          type: "string",
          defaultValue: "active",
          required: false,
        },
        title: {
          type: "string",
          required: false,
        },
        campusId: {
          type: "string",
          defaultValue: "ywarma-campus",
          required: false,
        },
        grade: {
          type: "string",
          required: false,
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    trustedOrigins: [
      "http://localhost:3000",
      "http://localhost:8787",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:8787",
      "http://127.0.0.1:3001",
      "https://hinthar.thawyezaw.workers.dev",
      process.env.NEXT_PUBLIC_APP_URL || "",
      process.env.BETTER_AUTH_URL || "",
    ].filter(Boolean),
    advanced: {
      useSecureCookies:
        process.env.NODE_ENV === "production" &&
        !process.env.BETTER_AUTH_URL?.includes("localhost") &&
        !process.env.BETTER_AUTH_URL?.includes("127.0.0.1"),
      cookiePrefix: "hinthar",
    },
  });
}
