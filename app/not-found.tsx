import Link from "next/link";
import { Compass, ArrowRight } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#EEF3FC] text-[#193E8A] flex items-center justify-center mb-5">
        <Compass className="w-9 h-9" weight="duotone" />
      </div>
      <p className="text-[#193E8A] font-extrabold uppercase tracking-widest text-xs mb-2">
        404 · Page Not Found
      </p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E232B] mb-3 tracking-tight">
        This page has moved or does not exist
      </h1>
      <p className="text-sm text-slate-600 max-w-md mb-8 leading-relaxed">
        Explore Hinthar International School&apos;s Pearson Edexcel pathways, campuses, yearbook, or online admissions below.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#193E8A] hover:bg-[#2352B0] text-white text-xs font-extrabold transition-colors"
        >
          <span>Back to Home</span>
        </Link>
        <Link
          href="/admission"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFD600] hover:bg-[#ECC300] text-[#162033] text-xs font-extrabold transition-colors"
        >
          <span>Apply for Admission</span>
          <ArrowRight className="w-4 h-4" weight="bold" />
        </Link>
      </div>
    </main>
  );
}
