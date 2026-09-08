"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useState } from "react";
import { DEFAULT_PROGRAMS, type AcademicProgram } from "@/lib/content/defaults";
import { isR2AssetUrl } from "@/lib/utils/r2Image";
import { useLocale, useT } from "@/lib/i18n/useT";
import { locField } from "@/lib/i18n/loc";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function SpecialisationsSection({
  programs = DEFAULT_PROGRAMS,
}: {
  programs?: AcademicProgram[];
}) {
  const t = useT();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredPrograms =
    activeTab === "all"
      ? programs
      : programs.filter((p) => p.id === activeTab);

  const tabs = [
    { id: "all", label: t("home.tabAllPathways") },
    { id: "lower-secondary", label: t("home.tabLowerSecondary") },
    { id: "igcse", label: t("home.tabIgcse") },
    { id: "ial", label: t("home.tabIal") },
  ];

  return (
    <section
      id="academics"
      className="bg-slate-50 py-[80px] md:py-[120px] scroll-mt-20 relative overflow-hidden border-b border-slate-200"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm mb-4 border border-slate-200">
            <span aria-hidden="true" className="material-symbols-outlined text-[#FFC700] text-sm font-bold">menu_book</span>
            <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">
              {t("home.academicsBadge")}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-black text-[#09234B] mb-4 tracking-tight">
            {t("home.academicsTitle").replace(t("home.academicsTitleHighlight"), "")}{" "}
            <span className="text-[#0E3B7D]">{t("home.academicsTitleHighlight")}</span>
          </h2>
          <p className="text-sm md:text-base text-slate-600 font-normal">
            {t("home.academicsSubtitle")}
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[#0E3B7D] text-white shadow-md scale-105"
                  : "bg-white text-slate-600 hover:text-[#0E3B7D] border border-slate-200 shadow-sm"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {filteredPrograms.map((prog) => {
            const title = locField(locale, prog.title, prog.titleMy);
            const badge = locField(locale, prog.badge, prog.badgeMy);
            const age = locField(locale, prog.age, prog.ageMy);
            const description = locField(locale, prog.description, prog.descriptionMy);
            const highlights =
              locale === "my" && prog.highlightsMy?.length
                ? prog.highlightsMy
                : prog.highlights;

            return (
            <motion.div
              key={prog.id}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col relative"
            >
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-[#09234B]/30 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <Image
                  src={prog.image}
                  alt={`${title} Program`}
                  fill
                  unoptimized={isR2AssetUrl(prog.image)}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md bg-white/95 text-[#0E3B7D] shadow-sm border border-slate-200">
                    {badge}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#09234B]/90 text-white backdrop-blur-md">
                    {age}
                  </span>
                </div>

                <div className="absolute -bottom-5 right-5 w-11 h-11 bg-white rounded-xl shadow-lg flex items-center justify-center z-20 group-hover:-translate-y-1 transition-transform duration-300 border border-slate-200 text-[#0E3B7D]">
                  <span aria-hidden="true" className="material-symbols-outlined text-2xl font-bold">{prog.icon}</span>
                </div>
              </div>

              <div className="p-6 pt-7 flex-1 flex flex-col">
                <h3 className="text-lg font-black text-[#09234B] mb-2 tracking-tight group-hover:text-[#0E3B7D] transition-colors">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed font-normal">
                  {description}
                </p>

                <div className="space-y-1.5 mb-6 flex-1 pt-3 border-t border-slate-100">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-[12px] text-slate-600">
                      <span aria-hidden="true" className="material-symbols-outlined text-[#FFC700] text-sm shrink-0 mt-0.5 font-bold">check_circle</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-2">
                  <Link
                    href="/admission"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#E8F0FE] hover:bg-[#0E3B7D] hover:text-white text-[#0E3B7D] text-xs font-black tracking-wider uppercase transition-all"
                  >
                    <span>{t("home.enrollFor")} {badge}</span>
                    <span aria-hidden="true" className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          );
          })}
        </motion.div>

        <div className="mt-14 p-6 md:p-8 bg-gradient-to-r from-[#09234B] via-[#0E3B7D] to-[#164E9A] rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-[#FFC700]/30">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl md:text-2xl font-black tracking-tight">
              {t("home.guidanceTitle")}
            </h4>
            <p className="text-xs md:text-sm text-slate-200 max-w-xl font-light">
              {t("home.guidanceSubtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/admission"
              className="px-6 py-3 rounded-full bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] text-xs font-black tracking-wider uppercase shadow-md transition-colors"
            >
              {t("home.bookAssessment")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
