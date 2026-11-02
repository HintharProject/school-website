"use client";

import Image from "next/image";
import { Quotes, Star } from "@phosphor-icons/react";
import type { PublicTestimonial } from "@/lib/actions/testimonials";
import type { HomeSectionsContent } from "@/lib/content/defaults";
import { useLocale } from "@/lib/i18n/useT";
import { locField } from "@/lib/i18n/loc";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

export default function TestimonialsSection({
  testimonials,
  sections,
}: {
  testimonials: PublicTestimonial[];
  sections: HomeSectionsContent;
}) {
  const locale = useLocale();

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF3FC] px-3.5 py-1.5 text-xs font-extrabold text-[#193E8A] uppercase tracking-wider">
            <Quotes className="w-4 h-4" weight="fill" />
            <span>
              {locField(
                locale,
                sections.testimonialsBadgeEn,
                sections.testimonialsBadgeMy
              )}
            </span>
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E232B] tracking-tight">
            {locField(
              locale,
              sections.testimonialsTitleEn,
              sections.testimonialsTitleMy
            )}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {locField(
              locale,
              sections.testimonialsSubtitleEn,
              sections.testimonialsSubtitleMy
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => {
            const quote = locField(locale, item.quote, item.quoteMy);
            const role = locField(
              locale,
              item.authorRole || "",
              item.authorRoleMy
            );
            const stars = Math.min(5, Math.max(1, item.rating ?? 5));

            return (
              <article
                key={item.id}
                className="rounded-3xl bg-[#F8FAFC] border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div
                    className="flex items-center gap-1 text-[#ECC300]"
                    aria-label={`${stars} out of 5 stars`}
                  >
                    {Array.from({ length: stars }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4" weight="fill" />
                    ))}
                  </div>
                  <blockquote className="text-sm sm:text-[15px] text-[#1E232B] leading-relaxed">
                    “{quote}”
                  </blockquote>
                </div>

                <div className="flex items-center gap-3.5 pt-4 border-t border-slate-200/80">
                  {item.image ? (
                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-200 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.authorName}
                        fill
                        unoptimized={isR2AssetUrl(item.image)}
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#193E8A] text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                      {item.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-[#1E232B] truncate">
                      {item.authorName}
                    </p>
                    {role && (
                      <p className="text-xs text-slate-600 truncate">{role}</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
