import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

export type AppDatabase = DrizzleD1Database<typeof schema>;

declare global {
  // Cloudflare D1 binding in global scope or worker env
  var DB: D1Database | undefined;
  // Cached Drizzle instance to avoid repeated getCloudflareContext() calls
  var __drizzleDb: AppDatabase | undefined;
}

/**
 * Returns a typed Drizzle ORM instance bound to Cloudflare D1.
 * Caches the instance globally to avoid repeated dynamic imports of
 * @opennextjs/cloudflare and getCloudflareContext() on every call.
 */
export async function getDb(explicitDb?: D1Database): Promise<AppDatabase> {
  if (explicitDb) {
    return drizzle(explicitDb, { schema });
  }

  // Return cached instance if available
  if (globalThis.__drizzleDb) {
    return globalThis.__drizzleDb;
  }

  let db: D1Database | undefined;

  // 1. Try @opennextjs/cloudflare getCloudflareContext()
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    db = ctx?.env?.DB as D1Database | undefined;
  } catch {
    // getCloudflareContext may throw in non-cloudflare local build step
  }

  // 2. Try globalThis.DB
  if (!db && typeof globalThis !== "undefined" && (globalThis as any).DB) {
    db = (globalThis as any).DB as D1Database;
  }

  // 3. Try process.env.DB
  if (!db && typeof process !== "undefined" && (process.env as any)?.DB) {
    db = (process.env as any).DB as D1Database;
  }

  if (!db) {
    throw new Error(
      "Cloudflare D1 database binding 'DB' was not found in environment context."
    );
  }

  const drizzleInstance = drizzle(db, { schema });
  globalThis.__drizzleDb = drizzleInstance;
  return drizzleInstance;
}

export * from "./schema";
