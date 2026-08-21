import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

export type AppDatabase = DrizzleD1Database<typeof schema>;

declare global {
  // Cloudflare D1 binding in global scope or worker env
  var DB: D1Database | undefined;
}

/**
 * Returns a typed Drizzle ORM instance bound to Cloudflare D1.
 * Works seamlessly in Cloudflare Workers via getCloudflareContext(),
 * global env bindings, or passed explicit bindings.
 */
export async function getDb(explicitDb?: D1Database): Promise<AppDatabase> {
  if (explicitDb) {
    return drizzle(explicitDb, { schema });
  }

  // 1. Try @opennextjs/cloudflare getCloudflareContext()
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    if (ctx?.env?.DB) {
      return drizzle(ctx.env.DB as D1Database, { schema });
    }
  } catch {
    // getCloudflareContext may throw in non-cloudflare local build step
  }

  // 2. Try globalThis.DB
  if (typeof globalThis !== "undefined" && (globalThis as any).DB) {
    return drizzle((globalThis as any).DB as D1Database, { schema });
  }

  // 3. Try process.env.DB
  if (typeof process !== "undefined" && (process.env as any)?.DB) {
    return drizzle((process.env as any).DB as D1Database, { schema });
  }

  throw new Error(
    "Cloudflare D1 database binding 'DB' was not found in environment context."
  );
}

export * from "./schema";
