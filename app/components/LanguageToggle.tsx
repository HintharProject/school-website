"use client";

import { setLocale, useLocale } from "@/lib/i18n/useT";

export default function LanguageToggle({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "transparent";
}) {
  const locale = useLocale();
  const isTransparent = variant === "transparent";

  return (
    <div
      role="group"
      aria-label="Language / ဘာသာစကား"
      className={`inline-flex items-center rounded-full border p-0.5 shadow-sm ${
        isTransparent
          ? "border-white/25 bg-white/10 backdrop-blur-md shadow-none"
          : "border-slate-200 bg-white"
      } ${className}`}
    >
      {(["en", "my"] as const).map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLocale(loc)}
          aria-pressed={locale === loc}
          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            locale === loc
              ? isTransparent
                ? "bg-[#FFC700] text-[#09234B] shadow-sm"
                : "bg-[#0E3B7D] text-white shadow-sm"
              : isTransparent
                ? "text-white/80 hover:text-white"
                : "text-slate-500 hover:text-[#0E3B7D]"
          }`}
        >
          {loc === "en" ? "EN" : "မြန်မာ"}
        </button>
      ))}
    </div>
  );
}
