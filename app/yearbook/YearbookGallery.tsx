"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";

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
}

const categories = [
  "All",
  "Class of 2026",
  "Class of 2025",
  "Class of 2024",
  "University Placements",
  "Competitions",
];

const yearbookEntries: YearbookEntry[] = [
  {
    id: 1,
    name: "Aung Kaung Myat",
    category: "Class of 2026",
    categoryLabel: "Pearson IAL Scholar",
    role: "Valedictorian & Student Council President",
    destination: "Target: Imperial College London (Mechanical Engineering)",
    subjects: "IAL 4 A*s: Pure Math, Further Math, Physics, Chemistry",
    quote: "Hinthar gave me the discipline, lab exposure, and mentorship to turn my passion for engineering into reality.",
    image: "/images/g5.jpg",
    badge: "World Top Scorer",
  },
  {
    id: 2,
    name: "Su Myat Noe",
    category: "Class of 2026",
    categoryLabel: "Pearson IGCSE & IAL",
    role: "Debate Society Captain & High Distinction",
    destination: "Accepted: National University of Singapore (NUS) - Computer Science",
    subjects: "IAL: Computer Science, Pure Math, Economics",
    quote: "The faculty pushed us to think critically beyond standard textbooks. Grateful for every lesson.",
    image: "/images/g6.jpg",
    badge: "Top Distinction",
  },
  {
    id: 3,
    name: "Min Khant Kyaw",
    category: "Class of 2025",
    categoryLabel: "Alumni Success",
    role: "Science & Robotics Lead",
    destination: "Currently at: University of Melbourne (Biomedical Science)",
    subjects: "IAL: Biology, Chemistry, Mathematics",
    quote: "Practical laboratory experiments at Hinthar made my university transition seamless and exciting.",
    image: "/images/g4.jpg",
    badge: "Alumni 2025",
  },
  {
    id: 4,
    name: "Hnin Wutt Yee",
    category: "Class of 2025",
    categoryLabel: "Commerce Track",
    role: "Business Club Leader & Model UN Delegate",
    destination: "Currently at: University of Manchester (Economics & Finance)",
    subjects: "IAL: Economics, Business Studies, Accounting",
    quote: "Confidence is built step by step. Hinthar gave us the stage to lead and speak with conviction.",
    image: "/images/g8.jpg",
    badge: "Alumni 2025",
  },
  {
    id: 5,
    name: "Zaw Lin Htet",
    category: "Class of 2024",
    categoryLabel: "IGCSE Distinction",
    role: "Badminton Captain & Math Olympiad Silver",
    destination: "Currently at: University of New South Wales (UNSW Sydney - IT)",
    subjects: "IGCSE: 8 A*s (STEM Stream)",
    quote: "Balancing athletic sports and intense Pearson IGCSE exams taught me resilience that stays with me today.",
    image: "/images/g7.jpg",
    badge: "Alumni 2024",
  },
  {
    id: 6,
    name: "Thandar Win",
    category: "Class of 2024",
    categoryLabel: "Alumni Success",
    role: "Peer Tutor & Head Prefect",
    destination: "Currently at: King's College London (Law & Global Politics)",
    subjects: "IAL: Global Perspectives, Literature, Economics",
    quote: "A true international community in the heart of Yangon where every teacher genuinely cares about student growth.",
    image: "/images/g9.jpg",
    badge: "Alumni 2024",
  },
];

export default function YearbookGallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEntries = yearbookEntries.filter((entry) => {
    const matchesCategory =
      activeCategory === "All" ||
      entry.category === activeCategory ||
      (activeCategory === "University Placements" && Boolean(entry.destination));

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      entry.name.toLowerCase().includes(searchLower) ||
      entry.role.toLowerCase().includes(searchLower) ||
      (entry.destination && entry.destination.toLowerCase().includes(searchLower)) ||
      entry.quote.toLowerCase().includes(searchLower);

    return matchesCategory && matchesSearch;
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
            Celebrating the achievements, distinctions, and international university pathways of our graduating cohorts.
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

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                  activeCategory === category
                    ? "bg-[#0E3B7D] text-white shadow-md scale-105"
                    : "bg-white text-slate-600 hover:text-[#0E3B7D] border border-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredEntries.map((entry) => (
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
                  <div className="h-56 relative overflow-hidden">
                    <Image
                      src={entry.image}
                      alt={entry.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09234B]/80 via-transparent to-black/10" />

                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-black text-[#0E3B7D] shadow-sm border border-slate-200">
                      {entry.category}
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
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">search_off</span>
            <h3 className="text-lg font-bold text-[#09234B] mb-1">No alumni records found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search criteria or filter tags.</p>
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
