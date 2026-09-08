import type { Metadata } from "next";
import { Suspense } from "react";
import AdmissionForm from "./AdmissionForm";

// The admission wizard submits a Server Action; keep the page dynamic so
// visitors never execute stale action IDs after a redeploy.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admissions | Hinthar International School",
  description:
    "Apply to Hinthar International School. Take the first step towards a brighter future by filling out our online application form.",
};

export default function AdmissionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 text-center text-sm text-slate-500">Loading admission form…</div>}>
      <AdmissionForm />
    </Suspense>
  );
}
