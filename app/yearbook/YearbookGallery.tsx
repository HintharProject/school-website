"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import ChatbotWidget from "../components/ChatbotWidget";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

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

export default function YearbookGallery({
  initialData,
  initialBatches,
}: {
  initialData: RawYearbookRecord[];
  initialBatches: Batch[];
}) {
  const entries = useMemo(() => initialData.map(mapEntry), [initialData]);
  const [activeRegion, setActiveRegion] = useState<"All" | Region>("All");
  const [activeBatch, setActiveBatch] = useState("All");
  const [search, setSearch] = useState("");

  const availableBatches = initialBatches.filter((batch) =>
    activeRegion === "All" || batch.region === activeRegion
  );

  const visibleEntries = entries.filter((entry) => {
    const matchesRegion = activeRegion === "All" || entry.batchRegion === activeRegion;
    const matchesBatch = activeBatch === "All" || entry.batchId === activeBatch;
    const term = search.toLowerCase();
    const matchesSearch = [entry.name, entry.role, entry.destination, entry.subjects, entry.quote]
      .some((value) => value?.toLowerCase().includes(term));
    return matchesRegion && matchesBatch && matchesSearch;
  });

  const groups = (["Yangon", "Mawlamyine"] as Region[]).map((region) => ({
    region,
    batches: initialBatches
      .filter((batch) => batch.region === region)
      .map((batch) => ({
        ...batch,
        entries: visibleEntries.filter((entry) => entry.batchId === batch.id),
      }))
      .filter((batch) => batch.entries.length > 0),
  })).filter((group) => group.batches.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <Navbar />
      <main className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 md:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0E3B7D]/20 bg-[#E8F0FE] px-4 py-1.5">
            <span className="material-symbols-outlined text-sm font-bold text-[#0E3B7D]">auto_stories</span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0E3B7D]">Hinthar Alumni Chronicle</span>
          </div>
          <h1 className="mb-3 text-3xl font-black tracking-tight text-[#09234B] sm:text-4xl md:text-5xl">Our <span className="text-[#0E3B7D]">Yearbook</span></h1>
          <p className="text-sm text-slate-600 md:text-base">Celebrating Hinthar graduates from Yangon and Mawlamyine, organized by their school batch.</p>
        </div>

        <div className="mx-auto mb-10 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap justify-center gap-2">
            {(["All", "Yangon", "Mawlamyine"] as const).map((region) => (
              <button
                key={region}
                onClick={() => { setActiveRegion(region); setActiveBatch("All"); }}
                className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider ${activeRegion === region ? "bg-[#0E3B7D] text-white" : "border border-slate-200 text-slate-600"}`}
              >
                {region === "All" ? "All Regions" : region}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={activeBatch} onChange={(event) => setActiveBatch(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold">
              <option value="All">All Batches</option>
              {availableBatches.map((batch) => <option key={batch.id} value={batch.id}>{batch.region} — {batch.name}</option>)}
            </select>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, university, subjects..." className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs" />
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-300 p-12 text-center">
            <h2 className="font-black text-[#09234B]">No Yearbook profiles found</h2>
            <p className="mt-1 text-xs text-slate-500">Try another region, batch, or search.</p>
          </div>
        ) : groups.map((group) => (
          <section key={group.region} className="mb-12 space-y-8">
            <div className="border-b-2 border-[#FFC700] pb-3">
              <h2 className="text-2xl font-black text-[#09234B]">{group.region}</h2>
              <p className="text-xs text-slate-500">Hinthar International School Yearbook</p>
            </div>
            {group.batches.map((batch) => (
              <div key={batch.id} className="space-y-4">
                <h3 className="text-base font-black uppercase tracking-wider text-[#0E3B7D]">{batch.name}</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {batch.entries.map((entry) => (
                    <article key={entry.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl">
                      <div className="relative h-64 bg-slate-900">
                        <Image src={entry.image} alt={entry.name} fill unoptimized={isR2AssetUrl(entry.image)} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-[#09234B]/85 px-3 py-1 text-[10px] font-black uppercase text-[#FFC700]">{batch.name}</span>
                          {entry.badge && <span className="rounded-full bg-emerald-600/90 px-3 py-1 text-[10px] font-black uppercase text-white">{entry.badge}</span>}
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h4 className="text-xl font-black">{entry.name}</h4>
                          <p className="text-xs font-semibold text-[#FFC700]">{entry.role}</p>
                        </div>
                      </div>
                      <div className="space-y-3 p-6 text-xs">
                        {entry.destination && <p><strong className="text-[#0E3B7D]">University:</strong> {entry.destination}</p>}
                        {entry.subjects && <p><strong className="text-slate-700">Subjects:</strong> {entry.subjects}</p>}
                        <p className="italic leading-relaxed text-slate-600">&ldquo;{entry.quote}&rdquo;</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </main>
      <FooterSection />
      <ChatbotWidget />
    </div>
  );
}
