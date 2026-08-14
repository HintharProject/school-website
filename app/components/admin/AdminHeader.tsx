"use client";

import Link from "next/link";

export default function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
      {/* Search / Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="relative w-64 sm:w-80 hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
            search
          </span>
          <input
            type="text"
            placeholder="Quick search student, class, notice..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Visit Site Button */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F0FE] hover:bg-[#0E3B7D] text-[#0E3B7D] hover:text-white text-xs font-bold transition-all"
        >
          <span className="material-symbols-outlined text-sm">visibility</span>
          <span>Live Site</span>
        </Link>

        {/* Notifications */}
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors relative border border-slate-200"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-lg">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-[#09234B] leading-tight">Faculty Admin</p>
            <p className="text-[10px] text-slate-500 font-medium">Hinthar Education</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#09234B] text-[#FFC700] flex items-center justify-center font-black text-xs shadow-sm ring-1 ring-[#FFC700]">
            HIS
          </div>
        </div>
      </div>
    </header>
  );
}
