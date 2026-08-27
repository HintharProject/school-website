/**
 * R2 asset helper — detects URLs served via Cloudflare R2 (`/api/assets/...`)
 * or inline data URLs that must bypass Next.js image optimization.
 *
 * On Cloudflare Workers (OpenNext), `/_next/image?url=/api/assets/...` tries to
 * fetch the source image through the Image Optimization API, which then does
 * an internal fetch to the same Worker. That path fails to resolve the R2
 * binding reliably and returns 404, while a direct browser fetch to
 * `/api/assets/...` succeeds (hence preview works but public pages 404).
 *
 * Setting `unoptimized` for R2 URLs makes Next serve them as plain <img> with
 * the original src, avoiding the optimizer entirely. Static `/images/...`
 * assets remain optimized.
 */
export function isR2AssetUrl(src: string | null | undefined): boolean {
  if (!src) return false;
  return src.startsWith("/api/assets/") || src.startsWith("data:");
}

export function r2ImageProps(src: string): { unoptimized: boolean } {
  return { unoptimized: isR2AssetUrl(src) };
}
