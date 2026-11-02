"use client";

import { useLocale, useSetLocale } from "@/lib/i18n/useT";

export default function LanguageToggle({
  className = "",
}: {
  className?: string;
}) {
  const locale = useLocale();
  const setLocale = useSetLocale();

  return (
    <div
      role="group"
      aria-label="Language / ဘာသာစကား"
      className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-100/90 p-0.5 ${className}`}
    >
      {(["en", "my"] as const).map((loc) => {
        const active = locale === loc;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => setLocale(loc)}
            aria-pressed={active}
            className={`min-h-8 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer touch-manipulation ${
              active
                ? "bg-[#193E8A] text-white shadow-sm"
                : "text-slate-600 hover:text-[#193E8A]"
            }`}
          >
            {loc === "en" ? "EN" : "မြန်မာ"}
          </button>
        );
      })}
    </div>
  );
}
