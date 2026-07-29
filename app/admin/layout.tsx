import type { Metadata } from "next";
import AdminLayoutWrapper from "./AdminLayoutWrapper";

export const metadata: Metadata = {
  title: "Admin Portal | Hinthar International School",
  description: "Secure admin dashboard for Hinthar International School.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
