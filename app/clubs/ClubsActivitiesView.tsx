"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import {
  UsersThree,
  CalendarBlank,
  Clock,
  MapPin,
  Images,
  Sparkle,
  UserCircleGear,
} from "@phosphor-icons/react";
import type { ClubsPageContent } from "@/lib/content/defaults";
import type { Activity, Club } from "@/lib/db";
import { useLocale, useT } from "@/lib/i18n/useT";
import { locField } from "@/lib/i18n/loc";
import { isR2AssetUrl } from "@/lib/utils/r2Image";
import { ClubIcon } from "../components/icons/ClubIcon";
import CampusGalleryModal from "../components/CampusGalleryModal";

function parseGallery(raw: string | string[] | null | undefined): string[] {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}

type TabType = "all" | "clubs" | "activities";

export default function ClubsActivitiesView({
  header,
  clubs,
  activities,
}: {
  header: ClubsPageContent;
  clubs: Club[];
  activities: Activity[];
}) {
  const locale = useLocale();
  const t = useT();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [clubCategory, setClubCategory] = useState<string>("all");
  const [eventStatus, setEventStatus] = useState<string>("all");
  const [selectedClubId, setSelectedClubId] = useState<number | "all">("all");
  const [galleryTarget, setGalleryTarget] = useState<{
    name: string;
    images: string[];
  } | null>(null);

  // Auto-switch to activities if navigated via #activities hash
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#activities") {
      setActiveTab("activities");
    }
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(clubs.map((c) => c.category))).filter(Boolean),
    [clubs]
  );

  const clubMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of clubs) map.set(c.id, c.name);
    return map;
  }, [clubs]);

  const filteredClubs = useMemo(() => {
    if (clubCategory === "all") return clubs;
    return clubs.filter((c) => c.category === clubCategory);
  }, [clubs, clubCategory]);

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      if (eventStatus !== "all" && a.status !== eventStatus) return false;
      if (selectedClubId !== "all" && a.clubId !== selectedClubId) return false;
      return true;
    });
  }, [activities, eventStatus, selectedClubId]);

  function statusBadgeLabel(status: string) {
    if (status === "Active Registration") return t("clubs.activeRegistration");
    if (status === "Past Highlight") return t("clubs.pastHighlight");
    return t("clubs.upcoming");
  }

  return (
    <>
      {/* Streamlined Compact Page Hero */}
      <section className="bg-gradient-to-b from-[#EEF3FC]/75 to-white pt-6 pb-6 sm:pt-8 sm:pb-8 border-b border-slate-200/70">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="max-w-3xl space-y-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#193E8A]/15 px-3 py-1 text-[11px] font-extrabold text-[#193E8A] uppercase tracking-wider shadow-2xs">
              <UsersThree className="w-3.5 h-3.5" weight="duotone" />
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

          {/* Primary View Segment Tabs */}
          <div
            id="activities"
            role="tablist"
            aria-label="Clubs and activities view switcher"
            className="pt-1 flex flex-wrap items-center gap-2"
          >
            <div className="inline-flex items-center rounded-2xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "all"}
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  activeTab === "all"
                    ? "bg-[#193E8A] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#193E8A]"
                }`}
              >
                {t("clubs.tabAll")} ({clubs.length + activities.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "clubs"}
                onClick={() => setActiveTab("clubs")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  activeTab === "clubs"
                    ? "bg-[#193E8A] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#193E8A]"
                }`}
              >
                {t("clubs.tabClubs")} ({clubs.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "activities"}
                onClick={() => setActiveTab("activities")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  activeTab === "activities"
                    ? "bg-[#193E8A] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#193E8A]"
                }`}
              >
                {t("clubs.tabActivities")} ({activities.length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Contextual Filter Bar */}
      <section className="py-6 sm:py-8 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Secondary Sub-Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-slate-100">
            {/* Club Category Filters (Visible for 'all' or 'clubs') */}
            {(activeTab === "all" || activeTab === "clubs") && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">
                  {t("clubs.tabClubs")}:
                </span>
                <button
                  type="button"
                  onClick={() => setClubCategory("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    clubCategory === "all"
                      ? "bg-[#193E8A] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:text-[#193E8A]"
                  }`}
                >
                  {t("clubs.allCategories")} ({clubs.length})
                </button>
                {categories.map((cat) => {
                  const active = clubCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setClubCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? "bg-[#193E8A] text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:text-[#193E8A]"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Event Status Filters (Visible for 'all' or 'activities') */}
            {(activeTab === "all" || activeTab === "activities") && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">
                  {t("clubs.tabActivities")}:
                </span>
                {(
                  [
                    ["all", t("clubs.allEvents")],
                    ["Active Registration", t("clubs.activeRegistration")],
                    ["Upcoming", t("clubs.upcoming")],
                    ["Past Highlight", t("clubs.pastHighlight")],
                  ] as const
                ).map(([key, label]) => {
                  const active = eventStatus === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setEventStatus(key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? "bg-[#193E8A] text-white shadow-2xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:text-[#193E8A]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}

                {selectedClubId !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSelectedClubId("all")}
                    className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#FFD600] text-[#162033] cursor-pointer"
                  >
                    {clubMap.get(selectedClubId)} ×
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Combined Grid: 'all' View */}
          {activeTab === "all" && (
            <div className="space-y-10">
              {/* Clubs Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFD600]" />
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#1E232B]">
                      {t("clubs.tabClubs")}
                    </h2>
                    <span className="text-xs font-bold text-slate-400">
                      ({filteredClubs.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("clubs")}
                    className="text-xs font-bold text-[#193E8A] hover:underline cursor-pointer"
                  >
                    {t("common.learnMore")} →
                  </button>
                </div>

                {filteredClubs.length === 0 ? (
                  <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-8 text-center text-xs text-slate-600">
                    {t("clubs.emptyClubs")}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {filteredClubs.map((club) => (
                      <ClubCard
                        key={club.id}
                        club={club}
                        activities={activities}
                        onOpenGallery={setGalleryTarget}
                        onSelectClubForEvents={() => {
                          setSelectedClubId(club.id);
                          setActiveTab("activities");
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Activities Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#193E8A]" />
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#1E232B]">
                      {t("clubs.tabActivities")}
                    </h2>
                    <span className="text-xs font-bold text-slate-400">
                      ({filteredActivities.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("activities")}
                    className="text-xs font-bold text-[#193E8A] hover:underline cursor-pointer"
                  >
                    {t("common.learnMore")} →
                  </button>
                </div>

                {filteredActivities.length === 0 ? (
                  <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-8 text-center text-xs text-slate-600">
                    {t("clubs.emptyEvents")}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {filteredActivities.map((act) => (
                      <ActivityCard
                        key={act.id}
                        activity={act}
                        clubMap={clubMap}
                        statusBadgeLabel={statusBadgeLabel}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clubs Only View */}
          {activeTab === "clubs" && (
            <div>
              {filteredClubs.length === 0 ? (
                <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-10 text-center text-sm text-slate-600">
                  {t("clubs.emptyClubs")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {filteredClubs.map((club) => (
                    <ClubCard
                      key={club.id}
                      club={club}
                      activities={activities}
                      onOpenGallery={setGalleryTarget}
                      onSelectClubForEvents={() => {
                        setSelectedClubId(club.id);
                        setActiveTab("activities");
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activities Only View */}
          {activeTab === "activities" && (
            <div>
              {filteredActivities.length === 0 ? (
                <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-10 text-center text-sm text-slate-600">
                  {t("clubs.emptyEvents")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {filteredActivities.map((act) => (
                    <ActivityCard
                      key={act.id}
                      activity={act}
                      clubMap={clubMap}
                      statusBadgeLabel={statusBadgeLabel}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Gallery Modal */}
      <CampusGalleryModal
        isOpen={Boolean(galleryTarget)}
        onClose={() => setGalleryTarget(null)}
        campusName={galleryTarget?.name || ""}
        city={t("clubs.tabClubs")}
        images={galleryTarget?.images || []}
      />
    </>
  );
}

// ─── Sub-Component: Club Card ──────────────────────────────────────
function ClubCard({
  club,
  activities,
  onOpenGallery,
  onSelectClubForEvents,
}: {
  club: Club;
  activities: Activity[];
  onOpenGallery: (target: { name: string; images: string[] }) => void;
  onSelectClubForEvents: () => void;
}) {
  const locale = useLocale();
  const t = useT();

  const desc = locField(locale, club.description, club.descriptionMy);
  const meeting = locField(locale, club.meetingTime, club.meetingTimeMy);
  const leadership = locField(locale, club.leadership, club.leadershipMy);
  const gallery = Array.from(
    new Set([club.image, ...parseGallery(club.galleryUrls)].filter(Boolean))
  );
  const linkedCount = activities.filter((a) => a.clubId === club.id).length;

  return (
    <article className="group rounded-3xl bg-white border border-slate-200/90 hover:border-[#193E8A]/40 shadow-2xs hover:shadow-hinthar transition-all overflow-hidden flex flex-col">
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        <Image
          src={club.image || "/images/g2.jpg"}
          alt={club.name}
          fill
          unoptimized={isR2AssetUrl(club.image)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2759]/80 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-[#FFD600] px-2.5 py-0.5 text-[10px] font-extrabold text-[#162033]">
            {club.category}
          </span>
          <span className="inline-flex items-center rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#193E8A]">
            {club.members}
          </span>
        </div>

        {gallery.length > 1 && (
          <button
            type="button"
            onClick={() =>
              onOpenGallery({
                name: club.name,
                images: gallery,
              })
            }
            className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-[#0F2759]/85 hover:bg-[#0F2759] px-2.5 py-1 text-[10px] font-bold text-white cursor-pointer"
          >
            <Images className="w-3 h-3 text-[#FFD600]" weight="duotone" />
            <span>
              {t("clubs.viewGallery")} ({gallery.length})
            </span>
          </button>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EEF3FC] text-[#193E8A] flex items-center justify-center shrink-0">
              <ClubIcon name={club.icon} className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-[#1E232B] leading-snug pt-0.5">
              {club.name}
            </h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
            {desc}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex items-start gap-2 text-slate-700">
            <Clock className="w-3.5 h-3.5 text-[#193E8A] mt-0.5 shrink-0" weight="bold" />
            <span className="text-[11px] leading-tight">
              <strong className="text-slate-900">{t("clubs.meetingSchedule")}:</strong>{" "}
              {meeting}
            </span>
          </div>

          <div className="flex items-start gap-2 text-slate-700">
            <UserCircleGear
              className="w-3.5 h-3.5 text-[#193E8A] mt-0.5 shrink-0"
              weight="duotone"
            />
            <span className="text-[11px] leading-tight">
              <strong className="text-slate-900">{t("clubs.leadership")}:</strong>{" "}
              {leadership}
            </span>
          </div>

          {linkedCount > 0 && (
            <button
              type="button"
              onClick={onSelectClubForEvents}
              className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#EEF3FC] hover:bg-[#193E8A] hover:text-white text-[#193E8A] py-1.5 text-[11px] font-bold transition-all cursor-pointer"
            >
              <CalendarBlank className="w-3.5 h-3.5" weight="fill" />
              <span>
                {t("clubs.linkedEvents")} ({linkedCount})
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Sub-Component: Activity Card ──────────────────────────────────
function ActivityCard({
  activity,
  clubMap,
  statusBadgeLabel,
}: {
  activity: Activity;
  clubMap: Map<number, string>;
  statusBadgeLabel: (status: string) => string;
}) {
  const locale = useLocale();

  const title = locField(locale, activity.title, activity.titleMy);
  const loc = locField(locale, activity.location, activity.locationMy);
  const desc = locField(locale, activity.description, activity.descriptionMy);
  const hostClub = activity.clubId ? clubMap.get(activity.clubId) : null;

  return (
    <article className="group rounded-3xl bg-white border border-slate-200/90 hover:border-[#193E8A]/40 shadow-2xs hover:shadow-hinthar transition-all overflow-hidden flex flex-col">
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        <Image
          src={activity.image || "/images/engineering.avif"}
          alt={title}
          fill
          unoptimized={isR2AssetUrl(activity.image)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2759]/80 via-transparent to-transparent" />

        {/* Date Stamp */}
        <div className="absolute top-3 left-3 rounded-xl bg-white/95 shadow-xs px-2.5 py-1 text-center leading-tight">
          <span className="block text-[9px] font-extrabold uppercase text-[#193E8A]">
            {activity.month}
          </span>
          <span className="block text-base font-extrabold text-[#1E232B]">
            {activity.day}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
              activity.status === "Active Registration"
                ? "bg-[#FFD600] text-[#162033]"
                : activity.status === "Past Highlight"
                  ? "bg-slate-100 text-slate-600"
                  : "bg-white text-[#193E8A]"
            }`}
          >
            {statusBadgeLabel(activity.status)}
          </span>
          {activity.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFD600] p-1 text-[#162033]">
              <Sparkle className="w-2.5 h-2.5" weight="fill" />
            </span>
          )}
        </div>

        {hostClub && (
          <span className="absolute bottom-2.5 left-3 text-[10px] font-bold text-white/90 drop-shadow-xs">
            {hostClub}
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <h3 className="text-base font-extrabold text-[#1E232B] leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
            {desc}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#193E8A] shrink-0" weight="bold" />
            <span className="text-[11px] font-medium truncate">{activity.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#193E8A] shrink-0" weight="fill" />
            <span className="text-[11px] font-medium truncate">{loc}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
