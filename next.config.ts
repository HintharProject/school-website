import type { NextConfig } from "next";
import path from "node:path";
import os from "node:os";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Persist local Cloudflare bindings (D1/R2/KV) outside the project/Desktop folder.
// Antivirus "ransomware protection" shields block workerd.exe writes under Desktop,
// which made every local D1 write fail with SQLITE_READONLY (e.g. login sessions).
const localAppData =
  process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
const devPersistTo = path.join(localAppData, "hinthar-dev", "wrangler-state");

console.log(`[next.config] Local Cloudflare bindings persistTo: ${devPersistTo}`);
// NOTE: wrangler CLI's `--persist-to` appends a `v3` segment itself, while the
// platform proxy `persist: { path }` does not — point it at the same `v3` root.
// Local bindings must live outside the Desktop folder because antivirus
// ransomware shields block workerd.exe writes there (SQLITE_READONLY).
initOpenNextCloudflareForDev({
  persistTo: devPersistTo,
  persist: { path: path.join(devPersistTo, "v3") },
} as Parameters<typeof initOpenNextCloudflareForDev>[0]);

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 95],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "hinthar.education",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Auth-gated, action-bearing pages must never be served from browser
        // or CDN caches — stale HTML references stale Server Action IDs.
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, must-revalidate" }],
      },
      {
        source: "/admission",
        headers: [{ key: "Cache-Control", value: "private, no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;

