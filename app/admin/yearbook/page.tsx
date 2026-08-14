"use client";

import { useState } from "react";
import Image from "next/image";

interface YearbookEntry {
  id: number;
  name: string;
  category: "Class of 2026" | "Class of 2025" | "Class of 2024" | "University Placements" | "Competitions";
  role: string;
  destination?: string;
  subjects?: string;
  quote: string;
  image: string;
  badge?: string;
}

const initialEntries: YearbookEntry[] = [
  {
    id: 1,
    name: "Aung Kaung Myat",
    category: "Class of 2026",
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
    role: "Peer Tutor & Head Prefect",
    destination: "Currently at: King's College London (Law & Global Politics)",
    subjects: "IAL: Global Perspectives, Literature, Economics",
    quote: "A true international community in the heart of Yangon where every teacher genuinely cares about student growth.",
    image: "/images/g9.jpg",
    badge: "Alumni 2024",
  },
];

export default function YearbookManagementPage() {
  const [entries, setEntries] = useState<YearbookEntry[]>(initialEntries);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filteredEntries =
    activeFilter === "All"
      ? entries
      : entries.filter((e) => e.category === activeFilter);

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the yearbook archive?`)) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-3 py-1 rounded-full mb-1.5 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-xs font-bold">auto_stories</span>
            <span className="text-[10px] font-black text-[#0E3B7D] uppercase tracking-wider">
              Student Legacy &amp; University Placements
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#09234B] tracking-tight">Yearbook &amp; Honors Registry</h1>
          <p className="text-xs text-slate-500 font-normal">
            Manage graduating scholars, distinction badges, and university matriculation records
          </p>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
          Archived Scholars: <strong>{entries.length}</strong>
        </span>
      </div>

      {/* Cohort Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {["All", "Class of 2026", "Class of 2025", "Class of 2024"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeFilter === filter
                ? "bg-[#0E3B7D] text-white shadow-sm font-black"
                : "bg-white text-slate-600 hover:text-[#0E3B7D] border border-slate-200"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Scholar Profile</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Graduation Cohort</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Role &amp; Distinction</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider">University Destination</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0">
                        <Image src={entry.image} alt={entry.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-[#09234B]">{entry.name}</p>
                        {entry.badge && (
                          <span className="inline-block text-[9px] font-black text-[#09234B] bg-[#FFC700] px-1.5 py-0.2 rounded uppercase">
                            {entry.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 bg-[#E8F0FE] text-[#0E3B7D] text-[10px] font-black rounded-md uppercase tracking-wider">
                      {entry.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-700 font-semibold">{entry.role}</td>
                  <td className="px-5 py-4 text-slate-600 font-medium max-w-xs">{entry.destination || "—"}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleDelete(entry.id, entry.name)}
                      className="px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      <span>Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
