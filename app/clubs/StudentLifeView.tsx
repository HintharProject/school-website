"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import { formatCampusBadge } from "../admin/adminStore";
import { getClubs } from "@/lib/actions/clubs";
import { getActivities } from "@/lib/actions/activities";
import ImageCarousel from "../components/ImageCarousel";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

interface ClubItem {
  id: number;
  name: string;
  category: "stem" | "debate" | "sports" | "arts";
  categoryLabel: string;
  icon: string;
  members: string;
  meetingTime: string;
  room: string;
  leadership: string;
  description: string;
  image: string;
  galleryUrls: string[];
  campus?: string;
}

const campusFilters = [
  { id: "All", label: "All Campuses" },
  { id: "Yangon", label: "Yangon Campuses" },
  { id: "Mawlamyine", label: "Mawlamyine Regional" },
  { id: "Both", label: "Both (All-School)" },
];

interface RawClubRecord {
  id: number | string;
  name: string;
  category: string;
  icon?: string;
  members?: string;
  meetingTime?: string;
  meeting_time?: string;
  leadership?: string;
  description: string;
  image?: string;
  galleryUrls?: string[] | string;
  gallery_urls?: string[] | string;
  campus?: string | null;
  status?: string;
}

function mapClub(c: RawClubRecord): ClubItem {
  let cat: "stem" | "debate" | "sports" | "arts" = "stem";
  if (c.category.includes("Debate")) cat = "debate";
  else if (c.category.includes("Sports")) cat = "sports";
  else if (c.category.includes("Creative") || c.category.includes("Arts")) cat = "arts";

  const rawGallery = c.galleryUrls ?? c.gallery_urls ?? [];
  let galleryUrls: string[] = [];
  if (Array.isArray(rawGallery)) galleryUrls = rawGallery;
  else {
    try {
      const parsed = JSON.parse(rawGallery);
      galleryUrls = Array.isArray(parsed) ? parsed : [];
    } catch {
      galleryUrls = [];
    }
  }

  return {
    id: Number(c.id),
    name: c.name,
    category: cat,
    categoryLabel: c.category,
    icon: c.icon || "groups",
    members: c.members || "30+ Members",
    meetingTime: c.meetingTime || c.meeting_time || "Weekly",
    room: "Campus Dedicated Studio",
    leadership: c.leadership || "Student Council Lead",
    description: c.description,
    image: c.image || "/images/g2.jpg",
    galleryUrls,
    campus: c.campus || "both-campuses",
  };
}

interface SchoolEvent {
  id: number;
  title: string;
  category: "academic" | "sports" | "cultural" | "science";
  date: string;
  month: string;
  day: string;
  time: string;
  location: string;
  description: string;
  image: string;
  status: "Upcoming" | "Active Registration" | "Past Highlight";
  featured?: boolean;
}

const galleryMoments = [
  { image: "/images/g1.jpg", caption: "Primary Science Discovery Day", tag: "Primary" },
  { image: "/images/g2.jpg", caption: "Physics Optics & Mechanics Workshop", tag: "IGCSE Lab" },
  { image: "/images/g3.jpg", caption: "Coding & Python Project Showcase", tag: "Computing" },
  { image: "/images/g5.jpg", caption: "Student Council Election & Leadership Camp", tag: "Student Life" },
  { image: "/images/g8.jpg", caption: "Art, Design & Global Culture Exhibition", tag: "Arts" },
  { image: "/images/g9.jpg", caption: "Alumni & Parent Engagement Night", tag: "Community" },
];

interface RawActivityRecord {
  id: number | string;
  title: string;
  category: string;
  date: string;
  month?: string;
  day?: string;
  time: string;
  location: string;
  description: string;
  image?: string;
  status: string;
  featured?: number | boolean | null;
  reviewStatus?: string;
}

function mapActivity(a: RawActivityRecord): SchoolEvent {
  return {
    id: Number(a.id),
    title: a.title,
    category: a.category as SchoolEvent["category"],
    date: a.date,
    month: (a.month || a.date || "").slice(0, 3).toUpperCase(),
    day: a.day || a.date,
    time: a.time,
    location: a.location,
    description: a.description,
    image: a.image || "/images/engineering.avif",
    status: a.status as SchoolEvent["status"],
    featured: Boolean(a.featured),
  };
}

export default function StudentLifeView({
  initialClubs,
  initialActivities,
  initialTab = "clubs",
}: {
  initialClubs?: RawClubRecord[];
  initialActivities?: RawActivityRecord[];
  initialTab?: "clubs" | "activities";
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"clubs" | "activities">(
    tabParam === "activities" || initialTab === "activities" ? "activities" : "clubs"
  );

  useEffect(() => {
    if (tabParam === "activities" || tabParam === "clubs") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const switchTab = (tab: "clubs" | "activities") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/clubs?${params.toString()}`, { scroll: false });
  };

  // ── CLUBS STATE ──
  const [clubs, setClubs] = useState<ClubItem[]>(() =>
    (initialClubs ?? [])
      .filter((c) => c.status === "published" || !c.status)
      .map(mapClub)
  );
  const [activeClubCategory, setActiveClubCategory] = useState<string>("all");
  const [activeCampus, setActiveCampus] = useState<string>("All");
  const [selectedClub, setSelectedClub] = useState<ClubItem | null>(null);

  // ── ACTIVITIES STATE ──
  const [events, setEvents] = useState<SchoolEvent[]>(() =>
    (initialActivities ?? [])
      .filter((a) => a.reviewStatus === "published" || !a.reviewStatus)
      .map(mapActivity)
  );
  const [activeEventCategory, setActiveEventCategory] = useState<string>("all");
  const [rsvpModalEvent, setRsvpModalEvent] = useState<SchoolEvent | null>(null);
  const [rsvpForm, setRsvpForm] = useState({ name: "", email: "", grade: "Year 10", notes: "" });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Filter Clubs
  const filteredClubs = clubs.filter((c) => {
    const matchesCat = activeClubCategory === "all" || c.category === activeClubCategory;
    const matchesCamp =
      activeCampus === "All" ||
      c.campus === activeCampus ||
      c.campus === "both-campuses" ||
      (activeCampus === "Yangon" && (c.campus?.toLowerCase().includes("yangon") || c.campus?.includes("ywarma") || c.campus?.includes("shwe"))) ||
      (activeCampus === "Mawlamyine" && c.campus?.toLowerCase().includes("mawlamyine"));
    return matchesCat && matchesCamp;
  });

  // Filter Events
  const filteredEvents = events.filter((e) => {
    if (activeEventCategory === "all") return true;
    return e.category === activeEventCategory;
  });

  const featuredEvent = events.find((e) => e.featured) || events[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
      <Navbar />

      <main className="flex-1 max-w-[1240px] mx-auto w-full px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-[#FFF8E1] border border-[#FFC700]/40 px-4 py-1.5 rounded-full mb-3.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#FFC700] animate-pulse" />
            <span className="text-[11px] font-black text-[#09234B] uppercase tracking-wider">
              Student Life &amp; Leadership
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#09234B] tracking-tight leading-tight mb-3">
            Passions, Clubs &amp; Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Empowering students beyond the classroom with student-led academic societies, athletic leagues, innovation competitions, and memorable campus traditions.
          </p>
        </div>

        {/* Unified Tab Switcher */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="inline-flex p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm gap-1">
            <button
              type="button"
              onClick={() => switchTab("clubs")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "clubs"
                  ? "bg-[#0E3B7D] text-white shadow-sm font-black"
                  : "text-slate-600 hover:text-[#0E3B7D] hover:bg-slate-50"
              }`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">groups</span>
              <span>Student Clubs &amp; Societies</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "clubs" ? "bg-[#FFC700] text-[#09234B]" : "bg-slate-100 text-slate-600"
                }`}
              >
                {clubs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => switchTab("activities")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "activities"
                  ? "bg-[#0E3B7D] text-white shadow-sm font-black"
                  : "text-slate-600 hover:text-[#0E3B7D] hover:bg-slate-50"
              }`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">event</span>
              <span>Events &amp; Activities Calendar</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "activities" ? "bg-[#FFC700] text-[#09234B]" : "bg-slate-100 text-slate-600"
                }`}
              >
                {events.length}
              </span>
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            TAB 1: STUDENT CLUBS & SOCIETIES
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === "clubs" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { id: "all", label: "All Clubs" },
                { id: "stem", label: "STEM & Robotics" },
                { id: "debate", label: "Debate & MUN" },
                { id: "sports", label: "Sports & Athletics" },
                { id: "arts", label: "Creative Arts & Media" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveClubCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeClubCategory === cat.id
                      ? "bg-[#FFC700] text-[#09234B] shadow-sm font-black"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-[#0E3B7D]/40"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Campus Selector */}
            <div className="flex justify-center">
              <div className="inline-flex p-1 bg-white rounded-2xl border border-slate-200 shadow-xs">
                {campusFilters.map((cf) => (
                  <button
                    key={cf.id}
                    onClick={() => setActiveCampus(cf.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeCampus === cf.id
                        ? "bg-[#0E3B7D] text-[#FFC700] font-black"
                        : "text-slate-600 hover:text-[#0E3B7D]"
                    }`}
                  >
                    {cf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clubs Grid */}
            {filteredClubs.length === 0 ? (
              <div className="text-center py-16 px-6 border border-dashed border-slate-300 rounded-3xl max-w-md mx-auto bg-white">
                <span aria-hidden="true" className="material-symbols-outlined text-4xl text-slate-300">groups</span>
                <h2 className="text-base font-black text-[#09234B] mt-3">No Clubs Found</h2>
                <p className="text-xs text-slate-500 mt-1">Try adjusting the category or campus filter above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubs.map((club) => {
                  const campusBadge = formatCampusBadge(club.campus);
                  return (
                    <div
                      key={club.id}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                          <ImageCarousel
                            images={[club.image, ...club.galleryUrls]}
                            alt={club.name}
                            className="h-full w-full opacity-90"
                          />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#09234B]/80 text-[#FFC700] backdrop-blur-sm">
                              {club.categoryLabel}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 space-y-3">
                          <h3 className="text-lg font-black text-[#09234B]">{club.name}</h3>
                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                            {club.description}
                          </p>

                          <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                            <p className="flex items-center gap-2">
                              <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">schedule</span>
                              <span>{club.meetingTime}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">person</span>
                              <span className="truncate">{club.leadership}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">apartment</span>
                              <span className="font-bold text-[#0E3B7D]">{campusBadge}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 pt-0">
                        <button
                          type="button"
                          onClick={() => setSelectedClub(club)}
                          className="w-full py-2.5 rounded-xl border border-[#0E3B7D] text-[#0E3B7D] hover:bg-[#0E3B7D] hover:text-white font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer text-center"
                        >
                          View Society &amp; Join
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 2: EVENTS & ACTIVITIES CALENDAR
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === "activities" && (
          <div className="space-y-10 animate-fadeIn">
            {/* Featured Event Hero Banner */}
            {featuredEvent && (
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#09234B] to-[#0E3B7D] text-white p-6 sm:p-10 shadow-lg flex flex-col lg:flex-row items-center gap-8">
                <div className="relative w-full lg:w-1/2 h-64 sm:h-80 rounded-2xl overflow-hidden shrink-0">
                  <Image
                    src={featuredEvent.image}
                    alt={featuredEvent.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 rounded-full bg-[#FFC700] text-[#09234B] text-[10px] font-black uppercase tracking-wider shadow-sm">
                      ★ Featured School Event
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2.5 text-xs text-[#FFC700] font-bold">
                    <span aria-hidden="true" className="material-symbols-outlined text-base">event</span>
                    <span>{featuredEvent.date}</span>
                    <span>•</span>
                    <span aria-hidden="true" className="material-symbols-outlined text-base">location_on</span>
                    <span>{featuredEvent.location}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {featuredEvent.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed line-clamp-3">
                    {featuredEvent.description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRsvpModalEvent(featuredEvent)}
                      className="px-6 py-3 rounded-full bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                    >
                      Express Interest / RSVP
                    </button>
                    <span className="text-xs text-slate-300 font-semibold">
                      Time: {featuredEvent.time}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { id: "all", label: "All Activities" },
                { id: "academic", label: "Academic Competitions" },
                { id: "science", label: "Science & Innovation" },
                { id: "sports", label: "Sports & Meets" },
                { id: "cultural", label: "Arts & Culture" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveEventCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeEventCategory === cat.id
                      ? "bg-[#FFC700] text-[#09234B] shadow-sm font-black"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-[#0E3B7D]/40"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Events List */}
            {filteredEvents.length === 0 ? (
              <div className="text-center py-16 px-6 border border-dashed border-slate-300 rounded-3xl max-w-md mx-auto bg-white">
                <span aria-hidden="true" className="material-symbols-outlined text-4xl text-slate-300">event_busy</span>
                <h2 className="text-base font-black text-[#09234B] mt-3">No Events Scheduled</h2>
                <p className="text-xs text-slate-500 mt-1">Check back soon for new school calendar events.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                        <Image
                          src={evt.image}
                          alt={evt.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl p-2 text-center shadow-md min-w-[50px]">
                          <span className="block text-[10px] font-black text-[#0E3B7D] uppercase">
                            {evt.month}
                          </span>
                          <span className="block text-sm font-black text-[#09234B]">
                            {evt.day.replace(/[^0-9]/g, "").slice(0, 2) || "20"}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#09234B]/80 text-[#FFC700] backdrop-blur-sm">
                            {evt.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <h3 className="text-base font-black text-[#09234B] group-hover:text-[#0E3B7D] transition-colors line-clamp-2">
                          {evt.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {evt.description}
                        </p>

                        <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                          <p className="flex items-center gap-1.5">
                            <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">schedule</span>
                            <span>{evt.time}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">location_on</span>
                            <span className="truncate">{evt.location}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <button
                        type="button"
                        onClick={() => setRsvpModalEvent(evt)}
                        className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-[#0E3B7D] text-[#09234B] hover:text-white border border-slate-200 hover:border-[#0E3B7D] text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                      >
                        Event Details &amp; RSVP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Campus Gallery Moments */}
            <div className="pt-10 border-t border-slate-200">
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0E3B7D] bg-blue-50 px-3 py-1 rounded-full">
                  Campus Snapshot
                </span>
                <h3 className="text-2xl font-black text-[#09234B] mt-2">Vibrant Student Life Moments</h3>
                <p className="text-xs text-slate-500 mt-1">A glimpse into competitions, experiments, and team triumphs.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {galleryMoments.map((mom, i) => (
                  <div key={i} className="group relative h-40 rounded-2xl overflow-hidden shadow-xs">
                    <Image
                      src={mom.image}
                      alt={mom.caption}
                      fill
                      sizes="(max-width: 640px) 50vw, 16vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                      <span className="text-[9px] font-black uppercase text-[#FFC700]">{mom.tag}</span>
                      <p className="text-[10px] text-white font-medium line-clamp-2">{mom.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            CLUB DETAIL & JOIN MODAL
            ════════════════════════════════════════════════════════════════ */}
        {selectedClub && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0E3B7D] bg-blue-50 px-2.5 py-1 rounded-full">
                    {selectedClub.categoryLabel}
                  </span>
                  <h3 className="text-2xl font-black text-[#09234B] mt-2">{selectedClub.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClub(null)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <span aria-hidden="true" className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-900">
                <ImageCarousel
                  images={[selectedClub.image, ...selectedClub.galleryUrls]}
                  alt={selectedClub.name}
                  className="h-full w-full"
                />
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <h4 className="font-black text-[#09234B] text-sm uppercase tracking-wider">About This Club</h4>
                <p>{selectedClub.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[10px]">Weekly Meeting</span>
                  <strong className="text-slate-800">{selectedClub.meetingTime}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[10px]">Lead Mentor</span>
                  <strong className="text-slate-800">{selectedClub.leadership}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[10px]">Campus</span>
                  <strong className="text-slate-800">{formatCampusBadge(selectedClub.campus)}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[10px]">Members</span>
                  <strong className="text-slate-800">{selectedClub.members}</strong>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Link
                  href="/admission"
                  className="flex-1 py-3 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] rounded-xl text-xs font-black uppercase tracking-wider text-center transition-all shadow-sm"
                >
                  Enroll at Hinthar
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedClub(null)}
                  className="px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            EVENT RSVP MODAL
            ════════════════════════════════════════════════════════════════ */}
        {rsvpModalEvent && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0E3B7D] bg-blue-50 px-2.5 py-1 rounded-full">
                    {rsvpModalEvent.status}
                  </span>
                  <h3 className="text-xl font-black text-[#09234B] mt-2">{rsvpModalEvent.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {rsvpModalEvent.date} • {rsvpModalEvent.time} • {rsvpModalEvent.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRsvpModalEvent(null);
                    setRsvpSubmitted(false);
                  }}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <span aria-hidden="true" className="material-symbols-outlined">close</span>
                </button>
              </div>

              {rsvpSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <span aria-hidden="true" className="material-symbols-outlined text-3xl">check</span>
                  </div>
                  <h4 className="text-base font-black text-[#09234B]">Interest Registered!</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Thank you! Our student activities council will confirm your seat details via email.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRsvpModalEvent(null);
                      setRsvpSubmitted(false);
                    }}
                    className="mt-4 px-6 py-2.5 bg-[#0E3B7D] text-white rounded-xl text-xs font-black uppercase tracking-wider"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setRsvpSubmitted(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <p className="text-slate-600 leading-relaxed">
                    {rsvpModalEvent.description}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Student / Guest Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="Your full name"
                        value={rsvpForm.name}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                      <input
                        required
                        type="email"
                        placeholder="you@example.com"
                        value={rsvpForm.email}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Academic Year / Role</label>
                      <select
                        value={rsvpForm.grade}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, grade: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="Year 7-9">Lower Secondary (Yr 7-9)</option>
                        <option value="Year 10">IGCSE Year 10</option>
                        <option value="Year 11">IGCSE Year 11</option>
                        <option value="Year 12">IAL Year 12</option>
                        <option value="Year 13">IAL Year 13</option>
                        <option value="Parent">Parent / Guardian</option>
                        <option value="Alumni">Alumni</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                    >
                      Confirm RSVP
                    </button>
                    <button
                      type="button"
                      onClick={() => setRsvpModalEvent(null)}
                      className="px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
