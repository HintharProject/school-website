"use client";

import Link from "next/link";
import { WarningCircle, ArrowCounterClockwise, House } from "@phosphor-icons/react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#EEF3FC] text-[#193E8A] flex items-center justify-center mb-5">
        <WarningCircle className="w-9 h-9" weight="duotone" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E232B] mb-3">
        Something Went Wrong
      </h1>
      <p className="text-sm text-slate-600 max-w-md mb-8 leading-relaxed">
        An unexpected error occurred while loading this page. Please try again or return to the home page.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#193E8A] hover:bg-[#2352B0] text-white text-xs font-extrabold transition-colors cursor-pointer"
        >
          <ArrowCounterClockwise className="w-4 h-4" weight="bold" />
          <span>Try Again</span>
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 bg-white text-[#1E232B] text-xs font-bold hover:bg-slate-100 transition-colors"
        >
          <House className="w-4 h-4" weight="bold" />
          <span>Return to Home</span>
        </Link>
      </div>
    </main>
  );
}
