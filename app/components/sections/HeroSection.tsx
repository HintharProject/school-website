"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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

const pathways = [
  {
    title: "Lower Secondary",
    years: "Year 7 – Year 9",
    age: "Ages 11 – 14",
    desc: "Foundational STEM inquiry, critical numeracy, and pre-IGCSE analytical skills.",
    badge: "Middle School",
  },
  {
    title: "Pearson Edexcel IGCSE",
    years: "Year 10 – Year 11",
    age: "Ages 14 – 16",
    desc: "Global UK secondary benchmarks across Pure Sciences, Computing & Commerce.",
    badge: "Upper Secondary",
  },
  {
    title: "Pearson Edexcel IAL",
    years: "Year 12 – Year 13",
    age: "Ages 16 – 18",
    desc: "Modular A-Levels for direct admission to world-ranked international universities.",
    badge: "Pre-University",
  },
];

const keyHighlights = [
  { value: "100%", label: "University Placement", sub: "Global Admissions" },
  { value: "Yr 7–13", label: "Academic Continuum", sub: "Pearson Edexcel" },
  { value: "15+", label: "Years Excellence", sub: "Accredited Faculty" },
  { value: "100%", label: "Exam Board Center", sub: "British Council Partner" },
];

export default function HeroSection() {
  const [selectedPathway, setSelectedPathway] = useState(0);

  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden bg-[#06152B]"
    >
      {/* ─── High-Resolution Photographic Background ───────────── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/graduation.jpg"
          alt="Hinthar International School Campus and Scholars"
          fill
          className="object-cover object-center scale-105"
          priority
          quality={95}
        />
        {/* Balanced cinematic overlays to showcase graduation.jpg vividly */}
        <div className="absolute inset-0 bg-[#06152B]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06152B]/85 via-[#06152B]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06152B]/95 via-transparent to-[#06152B]/40" />
        {/* Subtle warm gold ambient glow */}
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#FFC700]/15 rounded-full blur-[130px] pointer-events-none" />
      </div>

      {/* ─── Hero Main Content Area ───────────────────────────── */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 md:px-8 pt-36 pb-16 lg:pt-40 lg:pb-20 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">

          {/* ─── Left Column (7 cols): Hero Headline & Story ─── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-7 flex flex-col items-start text-left"
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
              className="text-4xl sm:text-5xl md:text-6xl xl:text-[68px] font-black text-white leading-[1.08] tracking-tight mb-6"
            >
              Shaping Global Scholars.{" "}
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-[#FFC700] via-[#FFE48A] to-[#FFC700]">
                Delivering Excellence.
              </span>
            </motion.h1>

            {/* Clear Mission Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mb-9 font-normal"
            >
              Yangon’s premier international institution offering a rigorous, continuous British curriculum from{" "}
              <strong className="text-white font-semibold">Lower Secondary (Year 7–9)</strong> through{" "}
              <strong className="text-white font-semibold">Pearson Edexcel IGCSE &amp; International A-Level (IAL)</strong> — preparing Myanmar&apos;s youth for world-class universities.
            </motion.p>

            {/* High-Contrast Action CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3.5 sm:gap-4 mb-10 w-full"
            >
              <Link
                href="/admission"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FFC700]/25 hover:scale-[1.03] active:scale-[0.98] transition-all"
              >
                <span>Apply for 2026–2027</span>
                <span className="material-symbols-outlined text-base font-black">arrow_forward</span>
              </Link>

              <Link
                href="/classes"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-bold text-xs uppercase tracking-wider hover:scale-[1.03] active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-base">menu_book</span>
                <span>Curriculum &amp; Syllabi</span>
              </Link>

              <Link
                href="/chatbot"
                className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-full bg-transparent hover:bg-white/10 text-[#FFC700] border border-[#FFC700]/40 font-bold text-xs uppercase tracking-wider transition-all"
              >
                <span className="material-symbols-outlined text-base">smart_toy</span>
                <span>Admissions AI</span>
              </Link>
            </motion.div>

            {/* Quick Pillars */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-6 border-t border-white/15"
            >
              {keyHighlights.map((stat, i) => (
                <div key={i} className="flex flex-col">
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

          {/* ─── Right Column (5 cols): Academic Continuum Showcase ─── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-5 w-full"
          >
            <div className="bg-[#06152B]/35 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">

              {/* Header inside Card */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/15">
                <div>
                  <span className="text-[10px] font-black text-[#FFC700] uppercase tracking-[0.2em] block mb-1">
                    Academic Continuum
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    Year 7 to Year 13 Pathways
                  </h3>
                </div>
                <div className="relative w-10 h-10 rounded-full bg-white/90 p-0.5 ring-2 ring-[#FFC700] shrink-0">
                  <Image
                    src="/images/mainLogo.png"
                    alt="Hinthar Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Pathway Interactive Selection */}
              <div className="space-y-3">
                {pathways.map((item, idx) => {
                  const isSelected = selectedPathway === idx;
                  return (
                    <div
                      key={item.title}
                      onClick={() => setSelectedPathway(idx)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border text-left ${
                        isSelected
                          ? "bg-[#0E3B7D]/40 border-[#FFC700] shadow-md ring-1 ring-[#FFC700]/30"
                          : "bg-black/15 border-white/10 hover:bg-black/25 hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              isSelected ? "bg-[#FFC700] text-[#09234B]" : "bg-white/15 text-slate-200"
                            }`}
                          >
                            {item.badge}
                          </span>
                          <span className="text-xs font-bold text-slate-300">
                            {item.years} ({item.age})
                          </span>
                        </div>
                        <span
                          className={`material-symbols-outlined text-base ${
                            isSelected ? "text-[#FFC700]" : "text-slate-400"
                          }`}
                        >
                          {isSelected ? "check_circle" : "chevron_right"}
                        </span>
                      </div>

                      <h4 className={`text-sm font-bold ${isSelected ? "text-white" : "text-slate-200"}`}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-300 font-light mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Action Inside Card */}
              <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-300 font-medium">
                  Pearson Edexcel Accredited
                </span>
                <Link
                  href="/classes"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E3B7D]/85 hover:bg-[#0E3B7D] border border-white/20 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                >
                  <span>Explore Syllabus</span>
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ─── Bottom Live Announcement Bar ──────────────────────── */}
      <div className="relative z-20 w-full bg-[#040E1E]/95 backdrop-blur-md border-t border-[#FFC700]/20 text-white py-3 overflow-hidden flex items-center">
        <div className="shrink-0 flex items-center gap-2 pl-6 pr-4 py-0.5 z-30 bg-[#040E1E]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFC700] text-[#09234B] text-[10px] font-black uppercase tracking-wider shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#09234B] animate-ping" />
            Announcement
          </span>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="flex whitespace-nowrap animate-marquee">
            {[
              "Admissions Open for 2026–2027 Academic Year (Year 7–9 · IGCSE · IAL)",
              "Official Pearson Edexcel Examination Centre — Hlaing Campus, Yangon",
              "Individual Academic Counseling Available: +95 9 894 332200",
              "Small Class Sizes with British Council Certified Faculty Mentorship",
              "Admissions Open for 2026–2027 Academic Year (Year 7–9 · IGCSE · IAL)",
              "Official Pearson Edexcel Examination Centre — Hlaing Campus, Yangon",
              "Individual Academic Counseling Available: +95 9 894 332200",
              "Small Class Sizes with British Council Certified Faculty Mentorship",
            ].map((msg, idx) => (
              <span key={idx} className="inline-flex items-center mx-8 text-xs font-semibold text-slate-200">
                <span>{msg}</span>
                <span className="text-[#FFC700] ml-8 font-bold">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
