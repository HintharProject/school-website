import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export type PublicCacheTag =
  | "site-content"
  | "campuses"
  | "programs"
  | "testimonials"
  | "yearbook"
  | "clubs"
  | "activities";

interface MemoryEntry<T> {
  value: T;
  expiresAt: number;
  tags: PublicCacheTag[];
}

declare global {
  var __hintharPublicCache: Map<string, MemoryEntry<unknown>> | undefined;
}

function getStore(): Map<string, MemoryEntry<unknown>> {
  if (!globalThis.__hintharPublicCache) {
    globalThis.__hintharPublicCache = new Map();
  }
  return globalThis.__hintharPublicCache;
}

/**
 * Fast two-tier public cache (Worker isolate memory + Next.js unstable_cache)
 * with instant tag-based invalidation when Admin updates content.
 */
export async function cachedPublicRead<T>(
  key: string,
  tags: PublicCacheTag[],
  loader: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const store = getStore();
  const now = Date.now();
  const hit = store.get(key) as MemoryEntry<T> | undefined;
  if (hit && hit.expiresAt > now) {
    return hit.value;
  }

  let data: T;
  try {
    const nextCached = unstable_cache(loader, [`hinthar:${key}`], {
      tags,
      revalidate: ttlSeconds,
    });
    data = await nextCached();
  } catch {
    data = await loader();
  }

  store.set(key, {
    value: data,
    expiresAt: now + ttlSeconds * 1000,
    tags,
  });

  return data;
}

/**
 * Purges both isolate memory cache and Next.js route/tag caches immediately
 * after an Admin mutation. Never throws so committed D1 writes never fail.
 */
export function invalidatePublicCache(
  tags: PublicCacheTag[],
  paths: string[] = ["/"]
): void {
  const store = getStore();
  for (const [k, entry] of store.entries()) {
    if (entry.tags.some((t) => tags.includes(t))) {
      store.delete(k);
    }
  }

  for (const tag of tags) {
    try {
      revalidateTag(tag, "max");
    } catch {
      // Safe fallback in environments without incremental tag cache
    }
  }

  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch {
      // Safe fallback on Workers without incremental route cache binding
    }
  }
}

