"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import ChatbotWidget from "../components/ChatbotWidget";
import { formatCampusBadge } from "../admin/adminStore";
import { getYearbook } from "@/lib/actions/yearbook";

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

interface RawYearbookRecord {
  id: number | string;
  name: string;
  category: string;
  role: string;
  destination?: string | null;
  subjects?: string | null;
  quote: string;
  image?: string;
  badge?: string | null;
  campus?: string | null;
  status?: string;
}

function mapYearbookEntry(d: RawYearbookRecord): YearbookEntry {
  return {
    id: Number(d.id),
    name: d.name,
    category: d.category as YearbookEntry["category"],
    categoryLabel: d.category === "Class of 2026" ? "Pearson IAL Scholar" : "Alumni Success",
    role: d.role,
    destination: d.destination ?? undefined,
    subjects: d.subjects ?? undefined,
    quote: d.quote,
    image: d.image || "/images/g5.jpg",
    badge: d.badge || "Alumni",
    campus: d.campus || "both-campuses",
  };
}

export default function YearbookGallery({
  initialData,
}: {
  initialData?: RawYearbookRecord[];
}) {
  const [entries, setEntries] = useState<YearbookEntry[]>(() =>
    (initialData ?? [])
      .filter((d) => d.status === "published" || !d.status)
      .map(mapYearbookEntry)
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [hasError, setHasError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCampus, setActiveCampus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (initialData) return;

    async function loadYearbook() {
      try {
        setIsLoading(true);
        setHasError(false);
        const data = await getYearbook();
        setEntries(
          (data as RawYearbookRecord[])
            .filter((d) => d.status === "published" || !d.status)
            .map(mapYearbookEntry)
        );
      } catch (err) {
        console.warn("Yearbook fetch note:", err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadYearbook();
  }, [initialData]);

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
            <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">auto_stories</span>
            <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">
              Hinthar Alumni Chronicle
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#09234B] mb-3 tracking-tight">
            Yearbook &amp; <span className="text-[#0E3B7D]">Hall of Honors</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-normal">
            Celebrating our Pearson Edexcel High Achievers, World Medalists, and graduates advancing to prestigious universities across the United Kingdom, Singapore, Australia, and worldwide.
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-10">
          {/* Categories */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#0E3B7D] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Campus Selector & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {campusFilters.map((cf) => (
                <button
                  key={cf.id}
                  onClick={() => setActiveCampus(cf.id)}
                  aria-pressed={activeCampus === cf.id}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeCampus === cf.id
                      ? "bg-[#FFC700] text-[#09234B] font-black"
                      : "text-slate-600 hover:text-[#0E3B7D]"
                  }`}
                >
                  {cf.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <span aria-hidden="true" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search alumni by name, university, or award"
                placeholder="Search alumni name, university, award..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
              />
            </div>
          </div>
        </div>

        {/* Error state */}
        {hasError && !isLoading && (
          <div role="alert" className="max-w-md mx-auto mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-center">
            <p className="text-sm font-bold text-red-700 mb-2">Could not load the yearbook.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading yearbook entries">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-200 animate-pulse">
                <div className="h-64 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Yearbook Gallery Grid */}
        {!isLoading && (
          filteredEntries.length === 0 ? (
            <div className="text-center py-16 px-6 border border-dashed border-slate-300 rounded-3xl max-w-md mx-auto">
              <span aria-hidden="true" className="material-symbols-outlined text-4xl text-slate-300">auto_stories</span>
              <h2 className="text-base font-black text-[#09234B] mt-3">No Scholars Found</h2>
              <p className="text-xs text-slate-500 mt-1">
                Try adjusting the category, campus, or search filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredEntries.map((scholar) => {
              const campusInfo = formatCampusBadge(scholar.campus);

              return (
                <motion.div
                  key={scholar.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
                      <Image
                        src={scholar.image}
                        alt={scholar.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#09234B]/80 text-[#FFC700] backdrop-blur-sm">
                          {scholar.category}
                        </span>
                        {scholar.badge && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600/90 text-white backdrop-blur-sm">
                            {scholar.badge}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <h3 className="text-xl font-black">{scholar.name}</h3>
                        <p className="text-xs text-[#FFC700] font-semibold">{scholar.role}</p>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      {scholar.destination && (
                        <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs">
                          <span className="font-bold text-[#0E3B7D] block text-[10px] uppercase tracking-wider">
                            University Destination
                          </span>
                          <span className="text-slate-800 font-semibold">{scholar.destination}</span>
                        </div>
                      )}

                      {scholar.subjects && (
                        <div className="text-xs text-slate-500">
                          <strong className="text-slate-700">Subject Distinctions:</strong> {scholar.subjects}
                        </div>
                      )}

                      <p className="text-xs text-slate-600 italic leading-relaxed pt-1">
                        &ldquo;{scholar.quote}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${campusInfo.badgeClass}`}>
                      {campusInfo.label}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      HIS Scholar #{scholar.id}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
            </div>
          )
        )}
      </main>

      <FooterSection />
      <ChatbotWidget />
    </div>
  );
}
