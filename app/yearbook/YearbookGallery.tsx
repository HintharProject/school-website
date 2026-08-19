"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatCampusBadge } from "../admin/adminStore";

interface YearbookEntry {
  id: number;
  name: string;
  category: "Class of 2026" | "Class of 2025" | "Class of 2024" | "University Placements" | "Competitions";
  categoryLabel: string;
  role: string;
  destination?: string;
  subjects?: string;
  quote: string;
  image: string;
  badge?: string;
  campus?: string;
}

const categories = [
  "All",
  "Class of 2026",
  "Class of 2025",
  "Class of 2024",
  "University Placements",
  "Competitions",
];

const campusFilters = [
  { id: "All", label: "All Campuses" },
  { id: "Yangon", label: "Yangon Campuses" },
  { id: "Mawlamyine", label: "Mawlamyine Regional" },
  { id: "Both", label: "Both (Dual Network)" },
];

export default function YearbookGallery() {
  const [entries, setEntries] = useState<YearbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCampus, setActiveCampus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadYearbook() {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("yearbook_alumni")
          .select("*")
          .eq("status", "published")
          .order("category", { ascending: false });

        if (!error && data) {
          const mapped: YearbookEntry[] = data.map((d: any) => ({
            id: Number(d.id),
            name: d.name,
            category: d.category,
            categoryLabel: d.category === "Class of 2026" ? "Pearson IAL Scholar" : "Alumni Success",
            role: d.role,
            destination: d.destination,
            subjects: d.subjects,
            quote: d.quote,
            image: d.image || "/images/g5.jpg",
            badge: d.badge || "Alumni",
            campus: d.campus || "both-campuses",
          }));
          setEntries(mapped);
        }
      } catch (err) {
        console.warn("Supabase yearbook fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadYearbook();
  }, []);

  const filteredEntries = entries.filter((entry) => {
    const matchesCategory =
      activeCategory === "All" ||
      entry.category === activeCategory ||
      (activeCategory === "University Placements" && Boolean(entry.destination));

    const campusInfo = formatCampusBadge(entry.campus);
    const matchesCampus =
      activeCampus === "All" ||
      campusInfo.city === activeCampus ||
      (activeCampus === "Both" && campusInfo.city === "Both") ||
      (activeCampus === "Yangon" && (campusInfo.city === "Yangon" || campusInfo.city === "Both")) ||
      (activeCampus === "Mawlamyine" && (campusInfo.city === "Mawlamyine" || campusInfo.city === "Both"));

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      entry.name.toLowerCase().includes(searchLower) ||
      entry.role.toLowerCase().includes(searchLower) ||
      (entry.destination && entry.destination.toLowerCase().includes(searchLower)) ||
      entry.quote.toLowerCase().includes(searchLower);

    return matchesCategory && matchesCampus && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-8 py-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-4 py-1.5 rounded-full mb-4 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">auto_stories</span>
            <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">
              Student Legacy &amp; Destinations
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#09234B] mb-3 tracking-tight">
            Yearbook &amp; <span className="text-[#0E3B7D]">Alumni Gallery</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-normal">
            Celebrating the achievements, distinctions, and international university pathways of our graduating cohorts across Yangon and Mawlamyine campuses.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-10 space-y-4">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 text-base">search</span>
            </div>
            <input
              type="text"
              placeholder="Search by student name, university, or distinction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-xs sm:text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Cohort Category Pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                  activeCategory === category
                    ? "bg-[#0E3B7D] text-white shadow-md scale-105"
                    : "bg-white text-slate-600 hover:text-[#0E3B7D] border border-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Campus Location Filter */}
          <div className="flex flex-wrap justify-center items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-[#0E3B7D]">pin_drop</span>
              <span>Campus:</span>
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

        {/* Gallery Grid */}
        {filteredEntries.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs max-w-xl mx-auto">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">auto_stories</span>
            <h3 className="text-base font-bold text-[#09234B]">No yearbook entries found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Published alumni scholar profiles and distinctions from the database will appear here.
            </p>
          </div>
        )}

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredEntries.map((entry) => {
              const campusBadge = formatCampusBadge(entry.campus);

              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Photo with Badge */}
                    <div className="h-56 relative overflow-hidden bg-slate-900">
                      <Image
                        src={entry.image || "/images/g5.jpg"}
                        alt={entry.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#09234B]/85 via-black/20 to-black/10" />

                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        <span className="bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[10px] font-black text-[#0E3B7D] shadow-sm border border-slate-200">
                          {entry.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${campusBadge.badgeClass}`}
                        >
                          {campusBadge.label}
                        </span>
                      </div>

                      {entry.badge && (
                        <div className="absolute top-3 right-3 bg-[#FFC700] text-[#09234B] px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm border border-[#FFC700]">
                          {entry.badge}
                        </div>
                      )}

                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <h3 className="text-lg font-black leading-tight drop-shadow-sm">{entry.name}</h3>
                        <p className="text-xs text-[#FFC700] font-bold">{entry.role}</p>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-5 space-y-3">
                      {entry.destination && (
                        <div className="flex items-start gap-2 text-xs font-bold text-[#0E3B7D] bg-[#E8F0FE] p-2.5 rounded-xl border border-[#0E3B7D]/15">
                          <span className="material-symbols-outlined text-[#0E3B7D] text-base shrink-0 mt-0.5">school</span>
                          <span>{entry.destination}</span>
                        </div>
                      )}

                      {entry.subjects && (
                        <p className="text-[11px] text-slate-600 font-medium">
                          <strong className="text-slate-800">Curriculum Track:</strong> {entry.subjects}
                        </p>
                      )}

                      <p className="text-xs text-slate-600 font-normal italic leading-relaxed border-l-2 border-[#FFC700] pl-3 py-0.5">
                        &quot;{entry.quote}&quot;
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-100 mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Hinthar International School</span>
                    <span className="material-symbols-outlined text-[#FFC700] text-sm font-bold">verified</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">auto_stories</span>
            <h3 className="text-base font-bold text-[#09234B] mb-1">No entries published yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Yearbook honors and university placements will appear here once published.
            </p>
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
