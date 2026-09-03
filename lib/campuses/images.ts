import type { CampusRecord } from "@/app/admin/adminStore";

const FALLBACK_IMAGE = "/images/g2.jpg";

/** Parses gallery_urls JSON (or array) from D1 into a clean URL list. */
export function parseGalleryUrls(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((url): url is string => typeof url === "string" && url.trim().length > 0);
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((url): url is string => typeof url === "string" && url.trim().length > 0)
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Showcase + gallery photos from database — deduped, URLs used as stored in D1/R2. */
export function resolveCampusImages(
  campus: Pick<CampusRecord, "imageUrl" | "galleryUrls">
): string[] {
  const primary = campus.imageUrl?.trim();
  const gallery = parseGalleryUrls(campus.galleryUrls);
  const combined = primary
    ? [primary, ...gallery.filter((url) => url !== primary)]
    : gallery;
  const unique = [...new Set(combined.filter(Boolean))];
  return unique.length > 0 ? unique : [FALLBACK_IMAGE];
}
