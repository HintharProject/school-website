"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatCampusBadge } from "../admin/adminStore";

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

export default function ClubsView() {
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeCampus, setActiveCampus] = useState<string>("All");
  const [selectedClub, setSelectedClub] = useState<ClubItem | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentGrade, setStudentGrade] = useState("IGCSE Year 1");
  const [joinSuccess, setJoinSuccess] = useState(false);

  useEffect(() => {
    async function loadClubs() {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("clubs")
          .select("*")
          .eq("is_active", true)
          .eq("status", "published")
          .order("id", { ascending: true });

        if (!error && data) {
          const mapped: ClubItem[] = data.map((c: any) => {
            let cat: "stem" | "debate" | "sports" | "arts" = "stem";
            if (c.category.includes("Debate")) cat = "debate";
            else if (c.category.includes("Sports")) cat = "sports";
            else if (c.category.includes("Creative")) cat = "arts";

            return {
              id: Number(c.id),
              name: c.name,
              category: cat,
              categoryLabel: c.category,
              icon: c.icon || "groups",
              members: c.members || "30+ Members",
              meetingTime: c.meeting_time || "Weekly",
              room: "Campus Dedicated Studio",
              leadership: c.leadership || "Student Council Lead",
              description: c.description,
              image: c.image || "/images/g2.jpg",
              campus: c.campus || "both-campuses",
            };
          });
          setClubs(mapped);
        }
      } catch (err) {
        console.warn("Supabase clubs fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadClubs();
  }, []);

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

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinSuccess(true);
    setTimeout(() => {
      setJoinSuccess(false);
      setSelectedClub(null);
      setStudentName("");
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-8 py-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-4 py-1.5 rounded-full mb-4 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">groups</span>
            <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">
              Extracurricular Excellence
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#09234B] mb-3 tracking-tight">
            Student <span className="text-[#0E3B7D]">Clubs &amp; Societies</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-normal">
            Develop leadership, build lifelong friendships, and explore your passions through our diverse student-led extracurricular clubs across Yangon &amp; Mawlamyine.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="space-y-3 mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "all", label: "All Clubs" },
              { id: "stem", label: "STEM & Tech" },
              { id: "debate", label: "Debate & MUN" },
              { id: "sports", label: "Sports & Athletics" },
              { id: "arts", label: "Arts & Media" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeCategory === tab.id
                    ? "bg-[#0E3B7D] text-white shadow-md scale-105"
                    : "bg-white text-slate-600 hover:text-[#0E3B7D] border border-slate-200 shadow-sm"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Campus Location Scope */}
          <div className="flex flex-wrap justify-center items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-[#0E3B7D]">pin_drop</span>
              <span>Campus Scope:</span>
            </span>
            {campusFilters.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setActiveCampus(loc.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeCampus === loc.id
                    ? "bg-[#FFC700] text-[#09234B] font-black shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clubs Grid */}
        {filteredClubs.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs max-w-xl mx-auto">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">groups</span>
            <h3 className="text-base font-bold text-[#09234B]">No student clubs listed</h3>
            <p className="text-xs text-slate-500 mt-1">
              Active and approved student clubs in the database will appear here.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => {
            const campusBadge = formatCampusBadge(club.campus);

            return (
              <div
                key={club.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image & Header */}
                <div className="h-48 relative overflow-hidden bg-slate-900">
                  <Image
                    src={club.image || "/images/engineering.avif"}
                    alt={club.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09234B]/95 via-[#09234B]/40 to-transparent" />

                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-black uppercase tracking-wider text-white">
                      {club.categoryLabel}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${campusBadge.badgeClass}`}
                    >
                      {campusBadge.label}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-[#FFC700] font-bold">
                        {club.members}
                      </span>
                    </div>
                    <h3 className="text-lg font-black leading-snug">{club.name}</h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    {club.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#FFC700] text-sm font-bold">schedule</span>
                      <span>{club.meetingTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#0E3B7D] text-sm">room</span>
                      <span>{club.room}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                      <span className="material-symbols-outlined text-[#0E3B7D] text-sm">badge</span>
                      <span className="truncate">{club.leadership}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedClub(club)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#E8F0FE] hover:bg-[#0E3B7D] hover:text-white text-[#0E3B7D] text-xs font-black tracking-wider uppercase transition-all"
                  >
                    <span>Sign Up for Club</span>
                    <span className="material-symbols-outlined text-sm font-bold">how_to_reg</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State Notice */}
        {filteredClubs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">groups</span>
            <h3 className="text-base font-bold text-[#09234B] mb-1">No entries published yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Student societies and extracurricular activity schedules will appear here once published.
            </p>
          </div>
        )}
      </main>

      {/* Join Modal */}
      {selectedClub && (
        <div
          className="fixed inset-0 z-[120] bg-[#09234B]/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedClub(null);
          }}
        >
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedClub(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {!joinSuccess ? (
              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0E3B7D]">
                    Student Registration
                  </span>
                  <h3 className="text-lg font-black text-[#09234B] mt-1">
                    {selectedClub.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedClub.room} &bull; Weekly meetings
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Student Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter student name"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Grade Level *
                  </label>
                  <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="Lower Secondary (Year 7–9)">Lower Secondary (Year 7–9)</option>
                    <option value="IGCSE Year 1 (Year 10)">IGCSE Year 1 (Year 10)</option>
                    <option value="IGCSE Year 2 (Year 11)">IGCSE Year 2 (Year 11)</option>
                    <option value="IAL A-Level (Year 12–13)">IAL A-Level (Year 12–13)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] text-xs font-black uppercase tracking-wider shadow-md transition-all border border-[#FFC700]"
                  >
                    Confirm Club Membership
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <span className="material-symbols-outlined text-4xl text-emerald-600 font-bold">check_circle</span>
                <h4 className="text-lg font-black text-[#09234B]">
                  Welcome to {selectedClub.name}!
                </h4>
                <p className="text-xs text-slate-600">
                  <strong>{studentName}</strong> has been enrolled in the club roster. Meeting reminders will be sent via school email.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <FooterSection />
    </div>
  );
}
