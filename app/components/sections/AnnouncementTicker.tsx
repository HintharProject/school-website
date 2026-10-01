"use client";

import { useLocale, useT } from "@/lib/i18n/useT";
import { locField } from "@/lib/i18n/loc";
import type { AnnouncementItem } from "@/lib/content/defaults";
import { DEFAULT_ANNOUNCEMENTS } from "@/lib/content/defaults";

function normalizeAnnouncements(raw: unknown): AnnouncementItem[] {
  if (!Array.isArray(raw)) return DEFAULT_ANNOUNCEMENTS;
  return raw.map((item) => {
    if (typeof item === "string") return { text: item };
    if (item && typeof item === "object" && "text" in item) {
      const o = item as AnnouncementItem;
      return { text: String(o.text ?? ""), textMy: o.textMy };
    }
    return { text: String(item) };
  }).filter((a) => a.text.trim());
}

export default function AnnouncementTicker({
  messages,
}: {
  messages?: AnnouncementItem[] | string[];
}) {
  const t = useT();
  const locale = useLocale();
  const items = normalizeAnnouncements(messages ?? DEFAULT_ANNOUNCEMENTS);
  const display = items.map((m) => locField(locale, m.text, m.textMy));

  return (
    <section
      id="hero-announcement-ticker"
      aria-label="School announcements"
      className="relative z-20 w-full shrink-0 bg-[#040E1E] text-white py-2.5 sm:py-3 overflow-hidden flex items-center border-t border-[#FFC700]/30 shadow-lg"
    >
      <div className="shrink-0 flex items-center gap-2 pl-3 sm:pl-6 pr-3 sm:pr-4 py-0.5 z-30 bg-[#040E1E]">
        <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-[#FFC700] text-[#09234B] text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#09234B] animate-ping" />
          {t("home.announcementLabel")}
        </span>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...display, ...display].map((msg, idx) => (
            <span key={idx} className="inline-flex items-center mx-8 text-xs font-semibold text-slate-200">
              <span>{msg}</span>
              <span className="text-[#FFC700] ml-8 font-bold">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
