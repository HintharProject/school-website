"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import AnnouncementTicker from "./AnnouncementTicker";
import { DEFAULT_HIGHLIGHTS, type KeyHighlight, type AnnouncementItem } from "@/lib/content/defaults";
import { useLocale, useT } from "@/lib/i18n/useT";
import { locField } from "@/lib/i18n/loc";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 75, damping: 18 },
  },
};

export default function HeroSection({
  highlights = DEFAULT_HIGHLIGHTS,
  announcements,
}: {
  highlights?: KeyHighlight[];
  announcements?: AnnouncementItem[] | string[];
}) {
  const t = useT();
  const locale = useLocale();

  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex flex-col justify-between bg-[#06152B]"
    >
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/images/graduation.webp"
          alt="Hinthar International School Campus and Scholars"
          fill
          sizes="100vw"
          className="object-cover object-center scale-105"
          priority
          quality={95}
        />
        <div className="absolute inset-0 bg-[#06152B]/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#09234B]/75 via-transparent to-[#06152B]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_45%,rgba(6,21,43,0.15)_0%,rgba(6,21,43,0.65)_100%)]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-[#FFC700]/10 rounded-full blur-[140px] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-[1080px] mx-auto px-4 sm:px-6 md:px-8 pt-24 sm:pt-28 lg:pt-32 pb-6 sm:pb-8 my-auto flex flex-col items-center justify-center text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full flex flex-col items-center text-center"
        >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#FFC700]/40 shadow-sm mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-[#FFC700] animate-pulse" />
              <span className="text-[11px] font-extrabold text-[#FFC700] tracking-[0.16em] uppercase">
                {t("home.heroBadge")}
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl xl:text-[64px] font-black text-white leading-[1.08] tracking-tight mb-5 drop-shadow-[0_2px_16px_rgba(4,14,30,0.85)]"
            >
              {t("home.heroTitle1")}{" "}
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-[#FFC700] via-[#FFE48A] to-[#FFC700]">
                {t("home.heroTitle2")}
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-3xl mx-auto mb-8 font-normal"
            >
              {t("home.heroSubtitle")}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mb-8 lg:mb-9 w-full"
            >
              <Link
                href="/admission"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FFC700]/25 hover:scale-[1.03] active:scale-[0.98] transition-all"
              >
                <span>{t("home.heroCtaApply")}</span>
                <span aria-hidden="true" className="material-symbols-outlined text-base font-black">arrow_forward</span>
              </Link>

              <Link
                href="/classes"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-bold text-xs uppercase tracking-wider hover:scale-[1.03] active:scale-[0.98] transition-all"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">menu_book</span>
                <span>{t("home.heroCtaCurriculum")}</span>
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl mx-auto pt-6"
            >
              {highlights.map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center rounded-2xl border border-white/15 bg-white/8 px-3 py-4 backdrop-blur-md transition-colors hover:bg-white/12"
                >
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {locField(locale, stat.value, stat.valueMy)}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#FFC700] uppercase tracking-wider mt-1">
                    {locField(locale, stat.label, stat.labelMy)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-300/90 font-light mt-0.5 leading-snug">
                    {locField(locale, stat.sub, stat.subMy)}
                  </span>
                </div>
              ))}
            </motion.div>
        </motion.div>
      </div>

      <AnnouncementTicker messages={announcements} />
    </section>
  );
}
