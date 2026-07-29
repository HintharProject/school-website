"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import InnerNavbar from "../components/InnerNavbar";
import FooterSection from "../components/sections/FooterSection";

// Mock Data
const categories = ["All", "Class of 2023", "Class of 2024", "Science Fair", "Sports", "Arts"];

const yearbookEntries = [
  {
    id: 1,
    name: "Alex Johnson",
    category: "Class of 2023",
    role: "Valedictorian",
    quote: "The future belongs to those who prepare for it today.",
    image: "/images/g5.jpg",
  },
  {
    id: 2,
    name: "Sarah Lin",
    category: "Class of 2024",
    role: "Student Council President",
    quote: "Leadership is an action, not a position.",
    image: "/images/g6.jpg",
  },
  {
    id: 3,
    title: "Regional Science Fair Winners",
    category: "Science Fair",
    description: "Our robotics team took 1st place in the regional competition.",
    image: "/images/g7.jpg",
  },
  {
    id: 4,
    title: "Annual Sports Meet",
    category: "Sports",
    description: "Blue house emerged victorious after a highly competitive weekend.",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLubSOzy0hIVdU-OIXQJq9sleqvpygjkiLIi-0EtMI78CjSIavfUdFQ232oK_gDg10GOB8nKQG2NbaisHwYQQoT1ggV1es1srgGjtPrfZJWj5-dY_b3-Tv6CguByN649rwstTDWY4879DY4xHvdb9r5gpGvAj_yI4lPMZLVcaHX7WXHd0v0C0f0ipNesCgc6IjPko6YL-JaiRUs3XgFvBuVm4q4XsopEHObf9QUzH6X60_epq_u9NizbvlQ",
  },
  {
    id: 5,
    name: "Michael Chang",
    category: "Class of 2023",
    role: "Captain, Debate Team",
    quote: "Words have the power to change the world.",
    image: "/images/graduation.png", // reusing local image for mock
  },
  {
    id: 6,
    title: "Spring Art Exhibition",
    category: "Arts",
    description: "Showcasing the incredible talent of our senior artists.",
    image: "/images/g9.jpg",
  }
];

export default function YearbookGallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEntries = yearbookEntries.filter(entry => {
    const matchesCategory = activeCategory === "All" || entry.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (entry.name && entry.name.toLowerCase().includes(searchLower)) ||
      (entry.title && entry.title.toLowerCase().includes(searchLower)) ||
      (entry.quote && entry.quote.toLowerCase().includes(searchLower)) ||
      (entry.description && entry.description.toLowerCase().includes(searchLower));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col pt-24 bg-background">
      <InnerNavbar />
      
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-8 py-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-academic-gold/10 px-4 py-2 rounded-full mb-6">
            <span className="material-symbols-outlined text-academic-gold text-sm">auto_stories</span>
            <span className="text-sm font-bold text-academic-gold uppercase tracking-widest">Our Legacy</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-oxford-blue dark:text-white mb-6 tracking-tight">
            Yearbook <span className="text-primary dark:text-primary-fixed">Gallery</span>
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant font-light">
            Explore the memories, achievements, and stories of our incredible students and alumni.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-12 space-y-6">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
            </div>
            <input
              type="text"
              placeholder="Search names, events, or quotes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface dark:bg-surface-variant border border-outline-variant/30 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface dark:text-white"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-bold tracking-wider transition-all shadow-sm ${
                  activeCategory === category
                    ? "bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue"
                    : "bg-surface dark:bg-surface-variant text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/5 border border-outline-variant/30"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence>
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-surface dark:bg-surface-variant rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 hover:shadow-xl transition-all group flex flex-col"
              >
                <div className="h-56 relative overflow-hidden">
                  <Image
                    src={entry.image}
                    alt={entry.name || entry.title || "Yearbook photo"}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary dark:text-primary-fixed shadow-sm">
                    {entry.category}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  {entry.name ? (
                    <>
                      <h3 className="text-xl font-bold text-oxford-blue dark:text-white mb-1 group-hover:text-primary transition-colors">{entry.name}</h3>
                      <p className="text-sm font-bold text-academic-gold mb-4 uppercase tracking-wider">{entry.role}</p>
                      <p className="text-on-surface-variant text-sm italic flex-1 border-l-4 border-primary/20 pl-3">&quot;{entry.quote}&quot;</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-oxford-blue dark:text-white mb-3 group-hover:text-primary transition-colors">{entry.title}</h3>
                      <p className="text-on-surface-variant text-sm flex-1">{entry.description}</p>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredEntries.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
            <h3 className="text-xl font-bold text-oxford-blue dark:text-white mb-2">No results found</h3>
            <p className="text-on-surface-variant">We couldn't find any entries matching your current filters.</p>
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
