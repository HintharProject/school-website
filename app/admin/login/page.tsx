import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { bootstrapInitialAdmin } from "@/lib/auth/bootstrap";

export const metadata: Metadata = {
  title: "Admin Login | Hinthar International School",
  description: "Secure login for Hinthar International School staff.",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  try {
    await bootstrapInitialAdmin();
  } catch (err) {
    console.warn("Auto-bootstrap initial admin notice:", err);
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09234B] flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

