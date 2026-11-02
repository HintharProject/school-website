"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  SealCheck,
  BookOpenText,
} from "@phosphor-icons/react";
import type { HeroContent } from "@/lib/content/defaults";
import { useLocale } from "@/lib/i18n/useT";
import { locField } from "@/lib/i18n/loc";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

export default function HeroSection({ hero }: { hero: HeroContent }) {
  const locale = useLocale();

  const credentialBadge = locField(
    locale,
    hero.credentialBadgeEn,
    hero.credentialBadgeMy
  );
  const intakePill = locField(locale, hero.intakePillEn, hero.intakePillMy);
  const titleLine1 = locField(locale, hero.titleLine1En, hero.titleLine1My);
  const titleHighlight = locField(
    locale,
    hero.titleHighlightEn,
    hero.titleHighlightMy
  );
  const subtitle = locField(locale, hero.subtitleEn, hero.subtitleMy);
  const primaryCta = locField(locale, hero.primaryCtaEn, hero.primaryCtaMy);
  const secondaryCta = locField(
    locale,
    hero.secondaryCtaEn,
    hero.secondaryCtaMy
  );
  const trustNote = locField(locale, hero.trustNoteEn, hero.trustNoteMy);
  const imageCaption = locField(
    locale,
    hero.heroImageCaptionEn,
    hero.heroImageCaptionMy
  );
  const heroImg = hero.heroImageUrl || "/images/graduation.webp";

  return (
    <section className="relative bg-white overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24 border-b border-slate-100">
      {/* Subtle White-First Ambient Cobalt Wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 w-[560px] h-[560px] rounded-full bg-[#EEF3FC]/80 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-40 -left-28 w-[360px] h-[360px] rounded-full bg-[#FFFBE6]/80 blur-3xl"
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Split Framed Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Authoritative Institutional Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF3FC] border border-[#193E8A]/15 px-3.5 py-1.5 text-xs font-bold text-[#193E8A]">
                <SealCheck className="w-4 h-4 text-[#193E8A] shrink-0" weight="fill" />
                <span>{credentialBadge}</span>
              </span>
              {intakePill && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD600] px-3 py-1.5 text-xs font-extrabold text-[#162033]">
                  <span>{intakePill}</span>
                </span>
              )}
            </div>

            <h1 className={`font-extrabold text-[#1E232B] ${locale === "my" ? "text-2xl sm:text-3xl md:text-[32px] lg:text-[36px] xl:text-[40px] leading-[1.34] tracking-normal" : "text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[44px] leading-[1.16] tracking-tight"}`}>
              <span className="block">{titleLine1}</span>
              <span className="block text-[#193E8A] mt-1">{titleHighlight}</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              {subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/admission"
                className="inline-flex items-center justify-center gap-2.5 min-h-12 px-7 py-3.5 rounded-full bg-[#FFD600] hover:bg-[#ECC300] text-[#162033] text-sm font-extrabold shadow-gold transition-all active:scale-[0.98]"
              >
                <span>{primaryCta}</span>
                <ArrowRight className="w-4 h-4 shrink-0" weight="bold" />
              </Link>

              <a
                href="#classes"
                className="inline-flex items-center justify-center gap-2 min-h-12 px-6 py-3.5 rounded-full bg-white hover:bg-[#EEF3FC] text-[#193E8A] border-2 border-[#193E8A]/20 hover:border-[#193E8A]/40 text-sm font-extrabold transition-all"
              >
                <BookOpenText className="w-4 h-4 shrink-0" weight="duotone" />
                <span>{secondaryCta}</span>
              </a>
            </div>

            {trustNote && (
              <p className="text-xs sm:text-sm font-medium text-slate-500 flex items-center gap-2 pt-1">
                <GraduationCap className="w-4 h-4 text-[#193E8A] shrink-0" weight="duotone" />
                <span>{trustNote}</span>
              </p>
            )}
          </div>

          {/* Right Column: Framed Photograph with Cobalt & Gold Identity Frame */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <div
                aria-hidden="true"
                className="absolute -inset-2.5 rounded-[28px] bg-gradient-to-br from-[#193E8A] via-[#2352B0] to-[#FFD600] opacity-15 blur-xs"
              />
              <div className="relative rounded-3xl overflow-hidden bg-slate-100 border-2 border-slate-200/90 shadow-hinthar aspect-[4/3] sm:aspect-[5/4]">
                <Image
                  src={heroImg}
                  alt={imageCaption || "Hinthar International School Scholars"}
                  fill
                  priority
                  unoptimized={isR2AssetUrl(heroImg)}
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0F2759]/90 via-[#0F2759]/45 to-transparent p-4 sm:p-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#FFD600] px-2.5 py-0.5 text-[10px] font-extrabold text-[#162033] mb-1.5">
                    Pearson Edexcel
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                    {imageCaption}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Key Highlight Stat Cards */}
        {hero.highlights?.length > 0 && (
          <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {hero.highlights.map((item, idx) => {
              const val = locField(locale, item.value, item.valueMy);
              const label = locField(locale, item.label, item.labelMy);
              const sub = locField(locale, item.sub, item.subMy);
              return (
                <div
                  key={`${item.value}-${idx}`}
                  className="rounded-2xl bg-[#F8FAFC] border border-slate-200/90 p-4 sm:p-5 hover:border-[#193E8A]/30 hover:bg-white hover:shadow-sm transition-all"
                >
                  <p className="text-xl sm:text-2xl font-extrabold text-[#193E8A] tracking-tight">
                    {val}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-[#1E232B] mt-1">
                    {label}
                  </p>
                  {sub && (
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                      {sub}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
