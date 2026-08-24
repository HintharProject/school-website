"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <span aria-hidden="true" className="material-symbols-outlined text-5xl text-[#0E3B7D] mb-4">
        report_problem
      </span>
      <h1 className="text-2xl sm:text-3xl font-black text-[#09234B] mb-3">
        Something Went Wrong
      </h1>
      <p className="text-sm text-slate-600 max-w-md mb-8">
        An unexpected error occurred while loading this page. Our team has been notified —
        please try again in a moment.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-6 py-2.5 rounded-full bg-[#0E3B7D] hover:bg-[#164E9A] text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
        >
          Try Again
        </button>
        <a
          href="/"
          className="px-6 py-2.5 rounded-full border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors"
        >
          Return to Home
        </a>
      </div>
    </main>
  );
}
