"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight, Buildings, Phone } from "@phosphor-icons/react";
import type { PublicCampusItem } from "@/lib/actions/campuses";
import type { HomeSectionsContent } from "@/lib/content/defaults";
import { useLocale, useT } from "@/lib/i18n/useT";
import { locField } from "@/lib/i18n/loc";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

export default function CampusesPreviewSection({
  campuses,
  sections,
}: {
  campuses: PublicCampusItem[];
  sections: HomeSectionsContent;
}) {
  const locale = useLocale();
  const t = useT();

  if (!campuses || campuses.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAFC] border-b border-slate-200/70">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF3FC] px-3.5 py-1.5 text-xs font-extrabold text-[#193E8A] uppercase tracking-wider">
              <Buildings className="w-4 h-4" weight="duotone" />
              <span>
                {locField(
                  locale,
                  sections.campusesBadgeEn,
                  sections.campusesBadgeMy
                )}
              </span>
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E232B] tracking-tight">
              {locField(
                locale,
                sections.campusesTitleEn,
                sections.campusesTitleMy
              )}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {locField(
                locale,
                sections.campusesSubtitleEn,
                sections.campusesSubtitleMy
              )}
            </p>
          </div>

          <Link
            href="/campuses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-[#193E8A] text-xs font-extrabold text-[#193E8A] shadow-2xs transition-all self-start"
          >
            <span>{t("common.viewAllCampuses")}</span>
            <ArrowRight className="w-4 h-4" weight="bold" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {campuses.slice(0, 4).map((campus) => {
            const name = locField(locale, campus.name, campus.nameMy);
            const tagline = locField(locale, campus.tagline, campus.taglineMy);
            const grades = locField(
              locale,
              campus.gradesServed,
              campus.gradesServedMy
            );
            const cityLabel =
              campus.city === "Mawlamyine"
                ? t("campuses.mawlamyine")
                : t("campuses.yangon");

            return (
              <Link
                key={campus.id}
                href="/campuses"
                className="group rounded-3xl bg-white border border-slate-200/90 hover:border-[#193E8A]/40 overflow-hidden shadow-2xs hover:shadow-hinthar transition-all flex flex-col"
              >
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <Image
                    src={campus.imageUrl || "/images/g2.jpg"}
                    alt={name}
                    fill
                    unoptimized={isR2AssetUrl(campus.imageUrl)}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#FFD600] px-2.5 py-0.5 text-[11px] font-extrabold text-[#162033]">
                    <MapPin className="w-3 h-3" weight="fill" />
                    {cityLabel}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-extrabold text-[#1E232B] group-hover:text-[#193E8A] transition-colors">
                      {name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {tagline}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    <p className="text-[11px] font-bold text-[#193E8A] line-clamp-1">
                      {grades}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" weight="fill" />
                      <span className="truncate">{campus.phone}</span>
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

