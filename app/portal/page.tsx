import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/app/components/Navbar";
import FooterSection from "@/app/components/sections/FooterSection";
import PortalClient from "./PortalClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student Portal | Hinthar International School",
  description:
    "Check the status of your Hinthar International School admission application — review progress, placement test schedules, and final decisions.",
};

export default function StudentPortalPage() {
  return (
    <div className="min-h-screen flex flex-col pt-20 bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-[860px] mx-auto w-full px-4 sm:px-6 md:px-8 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-4 py-1.5 rounded-full mb-4 border border-[#0E3B7D]/20">
            <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">manage_accounts</span>
            <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">
              Student Portal
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#09234B] mb-3 tracking-tight">
            Track Your <span className="text-[#0E3B7D]">Application</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-normal max-w-lg mx-auto">
            Enter the reference code from your application receipt together with the guardian email used during
            submission to see your live admission status.
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-xs text-slate-400">Loading portal…</div>}>
          <PortalClient />
        </Suspense>
      </main>
      <FooterSection />
    </div>
  );
}
