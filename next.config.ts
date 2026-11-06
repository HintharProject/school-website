import type { NextConfig } from "next";
import path from "node:path";
import os from "node:os";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Persist local Cloudflare bindings (D1/R2/KV) outside the project/Desktop folder.
// Antivirus "ransomware protection" shields block workerd.exe writes under Desktop.
const localAppData =
  process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
const devPersistTo = path.join(localAppData, "hinthar-dev", "wrangler-state");

console.log(`[next.config] Local Cloudflare bindings persistTo: ${devPersistTo}`);
initOpenNextCloudflareForDev({
  persistTo: devPersistTo,
  persist: { path: path.join(devPersistTo, "v3") },
} as Parameters<typeof initOpenNextCloudflareForDev>[0]);

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    unoptimized: isDev,
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "hinthar.education" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/classes", destination: "/#classes", permanent: true },
      { source: "/portal", destination: "/admission?tab=track", permanent: true },
      { source: "/activities", destination: "/clubs#activities", permanent: true },
      { source: "/staff", destination: "/#about", permanent: true },
      { source: "/news", destination: "/", permanent: true },
      { source: "/news/:slug*", destination: "/", permanent: true },
      { source: "/chatbot", destination: "/", permanent: true },
      { source: "/admin/content", destination: "/admin/home", permanent: false },
      { source: "/admin/classes", destination: "/admin/home", permanent: false },
      { source: "/admin/testimonials", destination: "/admin/home", permanent: false },
      { source: "/admin/people", destination: "/admin/yearbook", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
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
