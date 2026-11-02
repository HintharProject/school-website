"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Buildings,
  MapPin,
  Phone,
  EnvelopeSimple,
  GraduationCap,
  Images,
  ArrowSquareOut,
  ArrowRight,
  CheckCircle,
} from "@phosphor-icons/react";
import type { PublicCampusItem } from "@/lib/actions/campuses";
import type { InnerPageHeaderContent } from "@/lib/content/defaults";
import { useLocale, useT } from "@/lib/i18n/useT";
import { locField, locList } from "@/lib/i18n/loc";
import ImageCarousel from "../components/ImageCarousel";
import CampusGalleryModal from "../components/CampusGalleryModal";

export default function CampusesView({
  header,
  campuses,
}: {
  header: InnerPageHeaderContent;
  campuses: PublicCampusItem[];
}) {
  const locale = useLocale();
  const t = useT();
  const [cityFilter, setCityFilter] = useState<"all" | "Yangon" | "Mawlamyine">("all");
  const [galleryTarget, setGalleryTarget] = useState<{
    name: string;
    city: string;
    images: string[];
  } | null>(null);

  const yangonCount = useMemo(
    () => campuses.filter((c) => c.city === "Yangon").length,
    [campuses]
  );
  const mawlamyineCount = useMemo(
    () => campuses.filter((c) => c.city === "Mawlamyine").length,
    [campuses]
  );

  const visibleCampuses = useMemo(() => {
    if (cityFilter === "all") return campuses;
    return campuses.filter((c) => c.city === cityFilter);
  }, [campuses, cityFilter]);

  return (
    <>
      {/* Streamlined Compact Page Hero */}
      <section className="bg-gradient-to-b from-[#EEF3FC]/75 to-white pt-6 pb-6 sm:pt-8 sm:pb-8 border-b border-slate-200/70">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="max-w-3xl space-y-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#193E8A]/15 px-3 py-1 text-[11px] font-extrabold text-[#193E8A] uppercase tracking-wider shadow-2xs">
              <Buildings className="w-3.5 h-3.5" weight="duotone" />
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

          {/* City Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter campuses by city"
            className="pt-1 inline-flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100 p-1 border border-slate-200"
          >
            {(
              [
                ["all", `${t("campuses.allCities")} (${campuses.length})`],
                ["Yangon", `${t("campuses.yangon")} (${yangonCount})`],
                ["Mawlamyine", `${t("campuses.mawlamyine")} (${mawlamyineCount})`],
              ] as const
            ).map(([key, label]) => {
              const active = cityFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCityFilter(key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
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
      </section>

      {/* Campuses Cards Grid */}
      <section className="py-6 sm:py-8 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7">
          {visibleCampuses.map((campus) => {
            const name = locField(locale, campus.name, campus.nameMy);
            const tagline = locField(locale, campus.tagline, campus.taglineMy);
            const address = locField(locale, campus.address, campus.addressMy);
            const grades = locField(
              locale,
              campus.gradesServed,
              campus.gradesServedMy
            );
            const facilities = locList(
              locale,
              campus.facilitiesEn,
              campus.facilitiesMy
            );
            const allPhotos = Array.from(
              new Set([campus.imageUrl, ...(campus.galleryUrls || [])].filter(Boolean))
            );
            const cityLabel =
              campus.city === "Mawlamyine"
                ? t("campuses.mawlamyine")
                : t("campuses.yangon");

            return (
              <article
                key={campus.id}
                className="rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-hinthar transition-all overflow-hidden flex flex-col"
              >
                {/* Visual Carousel Header */}
                <div className="relative h-52 sm:h-56 bg-slate-100">
                  <ImageCarousel
                    images={allPhotos}
                    alt={name}
                    className="h-full w-full"
                  />

                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFD600] px-2.5 py-1 text-[11px] font-extrabold text-[#162033] shadow-xs">
                      <MapPin className="w-3 h-3" weight="fill" />
                      {cityLabel}
                    </span>
                  </div>

                  {allPhotos.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setGalleryTarget({
                          name,
                          city: cityLabel,
                          images: allPhotos,
                        })
                      }
                      className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#0F2759]/80 hover:bg-[#0F2759] px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs transition-colors cursor-pointer"
                    >
                      <Images className="w-3.5 h-3.5 text-[#FFD600]" weight="duotone" />
                      <span>
                        {t("campuses.viewGallery")} ({allPhotos.length})
                      </span>
                    </button>
                  )}
                </div>

                {/* Campus Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-[#1E232B]">
                        {name}
                      </h2>
                      <p className="text-xs sm:text-sm font-semibold text-[#193E8A] mt-0.5">
                        {tagline}
                      </p>
                    </div>

                    {/* Pathways Served */}
                    <div className="rounded-2xl bg-[#EEF3FC]/75 border border-[#193E8A]/10 p-3.5 flex items-start gap-2.5">
                      <GraduationCap
                        className="w-4 h-4 text-[#193E8A] shrink-0 mt-0.5"
                        weight="duotone"
                      />
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#193E8A]">
                          {t("campuses.gradesServed")}
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-[#1E232B] mt-0.5">
                          {grades}
                        </p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-start gap-2.5">
                        <MapPin
                          className="w-3.5 h-3.5 text-[#193E8A] shrink-0 mt-0.5"
                          weight="fill"
                        />
                        <span>{address}</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Phone
                          className="w-3.5 h-3.5 text-[#193E8A] shrink-0"
                          weight="fill"
                        />
                        <a
                          href={`tel:${campus.phone.split("/")[0].replace(/\s+/g, "")}`}
                          className="font-semibold text-[#1E232B] hover:text-[#193E8A] transition-colors"
                        >
                          {campus.phone}
                        </a>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <EnvelopeSimple
                          className="w-3.5 h-3.5 text-[#193E8A] shrink-0"
                          weight="fill"
                        />
                        <a
                          href={`mailto:${campus.email}`}
                          className="hover:text-[#193E8A] transition-colors break-all"
                        >
                          {campus.email}
                        </a>
                      </div>
                    </div>

                    {/* Facilities */}
                    {facilities.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-500">
                          {t("campuses.facilities")}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {facilities.map((facility, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-xl bg-[#F8FAFC] border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-[#1E232B]"
                            >
                              <CheckCircle
                                className="w-3 h-3 text-[#193E8A] shrink-0"
                                weight="fill"
                              />
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer CTAs */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                    {campus.mapUrl ? (
                      <a
                        href={campus.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 min-h-10 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-[#193E8A] text-xs font-bold text-[#193E8A] transition-colors"
                      >
                        <ArrowSquareOut className="w-3.5 h-3.5" weight="bold" />
                        <span>{t("campuses.openMap")}</span>
                      </a>
                    ) : (
                      <span />
                    )}

                    <Link
                      href={`/admission?region=${encodeURIComponent(campus.city)}`}
                      className="inline-flex items-center gap-1.5 min-h-10 px-4 py-2 rounded-full bg-[#FFD600] hover:bg-[#ECC300] text-[#162033] text-xs font-extrabold shadow-2xs transition-all"
                    >
                      <span>{t("campuses.applyCampus")}</span>
                      <ArrowRight className="w-3.5 h-3.5" weight="bold" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <CampusGalleryModal
        isOpen={Boolean(galleryTarget)}
        onClose={() => setGalleryTarget(null)}
        campusName={galleryTarget?.name ?? ""}
        city={galleryTarget?.city}
        images={galleryTarget?.images ?? []}
      />
    </>
  );
}
