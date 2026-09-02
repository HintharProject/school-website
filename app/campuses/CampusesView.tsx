"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import ChatbotWidget from "../components/ChatbotWidget";
import { CampusRecord, mapCampusRecord } from "../admin/adminStore";
import { getCampuses } from "@/lib/actions/campuses";
import { useLocale } from "@/lib/i18n/useT";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

const getMapUrl = (campus: CampusRecord) =>
  campus.mapUrl ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${campus.name}, ${campus.address}`
  )}`;

function loc(campus: CampusRecord, locale: string, field: "name" | "tagline" | "address") {
  if (locale === "my") {
    const my = campus[`${field}My` as keyof CampusRecord] as string | undefined;
    if (my && my.trim()) return my;
  }
  return campus[field] as string;
}

// Fallback for campuses that were saved with missing local files (e.g. /images/specialisations/*, /images/heroImg.png)
// R2 assets and data: URLs are preserved; anything else pointing to a non-existent public file falls back to g2.
function safeCampusImage(url: string | undefined): string {
  if (!url) return "/images/g2.jpg";
  if (url.startsWith("/api/assets/") || url.startsWith("data:")) return url;
  if (url.includes("specialisations") || url.includes("heroImg")) return "/images/g2.jpg";
  return url;
}

export default function CampusesView({
  initialData,
}: {
  initialData?: Parameters<typeof mapCampusRecord>[0][];
}) {
  const locale = useLocale();
  const [campuses, setCampuses] = useState<CampusRecord[]>(() =>
    (initialData ?? []).map(mapCampusRecord)
  );
  const [selectedCity, setSelectedCity] = useState<"All" | "Yangon" | "Mawlamyine">("All");
  const [activeCampusModal, setActiveCampusModal] = useState<CampusRecord | null>(null);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;

    async function loadCampuses() {
      try {
        setIsLoading(true);
        const data = await getCampuses();
        if (data && data.length > 0) {
          setCampuses(data.map(mapCampusRecord));
        }
      } catch (err) {
        console.warn("Campuses query note:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCampuses();
  }, [initialData]);

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
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F0FE] text-[#0E3B7D] text-xs font-black uppercase tracking-wider mb-4 border border-[#0E3B7D]/20">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">location_city</span>
            <span>Nationwide Campus Network</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#09234B] tracking-tight">
            Our Campuses
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mt-3">
            Providing modern British curriculum education across <strong>3 Yangon branches</strong> (Ywarma Flagship, Shwe Padauk STEM &amp; Shwe Pone Nyet Arts) and our <strong>Mawlamyine Regional Campus</strong>.
          </p>
        </section>

        {/* Filter Tabs & Campus Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* City Selector */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 rounded-2xl bg-white shadow-md border border-slate-200">
              <button
                onClick={() => setSelectedCity("All")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  selectedCity === "All"
                    ? "bg-[#0E3B7D] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#0E3B7D] hover:bg-slate-50"
                }`}
              >
                All Campuses ({campuses.length})
              </button>
              <button
                onClick={() => setSelectedCity("Yangon")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  selectedCity === "Yangon"
                    ? "bg-[#0E3B7D] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#0E3B7D] hover:bg-slate-50"
                }`}
              >
                Yangon ({yangonCount})
              </button>
              <button
                onClick={() => setSelectedCity("Mawlamyine")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
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
              <span aria-hidden="true" className="material-symbols-outlined text-5xl text-slate-300 mb-2">location_city</span>
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
                  {/* Campus Header Image — bypass optimizer for R2 assets (prevents 404 via _next/image) */}
                  <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                    <Image
                      src={safeCampusImage(campus.imageUrl)}
                      alt={loc(campus, locale, "name")}
                      fill
                      unoptimized={isR2AssetUrl(campus.imageUrl)}
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09234B] via-[#09234B]/40 to-transparent" />

                    {/* City Badge */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3.5 py-1 rounded-full bg-[#FFC700] text-[#09234B] text-xs font-black uppercase tracking-wider shadow-md">
                        {campus.city}
                      </span>
                    </div>

                    {/* Name & Tagline Overlay */}
                    <div className="absolute bottom-4 left-5 right-5 text-white">
                      <h2 className="text-2xl font-black tracking-tight drop-shadow-md">
                        {loc(campus, locale, "name")}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#FFC700] font-semibold line-clamp-1">
                        {loc(campus, locale, "tagline")}
                      </p>
                    </div>
                  </div>

                  {/* Campus Body Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Grades Served — grades stay EN per no-translate rule */}
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0E3B7D] bg-blue-50/80 px-3.5 py-2 rounded-xl border border-blue-100">
                        <span aria-hidden="true" className="material-symbols-outlined text-sm">school</span>
                        <span>{campus.gradesServed}</span>
                      </div>

                      {/* Address — bilingual */}
                      <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <span aria-hidden="true" className="material-symbols-outlined text-base text-[#0E3B7D] shrink-0 mt-0.5">
                          pin_drop
                        </span>
                        <span className="font-medium">{loc(campus, locale, "address")}</span>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">call</span>
                          <span className="font-semibold truncate">{campus.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">mail</span>
                          <span className="font-semibold truncate">{campus.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveCampusModal(campus)}
                          className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-base text-[#0E3B7D]">info</span>
                          <span>Details</span>
                        </button>
                        <a
                          href={getMapUrl(campus)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2.5 rounded-xl bg-[#E8F0FE] hover:bg-[#0E3B7D] text-[#0E3B7D] hover:text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-base">map</span>
                          <span>View Map</span>
                        </a>
                      </div>

                      <Link
                        href="/admission"
                        className="px-4 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                      >
                        <span>Apply</span>
                        <span aria-hidden="true" className="material-symbols-outlined text-base">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Modal: Full Campus Facilities */}
        {activeCampusModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-black uppercase text-[#FFC700] tracking-wider bg-[#09234B] px-3 py-1 rounded-full">
                    {activeCampusModal.city} Branch
                  </span>
                  <h3 className="text-2xl font-black text-[#09234B] mt-2">
                    {activeCampusModal.name}
                  </h3>
                  <p className="text-xs text-slate-500">{activeCampusModal.tagline}</p>
                </div>
                <button
                  onClick={() => setActiveCampusModal(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <span aria-hidden="true" className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start justify-between gap-2">
                  <p><strong>Address:</strong> {activeCampusModal.address}</p>
                  <a
                    href={getMapUrl(activeCampusModal)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E8F0FE] hover:bg-[#0E3B7D] text-[#0E3B7D] hover:text-white font-bold text-[11px] transition-colors shrink-0"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-xs">map</span>
                    <span>Open Map</span>
                  </a>
                </div>
                <p><strong>Phone:</strong> {activeCampusModal.phone}</p>
                <p><strong>Email:</strong> {activeCampusModal.email}</p>
                <p><strong>Programs:</strong> {activeCampusModal.gradesServed}</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveCampusModal(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href="/admission"
                  className="px-5 py-2 bg-[#0E3B7D] text-white rounded-xl font-bold text-xs flex items-center gap-1"
                >
                  <span>Apply Now</span>
                  <span aria-hidden="true" className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <FooterSection />
      <ChatbotWidget />
    </>
  );
}
