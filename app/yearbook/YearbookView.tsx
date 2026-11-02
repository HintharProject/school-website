"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  GraduationCap,
  MagnifyingGlass,
  Medal,
  Student,
  BookOpenText,
  MapPin,
} from "@phosphor-icons/react";
import type { InnerPageHeaderContent } from "@/lib/content/defaults";
import type { YearbookBatch } from "@/lib/db";
import { useLocale, useT } from "@/lib/i18n/useT";
import { locField } from "@/lib/i18n/loc";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

export interface PublicYearbookEntry {
  id: number;
  name: string;
  category: string;
  batchId: string | null;
  role: string;
  roleMy: string | null;
  destination: string | null;
  subjects: string | null;
  quote: string;
  quoteMy: string | null;
  image: string;
  badge: string | null;
  badgeMy: string | null;
  batchName: string;
  batchRegion: string;
}

export default function YearbookView({
  header,
  batches,
  entries,
}: {
  header: InnerPageHeaderContent;
  batches: YearbookBatch[];
  entries: PublicYearbookEntry[];
}) {
  const locale = useLocale();
  const t = useT();
  const [region, setRegion] = useState<"all" | "Yangon" | "Mawlamyine">("all");
  const [batchId, setBatchId] = useState<string>("all");
  const [query, setQuery] = useState("");

  const availableBatches = useMemo(() => {
    if (region === "all") return batches;
    return batches.filter((b) => b.region === region);
  }, [batches, region]);

  const effectiveBatchId = useMemo(() => {
    if (batchId === "all") return "all";
    return availableBatches.some((b) => b.id === batchId) ? batchId : "all";
  }, [availableBatches, batchId]);

  const filteredEntries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (region !== "all" && entry.batchRegion !== region) return false;
      if (effectiveBatchId !== "all" && entry.batchId !== effectiveBatchId)
        return false;
      if (!q) return true;
      return (
        entry.name.toLowerCase().includes(q) ||
        (entry.destination || "").toLowerCase().includes(q) ||
        (entry.subjects || "").toLowerCase().includes(q) ||
        entry.role.toLowerCase().includes(q) ||
        entry.batchName.toLowerCase().includes(q)
      );
    });
  }, [entries, region, effectiveBatchId, query]);

  return (
    <>
      {/* Streamlined Compact Page Hero */}
      <section className="bg-gradient-to-b from-[#EEF3FC]/75 to-white pt-6 pb-6 sm:pt-8 sm:pb-8 border-b border-slate-200/70">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="max-w-3xl space-y-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#193E8A]/15 px-3 py-1 text-[11px] font-extrabold text-[#193E8A] uppercase tracking-wider shadow-2xs">
              <GraduationCap className="w-3.5 h-3.5" weight="duotone" />
              <span>{locField(locale, header.badgeEn, header.badgeMy)}</span>
            </span>

            <h1
              className={`font-extrabold text-[#1E232B] ${
                locale === "my"
                  ? "text-2xl sm:text-3xl md:text-[34px] leading-[1.32]"
                  : "text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight"
              }`}
            >
              {locField(locale, header.titleEn, header.titleMy)}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-normal max-w-2xl">
              {locField(locale, header.subtitleEn, header.subtitleMy)}
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Region Filter */}
              <div className="inline-flex items-center rounded-2xl bg-slate-100 p-1 border border-slate-200">
                {(
                  [
                    ["all", t("yearbook.allRegions")],
                    ["Yangon", t("common.yangon")],
                    ["Mawlamyine", t("common.mawlamyine")],
                  ] as const
                ).map(([key, label]) => {
                  const active = region === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setRegion(key);
                        setBatchId("all");
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                        active
                          ? "bg-[#193E8A] text-white shadow-2xs"
                          : "text-slate-600 hover:text-[#193E8A]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Batch Selector */}
              <select
                aria-label="Select graduation batch"
                value={effectiveBatchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="min-h-9 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#1E232B] focus:border-[#193E8A] outline-none cursor-pointer"
              >
                <option value="all">{t("yearbook.allBatches")}</option>
                {availableBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {region === "all" ? `${b.region} · ${b.name}` : b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <MagnifyingGlass
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                weight="bold"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("yearbook.searchPlaceholder")}
                className="w-full min-h-9 pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-[#1E232B] placeholder:text-slate-400 focus:border-[#193E8A] outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Student Yearbook Grid */}
      <section className="py-6 sm:py-8 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          {filteredEntries.length === 0 ? (
            <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-10 text-center space-y-2">
              <Student
                className="w-8 h-8 text-slate-400 mx-auto"
                weight="duotone"
              />
              <p className="text-xs sm:text-sm font-semibold text-slate-600">
                {t("yearbook.empty")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredEntries.map((entry) => {
                const role = locField(locale, entry.role, entry.roleMy);
                const quote = locField(locale, entry.quote, entry.quoteMy);
                const badge = entry.badge
                  ? locField(locale, entry.badge, entry.badgeMy)
                  : null;
                const regionLabel =
                  entry.batchRegion === "Mawlamyine"
                    ? t("common.mawlamyine")
                    : t("common.yangon");

                return (
                  <article
                    key={entry.id}
                    className="group rounded-3xl bg-white border border-slate-200/90 hover:border-[#193E8A]/40 shadow-2xs hover:shadow-hinthar transition-all overflow-hidden flex flex-col"
                  >
                    {/* Scholar Portrait */}
                    <div className="relative aspect-[16/11] bg-slate-100 overflow-hidden">
                      <Image
                        src={entry.image || "/images/g5.jpg"}
                        alt={entry.name}
                        fill
                        unoptimized={isR2AssetUrl(entry.image)}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F2759]/80 via-transparent to-transparent" />

                      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-[#193E8A]">
                          <MapPin className="w-2.5 h-2.5" weight="fill" />
                          {regionLabel} · {entry.batchName}
                        </span>

                        {badge && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFD600] px-2.5 py-0.5 text-[10px] font-extrabold text-[#162033] shadow-2xs">
                            <Medal className="w-3 h-3" weight="fill" />
                            {badge}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                        <h2 className="text-base sm:text-lg font-extrabold leading-tight">
                          {entry.name}
                        </h2>
                        <p className="text-[11px] font-medium text-slate-200 mt-0.5">
                          {role}
                        </p>
                      </div>
                    </div>

                    {/* Scholar Details & Quote */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                      <blockquote className="text-xs sm:text-sm text-slate-600 leading-relaxed italic border-l-2 border-[#FFD600] pl-3">
                        “{quote}”
                      </blockquote>

                      <div className="space-y-2 pt-2.5 border-t border-slate-100">
                        {entry.destination && (
                          <div className="flex items-start gap-2 text-xs">
                            <GraduationCap
                              className="w-3.5 h-3.5 text-[#193E8A] shrink-0 mt-0.5"
                              weight="duotone"
                            />
                            <div>
                              <span className="font-bold text-slate-400 text-[10px] block uppercase">
                                {t("yearbook.university")}
                              </span>
                              <span className="font-bold text-[#1E232B] text-xs">
                                {entry.destination}
                              </span>
                            </div>
                          </div>
                        )}

                        {entry.subjects && (
                          <div className="flex items-start gap-2 text-xs">
                            <BookOpenText
                              className="w-3.5 h-3.5 text-[#193E8A] shrink-0 mt-0.5"
                              weight="duotone"
                            />
                            <div>
                              <span className="font-bold text-slate-400 text-[10px] block uppercase">
                                {t("yearbook.subjects")}
                              </span>
                              <span className="font-semibold text-slate-700 text-xs">
                                {entry.subjects}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
