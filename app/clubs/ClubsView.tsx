"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import ChatbotWidget from "../components/ChatbotWidget";
import { formatCampusBadge } from "../admin/adminStore";
import { getClubs } from "@/lib/actions/clubs";

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
  campus?: string | null;
  status?: string;
}

function mapClub(c: RawClubRecord): ClubItem {
  let cat: "stem" | "debate" | "sports" | "arts" = "stem";
  if (c.category.includes("Debate")) cat = "debate";
  else if (c.category.includes("Sports")) cat = "sports";
  else if (c.category.includes("Creative") || c.category.includes("Arts")) cat = "arts";

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
    campus: c.campus || "both-campuses",
  };
}

export default function ClubsView({ initialData }: { initialData?: RawClubRecord[] }) {
  const [clubs, setClubs] = useState<ClubItem[]>(() =>
    (initialData ?? [])
      .filter((c) => c.status === "published" || !c.status)
      .map(mapClub)
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeCampus, setActiveCampus] = useState<string>("All");
  const [selectedClub, setSelectedClub] = useState<ClubItem | null>(null);

  useEffect(() => {
    if (initialData) return;

    async function loadClubs() {
      try {
        setIsLoading(true);
        const data = await getClubs();
        setClubs(
          ((data ?? []) as RawClubRecord[])
            .filter((c) => c.status === "published" || !c.status)
            .map(mapClub)
        );
      } catch (err) {
        console.warn("Clubs fetch note:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadClubs();
  }, [initialData]);

  const filteredClubs = clubs.filter((c) => {
    const matchesCategory = activeCategory === "all" || c.category === activeCategory;
    const campusInfo = formatCampusBadge(c.campus);
    const matchesCampus =
      activeCampus === "All" ||
      campusInfo.city === activeCampus ||
      (activeCampus === "Both" && campusInfo.city === "Both") ||
      (activeCampus === "Yangon" && (campusInfo.city === "Yangon" || campusInfo.city === "Both")) ||
      (activeCampus === "Mawlamyine" && (campusInfo.city === "Mawlamyine" || campusInfo.city === "Both"));

    return matchesCategory && matchesCampus;
  });

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-8 py-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-4 py-1.5 rounded-full mb-4 border border-[#0E3B7D]/20">
            <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">groups</span>
            <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">
              Student Leadership &amp; Societies
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#09234B] mb-3 tracking-tight">
            Clubs &amp; <span className="text-[#0E3B7D]">Extracurriculars</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-normal">
            Beyond academic excellence, Hinthar scholars lead innovation in AI robotics, Model UN parliamentary debates, scientific discovery, fine arts, and competitive athletics.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {[
            { id: "all", label: "All Clubs" },
            { id: "stem", label: "STEM & Robotics" },
            { id: "debate", label: "Model UN & Debate" },
            { id: "arts", label: "Arts & Media" },
            { id: "sports", label: "Sports & Athletics" },
          ].map((cat) => (
            <button
              key={cat.id}
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

        {/* Campus Filter Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-white rounded-2xl border border-slate-200 shadow-xs">
            {campusFilters.map((cf) => (
              <button
                key={cf.id}
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

        {/* Clubs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading clubs">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-200 animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredClubs.length === 0 ? (
          <div className="text-center py-16 px-6 border border-dashed border-slate-300 rounded-3xl max-w-md mx-auto">
            <span aria-hidden="true" className="material-symbols-outlined text-4xl text-slate-300">groups</span>
            <h2 className="text-base font-black text-[#09234B] mt-3">No Clubs Found</h2>
            <p className="text-xs text-slate-500 mt-1">Try adjusting the category or campus filters.</p>
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
                    <Image
                      src={club.image}
                      alt={club.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
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
                    </div>
                  </div>
                </div>

                <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${campusBadge.badgeClass}`}>
                    {campusBadge.label}
                  </span>
                  <button
                    onClick={() => setSelectedClub(club)}
                    aria-haspopup="dialog"
                    className="px-4 py-2 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    How to Join
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* How to Join Modal */}
        {selectedClub && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="join-club-title"
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0E3B7D]">
                    Society Enrollment
                  </span>
                  <h3 id="join-club-title" className="text-xl font-black text-[#09234B]">{selectedClub.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClub(null)}
                  aria-label="Close club details"
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <span aria-hidden="true" className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-slate-600 space-y-1">
                <p><strong>Session:</strong> {selectedClub.meetingTime}</p>
                <p><strong>Advisor:</strong> {selectedClub.leadership}</p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                <p className="font-bold text-[#09234B] uppercase tracking-wider text-[11px]">How to Join</p>
                <p>
                  Club memberships are enrolled by the School Administration. Visit the Student Affairs office at your
                  campus — or ask your homeroom teacher to register you — and our coordinators will add you to the
                  roster before the next session.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <p className="flex items-center gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">schedule</span>
                    <span>Sessions: {selectedClub.meetingTime}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">call</span>
                    <span>Inquiries: +95 9 894 332200</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedClub(null)}
                  className="px-4 py-2 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <FooterSection />
      <ChatbotWidget />
    </div>
  );
}
