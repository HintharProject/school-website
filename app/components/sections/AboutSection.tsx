"use client";

import Image from "next/image";
import Link from "next/link";
import { Quotes, Buildings, ArrowRight } from "@phosphor-icons/react";
import type { AboutPrincipalContent } from "@/lib/content/defaults";
import { useLocale } from "@/lib/i18n/useT";
import { locField } from "@/lib/i18n/loc";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

export default function AboutSection({
  about,
}: {
  about: AboutPrincipalContent;
}) {
  const locale = useLocale();

  const badge = locField(locale, about.badgeEn, about.badgeMy);
  const title = locField(locale, about.titleEn, about.titleMy);
  const titleHighlight = locField(
    locale,
    about.titleHighlightEn,
    about.titleHighlightMy
  );
  const p1 = locField(locale, about.paragraph1En, about.paragraph1My);
  const p2 = locField(locale, about.paragraph2En, about.paragraph2My);
  const cta = locField(
    locale,
    about.exploreCampusesCtaEn,
    about.exploreCampusesCtaMy
  );
  const principalRole = locField(
    locale,
    about.principalRoleEn,
    about.principalRoleMy
  );
  const principalQuote = locField(
    locale,
    about.principalQuoteEn,
    about.principalQuoteMy
  );
  const portraitSrc = about.principalImageUrl || "/images/dr-kmh.webp";

  return (
    <section
      id="about"
      className="py-16 sm:py-24 bg-[#F8FAFC] scroll-mt-20 border-b border-slate-200/70"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Principal Portrait & Message Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-hinthar overflow-hidden">
              <div className="relative aspect-[4/4] sm:aspect-[5/4] bg-gradient-to-b from-[#EEF3FC] to-slate-100">
                <Image
                  src={portraitSrc}
                  alt={about.principalName}
                  fill
                  unoptimized={isR2AssetUrl(portraitSrc)}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-top"
                />
              </div>

              <div className="p-6 sm:p-7 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#1E232B]">
                      {about.principalName}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-[#193E8A] mt-0.5">
                      {principalRole}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#FFFBE6] text-[#193E8A] border border-[#FFD600]/60 flex items-center justify-center shrink-0">
                    <Quotes className="w-5 h-5" weight="fill" />
                  </div>
                </div>

                <blockquote className="text-sm text-slate-600 leading-relaxed italic border-l-3 border-[#FFD600] pl-4">
                  “{principalQuote}”
                </blockquote>
              </div>
            </div>
          </div>

          {/* Institutional Story & Key Facts */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF3FC] px-3.5 py-1.5 text-xs font-extrabold text-[#193E8A] uppercase tracking-wider">
              <Buildings className="w-4 h-4" weight="duotone" />
              <span>{badge}</span>
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E232B] tracking-tight leading-tight">
              <span>{title} </span>
              <span className="text-[#193E8A]">{titleHighlight}</span>
            </h2>

            <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
              <p>{p1}</p>
              {p2 && <p>{p2}</p>}
            </div>

            {about.stats?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2">
                {about.stats.map((stat, idx) => (
                  <div
                    key={`${stat.value}-${idx}`}
                    className="rounded-2xl bg-white border border-slate-200/90 px-4 py-3.5"
                  >
                    <p className="text-lg sm:text-xl font-extrabold text-[#193E8A]">
                      {locField(locale, stat.value, stat.valueMy)}
                    </p>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      {locField(locale, stat.label, stat.labelMy)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/campuses"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-[#193E8A] hover:text-[#2352B0] group"
              >
                <span>{cta}</span>
                <ArrowRight
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  weight="bold"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
