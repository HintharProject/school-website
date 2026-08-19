"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import ChatbotWidget from "../components/ChatbotWidget";
import { CampusRecord } from "@/lib/supabase/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function CampusesView() {
  const [campuses, setCampuses] = useState<CampusRecord[]>([]);
  const [selectedCity, setSelectedCity] = useState<"All" | "Yangon" | "Mawlamyine">("All");
  const [activeCampusModal, setActiveCampusModal] = useState<CampusRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCampuses() {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("campuses")
          .select("id, name, city, tagline, address, phone, email, office_hours, grades_served, facilities, image_url, is_active")
          .eq("is_active", true)
          .order("city", { ascending: false });

        if (!error && data) {
          setCampuses(data as CampusRecord[]);
        }
      } catch (err) {
        console.warn("Supabase campuses query error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCampuses();
  }, []);

  const filteredCampuses = campuses.filter((campus) => {
    if (selectedCity === "All") return true;
    return campus.city === selectedCity;
  });

  const yangonCount = campuses.filter((c) => c.city === "Yangon").length;
  const mawlamyineCount = campuses.filter((c) => c.city === "Mawlamyine").length;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8FAFC] pt-24 md:pt-28 pb-20">

        {/* ── Filter Tabs & Campus Grid ──────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* City Selector */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 rounded-2xl bg-white shadow-md border border-slate-200">
              <button
                onClick={() => setSelectedCity("All")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 ${
                  selectedCity === "All"
                    ? "bg-[#0E3B7D] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#0E3B7D] hover:bg-slate-50"
                }`}
              >
                All Campuses ({campuses.length})
              </button>
              <button
                onClick={() => setSelectedCity("Yangon")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 ${
                  selectedCity === "Yangon"
                    ? "bg-[#0E3B7D] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#0E3B7D] hover:bg-slate-50"
                }`}
              >
                Yangon ({yangonCount})
              </button>
              <button
                onClick={() => setSelectedCity("Mawlamyine")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 ${
                  selectedCity === "Mawlamyine"
                    ? "bg-[#0E3B7D] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#0E3B7D] hover:bg-slate-50"
                }`}
              >
                Mawlamyine ({mawlamyineCount})
              </button>
            </div>
          </div>

          {/* Grid of Campuses */}
          {filteredCampuses.length === 0 && !isLoading && (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs max-w-xl mx-auto">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">location_city</span>
              <h3 className="text-base font-bold text-[#09234B]">No campuses listed</h3>
              <p className="text-xs text-slate-500 mt-1">
                Active campus centers configured in the school database will appear here.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredCampuses.map((campus) => (
                <motion.div
                  key={campus.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col group"
                >
                  {/* Campus Header Image */}
                  <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                    <Image
                      src={campus.image_url || "/images/heroImg.png"}
                      alt={campus.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09234B] via-[#09234B]/40 to-transparent" />

                    {/* City Badge & Grade served */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3.5 py-1 rounded-full bg-[#FFC700] text-[#09234B] text-xs font-black uppercase tracking-wider shadow-md">
                        {campus.city}
                      </span>
                    </div>

                    {/* Name & Tagline Overlay */}
                    <div className="absolute bottom-4 left-5 right-5 text-white">
                      <h2 className="text-2xl font-black tracking-tight drop-shadow-md">
                        {campus.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#FFC700] font-semibold line-clamp-1">
                        {campus.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Campus Body Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Grades Served */}
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0E3B7D] bg-blue-50/80 px-3.5 py-2 rounded-xl border border-blue-100">
                        <span className="material-symbols-outlined text-sm">school</span>
                        <span>{campus.grades_served}</span>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <span className="material-symbols-outlined text-base text-[#0E3B7D] shrink-0 mt-0.5">
                          pin_drop
                        </span>
                        <span className="font-medium">{campus.address}</span>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-[#0E3B7D]">call</span>
                          <span className="font-semibold truncate">{campus.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-[#0E3B7D]">mail</span>
                          <span className="font-semibold truncate">{campus.email}</span>
                        </div>
                      </div>

                      {/* Key Facilities Badges */}
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                          Campus Highlights & Facilities
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {campus.facilities.map((fac, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"
                            >
                              {fac}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                      <Link
                        href="/admission"
                        className="flex-1 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-extrabold text-xs uppercase tracking-wider py-3 px-4 rounded-xl text-center shadow-md active:scale-95 transition-all"
                      >
                        Apply for this Campus
                      </Link>
                      <button
                        onClick={() => setActiveCampusModal(campus)}
                        className="bg-slate-100 hover:bg-slate-200 text-[#0E3B7D] font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl border border-slate-200 transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Campus Detail Modal ─────────────────────────────────── */}
        <AnimatePresence>
          {activeCampusModal && (
            <div
              className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#09234B]/70 backdrop-blur-sm"
              onClick={() => setActiveCampusModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden"
              >
                <button
                  onClick={() => setActiveCampusModal(null)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#FFC700] text-[#09234B] text-xs font-black uppercase">
                    {activeCampusModal.city}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {activeCampusModal.office_hours}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-[#0E3B7D]">
                  {activeCampusModal.name}
                </h3>
                <p className="text-sm font-semibold text-slate-600 mt-1 mb-5">
                  {activeCampusModal.tagline}
                </p>

                <div className="space-y-3.5 text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0E3B7D] shrink-0">pin_drop</span>
                    <div>
                      <span className="font-bold block text-xs uppercase text-slate-400">Address</span>
                      <span>{activeCampusModal.address}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0E3B7D] shrink-0">call</span>
                    <div>
                      <span className="font-bold block text-xs uppercase text-slate-400">Phone Hotline</span>
                      <span>{activeCampusModal.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0E3B7D] shrink-0">mail</span>
                    <div>
                      <span className="font-bold block text-xs uppercase text-slate-400">Admissions Email</span>
                      <span>{activeCampusModal.email}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0E3B7D] shrink-0">schedule</span>
                    <div>
                      <span className="font-bold block text-xs uppercase text-slate-400">Visiting Hours</span>
                      <span>{activeCampusModal.office_hours}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="font-bold text-xs uppercase text-slate-400 mb-2">
                    Academic Continuum & Special Features
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                    {activeCampusModal.facilities.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-200 flex gap-3">
                  <Link
                    href="/admission"
                    className="flex-1 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black text-xs uppercase tracking-wider py-3 rounded-xl text-center shadow-md transition-all"
                  >
                    Schedule Campus Tour & Apply
                  </Link>
                  <button
                    onClick={() => setActiveCampusModal(null)}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
      <FooterSection />
      <ChatbotWidget />
    </>
  );
}
