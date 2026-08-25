"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import AnnouncementTicker from "./AnnouncementTicker";
import { DEFAULT_HIGHLIGHTS, type KeyHighlight } from "@/lib/content/defaults";

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
}: {
  highlights?: KeyHighlight[];
}) {
  return (
    <section
      id="home"
      className="relative min-h-[100svh] lg:h-[100svh] flex flex-col justify-between overflow-hidden bg-[#06152B]"
    >
      {/* ─── High-Resolution Photographic Background ───────────── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/graduation.webp"
          alt="Hinthar International School Campus and Scholars"
          fill
          sizes="100vw"
          className="object-cover object-center scale-105"
          priority
          quality={95}
        />
        {/* Balanced cinematic overlays to showcase graduation.webp vividly */}
        <div className="absolute inset-0 bg-[#06152B]/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#09234B]/85 via-[#0A1F42]/40 to-[#06152B]/95" />
        {/* Center vignette keeps headline/CTAs readable over the photo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,21,43,0.30)_0%,rgba(6,21,43,0.78)_100%)]" />
        {/* Subtle warm gold ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-[#FFC700]/15 rounded-full blur-[130px] pointer-events-none" />
      </div>

      {/* ─── Hero Main Content Area ───────────────────────────── */}
      <div className="relative z-10 w-full max-w-[1080px] mx-auto px-6 md:px-8 pt-28 sm:pt-32 lg:pt-36 pb-10 lg:pb-14 my-auto flex flex-col items-center justify-center text-center">

        {/* ─── Centered Hero Story ─── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full flex flex-col items-center text-center"
        >
            {/* Accreditation Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#FFC700]/40 shadow-sm mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-[#FFC700] animate-pulse" />
              <span className="text-[11px] font-extrabold text-[#FFC700] tracking-[0.16em] uppercase">
                Official Pearson Edexcel Examination Centre · Yangon
              </span>
            </motion.div>

            {/* Prestige Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl xl:text-[64px] font-black text-white leading-[1.08] tracking-tight mb-5 drop-shadow-[0_2px_16px_rgba(4,14,30,0.85)]"
            >
              Shaping Global Scholars.{" "}
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-[#FFC700] via-[#FFE48A] to-[#FFC700]">
                Delivering Excellence.
              </span>
            </motion.h1>

            {/* Clear Mission Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-3xl mx-auto mb-8 font-normal"
            >
              Yangon’s premier international institution offering a rigorous, continuous British curriculum from{" "}
              <strong className="text-white font-semibold">Lower Secondary (Year 7–9)</strong> through{" "}
              <strong className="text-white font-semibold">Pearson Edexcel IGCSE &amp; International A-Level (IAL)</strong> — preparing Myanmar&apos;s youth for world-class universities.
            </motion.p>

            {/* High-Contrast Action CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mb-8 lg:mb-9 w-full"
            >
              <Link
                href="/admission"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FFC700]/25 hover:scale-[1.03] active:scale-[0.98] transition-all"
              >
                <span>Apply for 2026–2027</span>
                <span aria-hidden="true" className="material-symbols-outlined text-base font-black">arrow_forward</span>
              </Link>

              <Link
                href="/classes"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-bold text-xs uppercase tracking-wider hover:scale-[1.03] active:scale-[0.98] transition-all"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">menu_book</span>
                <span>Curriculum &amp; Syllabi</span>
              </Link>

              <Link
                href="/chatbot"
                className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-full bg-transparent hover:bg-white/10 text-[#FFC700] border border-[#FFC700]/40 font-bold text-xs uppercase tracking-wider transition-all"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">smart_toy</span>
                <span>Admissions AI</span>
              </Link>
            </motion.div>

            {/* Quick Pillars */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl mx-auto pt-6 border-t border-white/15"
            >
              {highlights.map((stat, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-bold text-[#FFC700] uppercase tracking-wider mt-0.5">
                    {stat.label}
                  </span>
                  <span className="text-[10px] text-slate-300 font-light">
                    {stat.sub}
                  </span>
                </div>
              ))}
            </motion.div>
        </motion.div>

      </div>

      {/* ─── Bottom Live Announcement Bar (fits within 100svh) ─── */}
      <AnnouncementTicker />
    </section>
  );
}
