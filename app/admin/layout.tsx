import type { Metadata } from "next";
import AdminLayoutWrapper from "./AdminLayoutWrapper";

// Admin pages call Server Actions (campus/yearbook/user mutations, etc.).
// Rendering them dynamically guarantees the served HTML always references
// the CURRENT deployment's action IDs — statically prerendered shells kept
// referencing stale IDs after redeploys and produced 404s on save.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Portal | Hinthar International School",
  description: "Secure admin dashboard for Hinthar International School.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
