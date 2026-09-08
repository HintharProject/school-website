"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import { formatCampusBadge } from "../admin/adminStore";
import { getPublicPrograms } from "@/lib/actions/academicCatalog";
import { PROGRAM_CATEGORIES, type CatalogProgram } from "@/lib/academic/catalog";
import { useLocale, useT } from "@/lib/i18n/useT";
import { locField } from "@/lib/i18n/loc";
import type { Locale } from "@/lib/i18n";

function campusFilterLabels(t: ReturnType<typeof useT>) {
  return [
    { id: "All", label: t("classes.filterAll") },
    { id: "Yangon", label: t("classes.filterYangon") },
    { id: "Mawlamyine", label: t("classes.filterMawlamyine") },
    { id: "Both", label: t("classes.filterBoth") },
  ];
}

function categoryLabel(id: string) {
  return PROGRAM_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function buildApplyHref(program: CatalogProgram) {
  const params = new URLSearchParams();
  params.set("program", program.id);
  if (program.campus === "yangon") params.set("region", "Yangon");
  else if (program.campus === "mawlamyine") params.set("region", "Mawlamyine");
  if (program.studyMode) params.set("studyMode", program.studyMode);
  return `/admission?${params.toString()}`;
}

function programSummary(program: CatalogProgram, locale: Locale) {
  const summaryEn = program.summaryEn || program.descriptionEn?.slice(0, 160) || "";
  const summaryMy = program.summaryMy || program.descriptionMy?.slice(0, 160) || "";
  return locField(locale, summaryEn, summaryMy);
}

function ProgramCard({
  program,
  locale,
  t,
  onOpen,
}: {
  program: CatalogProgram;
  locale: Locale;
  t: ReturnType<typeof useT>;
  onOpen: () => void;
}) {
  const campusBadge = formatCampusBadge(program.campus);
  const name = locField(locale, program.nameEn, program.nameMy);
  const summary = programSummary(program, locale);

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="relative h-40 w-full bg-gradient-to-br from-[#09234B] to-[#0E3B7D] overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,#FFC700_0%,transparent_50%)]" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#09234B]/80 text-[#FFC700] backdrop-blur-sm">
              {categoryLabel(program.category)}
            </span>
            {program.duration ? (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white backdrop-blur-sm">
                {program.duration}
              </span>
            ) : null}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFC700]/90 mb-1">
              {program.curriculum}
            </p>
            <h3 className="text-lg font-black text-white leading-tight">{name}</h3>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {summary ? (
            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{summary}</p>
          ) : null}

          {program.subjects.length > 0 ? (
            <div className="pt-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                {t("classes.subjectsElectives")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {program.subjects.slice(0, 8).map((s) => (
                  <span
                    key={s.id}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#E8F0FE] text-[#0E3B7D] border border-[#0E3B7D]/10"
                  >
                    {locField(locale, s.nameEn, s.nameMy)}
                  </span>
                ))}
                {program.subjects.length > 8 ? (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-500">
                    +{program.subjects.length - 8} {t("classes.moreSubjects")}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {program.studyMode ? (
            <p className="flex items-center gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">
                schedule
              </span>
              <span>{program.studyMode}</span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${campusBadge.badgeClass}`}>
          {campusBadge.label}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-[#0E3B7D] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            {t("common.details")}
          </button>
          <Link
            href={buildApplyHref(program)}
            className="px-4 py-2 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            {t("common.apply")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ClassesView({
  initialPrograms,
}: {
  initialPrograms?: CatalogProgram[];
}) {
  const t = useT();
  const locale = useLocale();
  const [programs, setPrograms] = useState<CatalogProgram[]>(() => initialPrograms ?? []);
  const [isLoading, setIsLoading] = useState(initialPrograms === undefined);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeCampus, setActiveCampus] = useState<string>("All");
  const [selectedProgram, setSelectedProgram] = useState<CatalogProgram | null>(null);
  const filters = campusFilterLabels(t);

  useEffect(() => {
    if (initialPrograms !== undefined) return;
    async function load() {
      try {
        setIsLoading(true);
        setPrograms(await getPublicPrograms());
      } catch (err) {
        console.warn("Programs fetch note:", err);
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [initialPrograms]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      const campusBadge = formatCampusBadge(p.campus);
      const matchesCampus =
        activeCampus === "All" ||
        campusBadge.city === activeCampus ||
        (activeCampus === "Yangon" && (campusBadge.city === "Yangon" || campusBadge.city === "Both")) ||
        (activeCampus === "Mawlamyine" &&
          (campusBadge.city === "Mawlamyine" || campusBadge.city === "Both"));
      return matchesCategory && matchesCampus;
    });
  }, [programs, activeCategory, activeCampus]);

  const selectedName = selectedProgram
    ? locField(locale, selectedProgram.nameEn, selectedProgram.nameMy)
    : "";
  const selectedDescription = selectedProgram
    ? locField(locale, selectedProgram.descriptionEn ?? "", selectedProgram.descriptionMy)
    : "";

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-4 py-1.5 rounded-full mb-4 border border-[#0E3B7D]/20">
            <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">
              menu_book
            </span>
            <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">
              {t("classes.badge")}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#09234B] mb-3 tracking-tight">
            {t("classes.title").replace(` ${t("classes.titleHighlight")}`, "")}{" "}
            <span className="text-[#0E3B7D]">{t("classes.titleHighlight")}</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-normal">{t("classes.subtitle")}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeCategory === "all"
                ? "bg-[#0E3B7D] text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {t("classes.allPrograms")}
          </button>
          {PROGRAM_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-[#0E3B7D] text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-white rounded-2xl border border-slate-200 shadow-xs">
            {filters.map((cf) => (
              <button
                key={cf.id}
                type="button"
                onClick={() => setActiveCampus(cf.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCampus === cf.id
                    ? "bg-[#FFC700] text-[#09234B] font-black"
                    : "text-slate-600 hover:text-[#0E3B7D]"
                }`}
              >
                {cf.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-200 animate-pulse">
                <div className="h-40 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-16 px-6 border border-dashed border-slate-300 rounded-3xl max-w-md mx-auto">
            <span aria-hidden="true" className="material-symbols-outlined text-4xl text-slate-300">
              menu_book
            </span>
            <h2 className="text-base font-black text-[#09234B] mt-3">{t("classes.emptyTitle")}</h2>
            <p className="text-xs text-slate-500 mt-1">{t("classes.emptySubtitle")}</p>
            <Link
              href="/admission"
              className="inline-flex mt-5 px-5 py-2.5 rounded-xl bg-[#FFC700] text-[#09234B] text-xs font-extrabold uppercase tracking-wider"
            >
              {t("nav.applyNow")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                locale={locale}
                t={t}
                onOpen={() => setSelectedProgram(program)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedProgram ? (
        <div
          className="fixed inset-0 z-[120] bg-[#09234B]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProgram(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedName}
            className="bg-white w-full sm:max-w-2xl max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-6 border-b border-slate-200 bg-white/95 backdrop-blur">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#0E3B7D] mb-1">
                  {categoryLabel(selectedProgram.category)} · {selectedProgram.curriculum}
                </p>
                <h2 className="text-xl font-black text-[#09234B]">{selectedName}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="shrink-0 h-10 w-10 rounded-xl text-slate-500 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                aria-label={t("common.close")}
              >
                <span aria-hidden="true" className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm text-slate-700">
              {selectedProgram.duration ? (
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span aria-hidden="true" className="material-symbols-outlined text-base text-[#0E3B7D]">
                    calendar_month
                  </span>
                  {selectedProgram.duration}
                </p>
              ) : null}
              {selectedProgram.studyMode ? (
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span aria-hidden="true" className="material-symbols-outlined text-base text-[#0E3B7D]">
                    schedule
                  </span>
                  {selectedProgram.studyMode}
                </p>
              ) : null}

              {selectedDescription ? (
                <p className="text-sm leading-relaxed whitespace-pre-line">{selectedDescription}</p>
              ) : null}

              {selectedProgram.subjects.length > 0 ? (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    {t("classes.linkedSubjects")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProgram.subjects.map((s) => (
                      <span
                        key={s.id}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {locField(locale, s.nameEn, s.nameMy)}
                        {s.code ? ` (${s.code})` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="sticky bottom-0 p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                {t("common.close")}
              </button>
              <Link
                href={buildApplyHref(selectedProgram)}
                className="px-5 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-extrabold text-xs uppercase tracking-wider shadow-sm"
              >
                {t("common.apply")}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <FooterSection />
    </div>
  );
}
