"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, ArrowRight } from "@phosphor-icons/react";
import type { AnnouncementItem } from "@/lib/content/defaults";
import { useLocale } from "@/lib/i18n/useT";
import { locField } from "@/lib/i18n/loc";

export default function AnnouncementTicker({
  items,
}: {
  items: AnnouncementItem[];
}) {
  const locale = useLocale();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const active = items[index % items.length];
  const text = locField(locale, active.text, active.textMy);

  return (
    <div
      role="region"
      aria-label="School Announcements"
      className="bg-[#0F2759] text-white border-b border-white/10"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFD600] px-2.5 py-0.5 text-[10px] font-extrabold text-[#162033] shrink-0">
            <Megaphone className="w-3 h-3" weight="fill" />
            <span>{locale === "my" ? "ကြေညာချက်" : "NOTICE"}</span>
          </span>

          {active.href ? (
            <Link
              href={active.href}
              className="truncate font-medium text-slate-100 hover:text-[#FFD600] transition-colors inline-flex items-center gap-1.5 min-w-0"
            >
              <span className="truncate">{text}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FFD600] shrink-0" weight="bold" />
            </Link>
          ) : (
            <p className="truncate font-medium text-slate-100">{text}</p>
          )}
        </div>

        {items.length > 1 && (
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            {items.map((item, idx) => (
              <button
                key={item.id || idx}
                type="button"
                aria-label={`Show announcement ${idx + 1}`}
                onClick={() => setIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === index % items.length
                    ? "w-4 bg-[#FFD600]"
                    : "w-1.5 bg-white/35 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
