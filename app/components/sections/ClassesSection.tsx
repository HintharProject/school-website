"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  CheckCircle,
  BookOpenText,
  ArrowRight,
  Clock,
  MapPin,
  X,
  ChalkboardTeacher,
  ChatsCircle,
} from "@phosphor-icons/react";
import type { CatalogProgram, CatalogSubject } from "@/lib/academic/catalog";
import type { HomeSectionsContent } from "@/lib/content/defaults";
import { useLocale, useT } from "@/lib/i18n/useT";
import { locField, locList } from "@/lib/i18n/loc";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

export default function ClassesSection({
  programs,
  sections,
}: {
  programs: CatalogProgram[];
  sections: HomeSectionsContent;
}) {
  const locale = useLocale();
  const t = useT();
  const [regionFilter, setRegionFilter] = useState<"all" | "yangon" | "mawlamyine">("all");
  const [selectedProgram, setSelectedProgram] = useState<CatalogProgram | null>(null);

  useEffect(() => {
    if (!selectedProgram) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedProgram(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedProgram]);

  const filteredPrograms = useMemo(() => {
    if (regionFilter === "all") return programs;
    return programs.filter(
      (p) => p.campus === "both" || p.campus === regionFilter
    );
  }, [programs, regionFilter]);

  const groupedModalSubjects = useMemo(() => {
    if (!selectedProgram) return [];
    const groups = new Map<string, CatalogSubject[]>();
    for (const sub of selectedProgram.subjects) {
      const track = sub.track || "General";
      const list = groups.get(track) ?? [];
      list.push(sub);
      groups.set(track, list);
    }
    return Array.from(groups.entries());
  }, [selectedProgram]);

  function formatCampusScope(scope: string) {
    if (scope === "yangon") return t("common.yangon");
    if (scope === "mawlamyine") return t("common.mawlamyine");
    return t("common.bothCampuses");
  }

  return (
    <section
      id="classes"
      className="py-16 sm:py-24 bg-white scroll-mt-20 border-b border-slate-100"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header + Region Filter */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF3FC] px-3.5 py-1.5 text-xs font-extrabold text-[#193E8A] uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" weight="duotone" />
              <span>
                {locField(
                  locale,
                  sections.classesBadgeEn,
                  sections.classesBadgeMy
                )}
              </span>
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E232B] tracking-tight">
              {locField(
                locale,
                sections.classesTitleEn,
                sections.classesTitleMy
              )}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {locField(
                locale,
                sections.classesSubtitleEn,
                sections.classesSubtitleMy
              )}
            </p>
          </div>

          {/* Campus Region Filter */}
          <div
            role="tablist"
            aria-label="Filter academic pathways by campus"
            className="inline-flex flex-wrap items-center gap-1 rounded-2xl bg-slate-100 p-1 border border-slate-200 self-start"
          >
            {(
              [
                ["all", t("classes.filterAll")],
                ["yangon", t("classes.filterYangon")],
                ["mawlamyine", t("classes.filterMawlamyine")],
              ] as const
            ).map(([key, label]) => {
              const active = regionFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setRegionFilter(key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-[#193E8A] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#193E8A]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pearson Pathway Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
          {filteredPrograms.map((program) => {
            const name = locField(locale, program.nameEn, program.nameMy);
            const badge = locField(
              locale,
              program.badgeEn || program.curriculum,
              program.badgeMy
            );
            const ageRange = locField(
              locale,
              program.ageRangeEn || "",
              program.ageRangeMy
            );
            const summary = locField(
              locale,
              program.summaryEn || "",
              program.summaryMy
            );
            const highlights = locList(
              locale,
              program.highlightsEn,
              program.highlightsMy
            );
            const imgSrc = program.imageUrl || "/images/g2.jpg";

            return (
              <article
                key={program.id}
                className="group flex flex-col rounded-3xl bg-white border border-slate-200/90 hover:border-[#193E8A]/40 shadow-xs hover:shadow-hinthar transition-all overflow-hidden"
              >
                {/* Card Visual Header */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <Image
                    src={imgSrc}
                    alt={name}
                    fill
                    unoptimized={isR2AssetUrl(imgSrc)}
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F2759]/80 via-[#0F2759]/20 to-transparent" />
                  <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-[#FFD600] px-3 py-1 text-[11px] font-extrabold text-[#162033] shadow-xs">
                      {badge}
                    </span>
                    {ageRange && (
                      <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#193E8A]">
                        {ageRange}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs text-white/95 font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#FFD600]" weight="fill" />
                      {formatCampusScope(program.campus)}
                    </span>
                    <span>
                      {program.subjects.length}{" "}
                      {locale === "my" ? "ဘာသာရပ်" : "Subjects"}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex-1 p-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#193E8A]">
                        {program.curriculum}
                      </p>
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#1E232B] mt-1 leading-snug">
                        {name}
                      </h3>
                    </div>

                    {summary && (
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {summary}
                      </p>
                    )}

                    {highlights.length > 0 && (
                      <ul className="space-y-2 pt-1">
                        {highlights.slice(0, 3).map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-700"
                          >
                            <CheckCircle
                              className="w-4 h-4 text-[#193E8A] shrink-0 mt-0.5"
                              weight="fill"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Quick Subject Pills Preview */}
                    {program.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {program.subjects.slice(0, 4).map((sub) => (
                          <span
                            key={sub.id}
                            className="inline-flex items-center rounded-lg bg-[#F8FAFC] border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                          >
                            {sub.nameEn}
                          </span>
                        ))}
                        {program.subjects.length > 4 && (
                          <span className="inline-flex items-center rounded-lg bg-[#EEF3FC] px-2.5 py-1 text-[11px] font-bold text-[#193E8A]">
                            +{program.subjects.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedProgram(program)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-11 px-4 py-2.5 rounded-xl bg-[#EEF3FC] hover:bg-[#193E8A] text-[#193E8A] hover:text-white text-xs font-extrabold transition-colors cursor-pointer"
                    >
                      <BookOpenText className="w-4 h-4 shrink-0" weight="bold" />
                      <span>{t("common.viewDetails")}</span>
                    </button>

                    <Link
                      href={`/admission?program=${encodeURIComponent(program.id)}`}
                      className="inline-flex items-center justify-center gap-1 min-h-11 px-4 py-2.5 rounded-xl bg-[#FFD600] hover:bg-[#ECC300] text-[#162033] text-xs font-extrabold transition-colors shrink-0"
                    >
                      <span>{t("nav.applyNow")}</span>
                      <ArrowRight className="w-3.5 h-3.5" weight="bold" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Academic Pathway Guidance Banner */}
        <div className="mt-12 rounded-3xl bg-gradient-royal text-white p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-hinthar">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD600] text-[#162033] flex items-center justify-center shrink-0">
              <ChatsCircle className="w-6 h-6" weight="fill" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                {locField(
                  locale,
                  sections.guidanceTitleEn,
                  sections.guidanceTitleMy
                )}
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                {locField(
                  locale,
                  sections.guidanceSubtitleEn,
                  sections.guidanceSubtitleMy
                )}
              </p>
            </div>
          </div>

          <Link
            href="/admission"
            className="inline-flex items-center gap-2 min-h-12 px-6 py-3 rounded-full bg-[#FFD600] hover:bg-[#ECC300] text-[#162033] text-xs sm:text-sm font-extrabold shadow-gold transition-all shrink-0"
          >
            <span>
              {locField(locale, sections.guidanceCtaEn, sections.guidanceCtaMy)}
            </span>
            <ArrowRight className="w-4 h-4" weight="bold" />
          </Link>
        </div>
      </div>

      {/* Syllabus & Subjects Modal */}
      {selectedProgram && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0F2759]/55 backdrop-blur-xs p-3 sm:p-6 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProgram(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-label={selectedProgram.nameEn}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 bg-[#F8FAFC]">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-[#FFD600] px-3 py-0.5 text-[11px] font-extrabold text-[#162033]">
                    {locField(
                      locale,
                      selectedProgram.badgeEn || selectedProgram.curriculum,
                      selectedProgram.badgeMy
                    )}
                  </span>
                  {selectedProgram.ageRangeEn && (
                    <span className="text-xs font-bold text-[#193E8A]">
                      {locField(
                        locale,
                        selectedProgram.ageRangeEn,
                        selectedProgram.ageRangeMy
                      )}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E232B]">
                  {locField(
                    locale,
                    selectedProgram.nameEn,
                    selectedProgram.nameMy
                  )}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                aria-label={t("common.close")}
                className="inline-flex items-center justify-center h-10 w-10 rounded-full text-slate-500 hover:bg-slate-200/70 hover:text-[#193E8A] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" weight="bold" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Metadata Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedProgram.duration && (
                  <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-3.5">
                    <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#193E8A]" weight="bold" />
                      {t("classes.duration")}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-[#1E232B] mt-1">
                      {selectedProgram.duration}
                    </p>
                  </div>
                )}
                {selectedProgram.studyMode && (
                  <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-3.5">
                    <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                      <ChalkboardTeacher
                        className="w-3.5 h-3.5 text-[#193E8A]"
                        weight="bold"
                      />
                      {t("classes.studyMode")}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-[#1E232B] mt-1">
                      {selectedProgram.studyMode}
                    </p>
                  </div>
                )}
                <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-3.5">
                  <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#193E8A]" weight="bold" />
                    {t("classes.campusAvailability")}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-[#1E232B] mt-1">
                    {formatCampusScope(selectedProgram.campus)}
                  </p>
                </div>
              </div>

              {/* Full Description */}
              {(selectedProgram.descriptionEn || selectedProgram.summaryEn) && (
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {locField(
                    locale,
                    selectedProgram.descriptionEn ||
                      selectedProgram.summaryEn ||
                      "",
                    selectedProgram.descriptionMy || selectedProgram.summaryMy
                  )}
                </p>
              )}

              {/* Highlights */}
              {locList(
                locale,
                selectedProgram.highlightsEn,
                selectedProgram.highlightsMy
              ).length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#193E8A]">
                    {t("classes.keyHighlights")}
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {locList(
                      locale,
                      selectedProgram.highlightsEn,
                      selectedProgram.highlightsMy
                    ).map((h, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3 text-xs sm:text-sm text-[#1E232B]"
                      >
                        <CheckCircle
                          className="w-4 h-4 text-[#193E8A] shrink-0 mt-0.5"
                          weight="fill"
                        />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Offered Subjects by Track */}
              {groupedModalSubjects.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#193E8A]">
                    {t("classes.offeredSubjects")} (
                    {selectedProgram.subjects.length})
                  </h4>
                  <div className="space-y-4">
                    {groupedModalSubjects.map(([track, subs]) => (
                      <div key={track} className="space-y-2">
                        <p className="text-xs font-bold text-slate-500">
                          {track}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {subs.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white"
                            >
                              <span className="text-xs sm:text-sm font-semibold text-[#1E232B]">
                                {locField(locale, sub.nameEn, sub.nameMy)}
                              </span>
                              {sub.code && (
                                <span className="rounded-md bg-[#EEF3FC] px-2 py-0.5 text-[11px] font-bold text-[#193E8A] shrink-0">
                                  {sub.code}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 bg-[#F8FAFC]">
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {t("common.close")}
              </button>
              <Link
                href={`/admission?program=${encodeURIComponent(selectedProgram.id)}`}
                onClick={() => setSelectedProgram(null)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFD600] hover:bg-[#ECC300] text-[#162033] text-xs sm:text-sm font-extrabold shadow-xs transition-all"
              >
                <span>{t("common.applyProgram")}</span>
                <ArrowRight className="w-4 h-4" weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

