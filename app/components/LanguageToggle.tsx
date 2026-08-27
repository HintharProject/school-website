"use client";

import { setLocale, useLocale } from "@/lib/i18n/useT";

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const locale = useLocale();

  return (
    <div
      role="group"
      aria-label="Language / ဘာသာစကား"
      className={`inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5 shadow-sm ${className}`}
    >
      {(["en", "my"] as const).map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLocale(loc)}
          aria-pressed={locale === loc}
          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            locale === loc
              ? "bg-[#0E3B7D] text-white shadow-sm"
              : "text-slate-500 hover:text-[#0E3B7D]"
          }`}
        >
          {loc === "en" ? "EN" : "မြန်မာ"}
        </button>
      ))}
    </div>
  );
}
