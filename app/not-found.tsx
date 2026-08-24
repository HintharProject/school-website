import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#09234B] px-6 text-center">
      <p className="text-[#FFC700] font-black uppercase tracking-[0.3em] text-xs mb-4">
        Error 404
      </p>
      <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-300 max-w-md mb-8">
        The page you are looking for may have been moved, renamed, or never existed.
        Let&apos;s get you back on track.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] text-xs font-black uppercase tracking-wider transition-colors"
        >
          Return to Home
        </Link>
        <Link
          href="/admission"
          className="px-6 py-2.5 rounded-full border border-white/30 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
        >
          Apply for Admission
        </Link>
      </div>
    </main>
  );
}
