"use client";

import { useState } from "react";
import { Question, CaretDown } from "@phosphor-icons/react";
import type { FaqItem, HomeSectionsContent } from "@/lib/content/defaults";
import { useLocale } from "@/lib/i18n/useT";
import { locField } from "@/lib/i18n/loc";

export default function FaqSection({
  faqs,
  sections,
}: {
  faqs: FaqItem[];
  sections: HomeSectionsContent;
}) {
  const locale = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(() => {
    const def = faqs.findIndex((f) => f.defaultOpen);
    return def >= 0 ? def : 0;
  });

  if (!faqs || faqs.length === 0) return null;

  return (
    <section
      id="faq"
      className="py-16 sm:py-24 bg-[#F8FAFC] scroll-mt-20"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF3FC] px-3.5 py-1.5 text-xs font-extrabold text-[#193E8A] uppercase tracking-wider">
            <Question className="w-4 h-4" weight="duotone" />
            <span>
              {locField(locale, sections.faqBadgeEn, sections.faqBadgeMy)}
            </span>
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E232B] tracking-tight">
            {locField(locale, sections.faqTitleEn, sections.faqTitleMy)}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {locField(locale, sections.faqSubtitleEn, sections.faqSubtitleMy)}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const q = locField(locale, faq.question, faq.questionMy);
            const a = locField(locale, faq.answer, faq.answerMy);

            return (
              <div
                key={faq.id || `${faq.question}-${idx}`}
                className={`rounded-2xl border transition-colors bg-white ${
                  isOpen
                    ? "border-[#193E8A]/40 shadow-xs"
                    : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-[#1E232B]">
                    {q}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-all ${
                      isOpen
                        ? "bg-[#193E8A] text-white rotate-180"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <CaretDown className="w-4 h-4" weight="bold" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    <p className="pt-3.5">{a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
