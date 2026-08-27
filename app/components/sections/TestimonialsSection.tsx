"use client";

import Image from "next/image";
import { useT } from "@/lib/i18n/useT";
import type { PublicTestimonial } from "@/lib/actions/testimonials";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

export default function TestimonialsSection({ items }: { items: PublicTestimonial[] }) {
  const t = useT();

  if (!items.length) return null;

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white scroll-mt-20">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-4 py-1.5 rounded-full mb-4 border border-[#0E3B7D]/20">
            <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">forum</span>
            <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">Testimonials</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#09234B] mb-3 tracking-tight">
            {t("home.testimonialsTitle")}
          </h2>
          <p className="text-sm md:text-base text-slate-600 font-normal max-w-xl mx-auto">
            {t("home.testimonialsSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.slice(0, 6).map((item) => (
            <figure
              key={item.id}
              className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[#FFC700] text-3xl mb-2">format_quote</span>
              <blockquote className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed flex-1">
                {item.quote}
              </blockquote>
              {typeof item.rating === "number" && item.rating >= 1 && item.rating <= 5 && (
                <div className="flex gap-0.5 pt-3" aria-label={`${item.rating} out of 5 stars`}>
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <span key={i} aria-hidden="true" className="material-symbols-outlined text-[#FFC700] text-sm">star</span>
                  ))}
                </div>
              )}
              <figcaption className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-100">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 ring-2 ring-[#FFC700]/50 shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.authorName} fill unoptimized={isR2AssetUrl(item.image)} className="object-cover" sizes="40px" />
                  ) : (
                    <div className="w-full h-full bg-[#0E3B7D] flex items-center justify-center text-white text-xs font-black">
                      {item.authorName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-[#09234B]">{item.authorName}</p>
                  {item.authorRole && (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.authorRole}</p>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
