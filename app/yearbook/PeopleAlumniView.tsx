"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import { isR2AssetUrl } from "@/lib/utils/r2Image";
import { useT, useLocale } from "@/lib/i18n/useT";
import { locField } from "@/lib/i18n/loc";
import type { PublicStaffMember } from "@/lib/actions/staff";

type Region = "Yangon" | "Mawlamyine";

type Batch = {
  id: string;
  name: string;
  region: string;
  sortOrder: number;
  isActive: boolean;
};

type Entry = {
  id: number;
  name: string;
  batchId: string;
  batchName: string;
  batchRegion: Region;
  role: string;
  destination?: string;
  subjects?: string;
  quote: string;
  image: string;
  badge?: string;
};

interface RawYearbookRecord {
  id: number | string;
  name: string;
  batchId?: string | null;
  batch_id?: string | null;
  batchName?: string | null;
  batchRegion?: string | null;
  role: string;
  destination?: string | null;
  subjects?: string | null;
  quote: string;
  image?: string;
  badge?: string | null;
}

function mapEntry(row: RawYearbookRecord): Entry {
  return {
    id: Number(row.id),
    name: row.name,
    batchId: row.batchId ?? row.batch_id ?? "",
    batchName: row.batchName ?? "Yearbook",
    batchRegion: row.batchRegion === "Mawlamyine" ? "Mawlamyine" : "Yangon",
    role: row.role,
    destination: row.destination ?? undefined,
    subjects: row.subjects ?? undefined,
    quote: row.quote,
    image: row.image || "/images/g5.jpg",
    badge: row.badge ?? undefined,
  };
}

const DEPARTMENT_ICONS: Record<string, string> = {
  Leadership: "workspace_premium",
  STEM: "science",
  Languages: "translate",
  Arts: "palette",
  Sports: "sports_tennis",
  Administration: "admin_panel_settings",
  General: "school",
};

export default function PeopleAlumniView({
  initialYearbook,
  initialBatches,
  initialStaff,
  initialTab = "yearbook",
}: {
  initialYearbook: RawYearbookRecord[];
  initialBatches: Batch[];
  initialStaff: PublicStaffMember[];
  initialTab?: "yearbook" | "staff";
}) {
  const t = useT();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"yearbook" | "staff">(
    tabParam === "staff" || initialTab === "staff" ? "staff" : "yearbook"
  );

  useEffect(() => {
    if (tabParam === "staff" || tabParam === "yearbook") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const switchTab = (tab: "yearbook" | "staff") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/yearbook?${params.toString()}`, { scroll: false });
  };

  // ── YEARBOOK STATE ──
  const entries = useMemo(() => initialYearbook.map(mapEntry), [initialYearbook]);
  const [activeRegion, setActiveRegion] = useState<"All" | Region>("All");
  const [activeBatch, setActiveBatch] = useState("All");
  const [yearbookSearch, setYearbookSearch] = useState("");

  const availableBatches = initialBatches.filter((batch) =>
    activeRegion === "All" || batch.region === activeRegion
  );

  const visibleEntries = entries.filter((entry) => {
    const matchesRegion = activeRegion === "All" || entry.batchRegion === activeRegion;
    const matchesBatch = activeBatch === "All" || entry.batchId === activeBatch;
    const query = yearbookSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      entry.name.toLowerCase().includes(query) ||
      entry.role.toLowerCase().includes(query) ||
      (entry.destination && entry.destination.toLowerCase().includes(query)) ||
      (entry.quote && entry.quote.toLowerCase().includes(query));
    return matchesRegion && matchesBatch && matchesSearch;
  });

  // ── STAFF STATE ──
  const [selectedStaff, setSelectedStaff] = useState<PublicStaffMember | null>(null);
  const [activeDepartment, setActiveDepartment] = useState<string>("All");

  const filteredStaff = initialStaff.filter((m) => {
    if (activeDepartment === "All") return true;
    return m.department.toLowerCase() === activeDepartment.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
      <Navbar />

      <main className="flex-1 max-w-[1240px] mx-auto w-full px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-[#FFF8E1] border border-[#FFC700]/40 px-4 py-1.5 rounded-full mb-3.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#FFC700] animate-pulse" />
            <span className="text-[11px] font-black text-[#09234B] uppercase tracking-wider">
              Community &amp; Leadership
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#09234B] tracking-tight leading-tight mb-3">
            People &amp; Alumni
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Celebrating the scholarly achievements of our graduating alumni and honoring the certified Pearson Edexcel educators and leadership who mentor them.
          </p>
        </div>

        {/* Unified Tab Switcher */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="inline-flex p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm gap-1">
            <button
              type="button"
              onClick={() => switchTab("yearbook")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "yearbook"
                  ? "bg-[#0E3B7D] text-white shadow-sm font-black"
                  : "text-slate-600 hover:text-[#0E3B7D] hover:bg-slate-50"
              }`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">auto_stories</span>
              <span>Alumni Yearbook &amp; Honors</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "yearbook" ? "bg-[#FFC700] text-[#09234B]" : "bg-slate-100 text-slate-600"
                }`}
              >
                {entries.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => switchTab("staff")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "staff"
                  ? "bg-[#0E3B7D] text-white shadow-sm font-black"
                  : "text-slate-600 hover:text-[#0E3B7D] hover:bg-slate-50"
              }`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">badge</span>
              <span>Faculty &amp; Leadership Directory</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "staff" ? "bg-[#FFC700] text-[#09234B]" : "bg-slate-100 text-slate-600"
                }`}
              >
                {initialStaff.length}
              </span>
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            TAB 1: ALUMNI YEARBOOK & HONORS
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === "yearbook" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Filters Bar: Region, Batch, Search */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Region:</span>
                {(["All", "Yangon", "Mawlamyine"] as const).map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => {
                      setActiveRegion(reg);
                      setActiveBatch("All");
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      activeRegion === reg
                        ? "bg-[#0E3B7D] text-[#FFC700] font-black"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={activeBatch}
                  onChange={(e) => setActiveBatch(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="All">All Batches</option>
                  {availableBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.region})
                    </option>
                  ))}
                </select>

                <div className="relative min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search scholars..."
                    value={yearbookSearch}
                    onChange={(e) => setYearbookSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none"
                  />
                  <span aria-hidden="true" className="material-symbols-outlined text-sm text-slate-400 absolute left-2.5 top-2">
                    search
                  </span>
                </div>
              </div>
            </div>

            {/* Yearbook Entries Grid */}
            {visibleEntries.length === 0 ? (
              <div className="text-center py-16 px-6 border border-dashed border-slate-300 rounded-3xl max-w-md mx-auto bg-white">
                <span aria-hidden="true" className="material-symbols-outlined text-4xl text-slate-300">school</span>
                <h3 className="text-base font-black text-[#09234B] mt-3">No Alumni Entries Found</h3>
                <p className="text-xs text-slate-500 mt-1">Try adjusting the region or batch selection filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleEntries.map((scholar) => (
                  <div
                    key={scholar.id}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-60 w-full bg-slate-900 overflow-hidden">
                        <Image
                          src={scholar.image}
                          alt={scholar.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#09234B]/85 text-[#FFC700] backdrop-blur-sm">
                            {scholar.batchRegion}
                          </span>
                          {scholar.badge && (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600/90 text-white backdrop-blur-sm">
                              {scholar.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-5 space-y-2">
                        <h3 className="text-base font-black text-[#09234B] tracking-tight">{scholar.name}</h3>
                        <p className="text-[11px] font-bold text-[#0E3B7D] uppercase tracking-wider">
                          {scholar.role}
                        </p>

                        {scholar.destination && (
                          <p className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5">
                            <span aria-hidden="true" className="material-symbols-outlined text-xs">flight_takeoff</span>
                            <span className="truncate">{scholar.destination}</span>
                          </p>
                        )}

                        <p className="text-xs text-slate-600 italic leading-relaxed pt-2 border-t border-slate-100">
                          &ldquo;{scholar.quote}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5">
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{scholar.batchName}</span>
                        <span className="font-semibold text-[#0E3B7D]">{scholar.subjects || "Pearson IAL"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 2: FACULTY & LEADERSHIP DIRECTORY
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === "staff" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Department Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {["All", "Leadership", "STEM", "Languages", "Arts", "Sports", "Administration"].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActiveDepartment(dept)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeDepartment.toLowerCase() === dept.toLowerCase()
                      ? "bg-[#FFC700] text-[#09234B] shadow-sm font-black"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-[#0E3B7D]/40"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Staff Grid */}
            {filteredStaff.length === 0 ? (
              <div className="text-center py-16 px-6 border border-dashed border-slate-300 rounded-3xl max-w-md mx-auto bg-white">
                <span aria-hidden="true" className="material-symbols-outlined text-4xl text-slate-300">badge</span>
                <h3 className="text-base font-black text-[#09234B] mt-3">No Faculty Members Found</h3>
                <p className="text-xs text-slate-500 mt-1">Try selecting a different academic department.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredStaff.map((member) => {
                  const role = locField(locale, member.role, member.roleMy);
                  const department = locField(locale, member.department, member.departmentMy);

                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setSelectedStaff(member)}
                      className="group text-left bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-56 bg-slate-100 overflow-hidden">
                          {member.image ? (
                            <Image
                              src={member.image}
                              alt={member.name}
                              fill
                              unoptimized={isR2AssetUrl(member.image)}
                              className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 640px) 100vw, 300px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#0E3B7D]/90 to-[#164E9A] flex items-center justify-center">
                              <span aria-hidden="true" className="material-symbols-outlined text-white/80 text-6xl">
                                {DEPARTMENT_ICONS[member.department] || "person"}
                              </span>
                            </div>
                          )}
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[9px] font-black uppercase tracking-wider text-[#0E3B7D] shadow-xs">
                            {department}
                          </span>
                        </div>

                        <div className="p-5 space-y-1">
                          <h3 className="text-sm font-black text-[#09234B] leading-snug group-hover:text-[#0E3B7D] transition-colors">
                            {member.name}
                          </h3>
                          <p className="text-[11px] font-bold text-[#0E3B7D] uppercase tracking-wider">{role}</p>
                          {member.qualifications && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 pt-1 font-medium">
                              {locField(locale, member.qualifications, member.qualificationsMy)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-5 pt-0">
                        <span className="text-[11px] font-black text-[#0E3B7D] inline-flex items-center gap-1 group-hover:underline">
                          <span>View Profile &amp; Bio</span>
                          <span aria-hidden="true" className="material-symbols-outlined text-xs">arrow_forward</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            STAFF MEMBER BIO MODAL
            ════════════════════════════════════════════════════════════════ */}
        {selectedStaff && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    {selectedStaff.image ? (
                      <Image
                        src={selectedStaff.image}
                        alt={selectedStaff.name}
                        fill
                        unoptimized={isR2AssetUrl(selectedStaff.image)}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#0E3B7D] flex items-center justify-center text-white">
                        <span aria-hidden="true" className="material-symbols-outlined text-2xl">
                          {DEPARTMENT_ICONS[selectedStaff.department] || "person"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#09234B]">{selectedStaff.name}</h3>
                    <p className="text-xs font-bold text-[#0E3B7D] uppercase tracking-wider">
                      {locField(locale, selectedStaff.role, selectedStaff.roleMy)}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {locField(locale, selectedStaff.department, selectedStaff.departmentMy)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStaff(null)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <span aria-hidden="true" className="material-symbols-outlined">close</span>
                </button>
              </div>

              {selectedStaff.qualifications && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="block font-bold text-slate-400 uppercase text-[10px]">Academic Credentials</span>
                  <p className="text-slate-700 font-semibold mt-0.5">
                    {locField(locale, selectedStaff.qualifications, selectedStaff.qualificationsMy)}
                  </p>
                </div>
              )}

              {selectedStaff.bio && (
                <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
                  <span className="block font-bold text-[#09234B] uppercase text-[10px] tracking-wider">
                    Biographical Background
                  </span>
                  <p>{locField(locale, selectedStaff.bio, selectedStaff.bioMy)}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedStaff(null)}
                  className="px-6 py-2.5 bg-[#0E3B7D] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#164E9A] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
