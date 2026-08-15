"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  YearbookScholar,
  getStoredYearbook,
  saveStoredYearbook,
} from "../adminStore";

const availableImages = [
  { label: "Scholar Male 1", path: "/images/g4.jpg" },
  { label: "Scholar Male 2", path: "/images/g5.jpg" },
  { label: "Scholar Female 1", path: "/images/g6.jpg" },
  { label: "Scholar Male 3", path: "/images/g7.jpg" },
  { label: "Scholar Female 2", path: "/images/g8.jpg" },
  { label: "Scholar Female 3", path: "/images/g9.jpg" },
  { label: "STEM Lab", path: "/images/g2.jpg" },
];

const badgePresets = [
  "World Top Scorer",
  "Top Distinction",
  "Valedictorian",
  "Math Olympiad Silver",
  "Alumni 2026",
  "Alumni 2025",
  "Alumni 2024",
];

export default function YearbookManagementPage() {
  const [entries, setEntries] = useState<YearbookScholar[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingScholar, setEditingScholar] = useState<YearbookScholar | null>(null);
  const [deletingScholar, setDeletingScholar] = useState<YearbookScholar | null>(null);
  const [inspectingScholar, setInspectingScholar] = useState<YearbookScholar | null>(null);

  // New Scholar Form
  const [newForm, setNewForm] = useState({
    name: "",
    category: "Class of 2026" as "Class of 2026" | "Class of 2025" | "Class of 2024",
    role: "Valedictorian & High Distinction",
    destination: "",
    subjects: "",
    quote: "",
    image: "/images/g5.jpg",
    badge: "World Top Scorer",
  });

  useEffect(() => {
    setEntries(getStoredYearbook());
    setIsLoaded(true);

    const handleStorageUpdate = () => {
      setEntries(getStoredYearbook());
    };

    window.addEventListener("his_yearbook_updated", handleStorageUpdate);
    return () => window.removeEventListener("his_yearbook_updated", handleStorageUpdate);
  }, []);

  // Filtered entries
  const filteredEntries = entries.filter((e) => {
    const matchesFilter = activeFilter === "All" || e.category === activeFilter;
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.destination && e.destination.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.subjects && e.subjects.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // KPI calculations
  const totalScholars = entries.length;
  const count2026 = entries.filter((e) => e.category === "Class of 2026").length;
  const count2025 = entries.filter((e) => e.category === "Class of 2025").length;
  const count2024 = entries.filter((e) => e.category === "Class of 2024").length;

  // Actions
  const handleCreateScholar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;

    const newRecord: YearbookScholar = {
      id: Date.now(),
      name: newForm.name,
      category: newForm.category,
      role: newForm.role,
      destination: newForm.destination,
      subjects: newForm.subjects,
      quote: newForm.quote,
      image: newForm.image,
      badge: newForm.badge || undefined,
    };

    const updated = [newRecord, ...entries];
    setEntries(updated);
    saveStoredYearbook(updated);
    setIsAddModalOpen(false);
    setNewForm({
      name: "",
      category: "Class of 2026",
      role: "Valedictorian & High Distinction",
      destination: "",
      subjects: "",
      quote: "",
      image: "/images/g5.jpg",
      badge: "World Top Scorer",
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScholar) return;

    const updated = entries.map((e) =>
      e.id === editingScholar.id ? editingScholar : e
    );
    setEntries(updated);
    saveStoredYearbook(updated);
    setEditingScholar(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingScholar) return;
    const updated = entries.filter((e) => e.id !== deletingScholar.id);
    setEntries(updated);
    saveStoredYearbook(updated);
    if (inspectingScholar?.id === deletingScholar.id) setInspectingScholar(null);
    setDeletingScholar(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-3.5 py-1 rounded-full mb-2 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-xs font-bold">auto_stories</span>
            <span className="text-[11px] font-black text-[#0E3B7D] uppercase tracking-wider">
              Student Legacy &amp; University Matriculation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#09234B] tracking-tight">
            Yearbook &amp; Honors Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Curate graduating scholars, distinction badges, valedictorian quotes, and top university admissions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-sm font-bold">add_circle</span>
            <span>Add Scholar Entry</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-[#09234B]">{totalScholars}</p>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">All Cohorts</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#0E3B7D] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">school</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-[#09234B]">{count2026}</p>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Class of 2026</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">stars</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-[#09234B]">{count2025}</p>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Class of 2025</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">workspace_premium</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-[#09234B]">{count2024}</p>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Class of 2024</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">military_tech</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Cohort Tabs */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {["All", "Class of 2026", "Class of 2025", "Class of 2024"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeFilter === filter
                  ? "bg-[#0E3B7D] text-white shadow-xs font-black"
                  : "bg-slate-50 text-slate-600 hover:text-[#0E3B7D] hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholar or university..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
        </div>
      </div>

      {/* Scholar Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Scholar Profile</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Graduation Cohort</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Role &amp; Academic Honors</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider">University Destination</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoaded && filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-100 ring-2 ring-[#FFC700] shrink-0">
                          <Image src={entry.image} alt={entry.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-[#09234B]">{entry.name}</p>
                          {entry.badge && (
                            <span className="inline-block text-[9px] font-black text-[#09234B] bg-[#FFC700] px-2 py-0.5 rounded uppercase mt-0.5">
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
                    <td className="px-5 py-4">
                      <p className="text-slate-800 font-bold">{entry.role}</p>
                      {entry.subjects && (
                        <p className="text-[11px] text-slate-500 font-medium truncate max-w-xs">{entry.subjects}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium max-w-xs">
                      {entry.destination || "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectingScholar(entry)}
                          className="px-2.5 py-1.5 text-xs font-bold text-[#0E3B7D] hover:bg-[#E8F0FE] rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Preview Profile Card"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">visibility</span>
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => setEditingScholar({ ...entry })}
                          className="p-1.5 text-slate-500 hover:text-[#0E3B7D] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Scholar Entry"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingScholar(entry)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Scholar"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">search_off</span>
                    <p className="text-slate-500 font-medium">No scholar entries match your filter criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
          <span>Showing {filteredEntries.length} of {entries.length} alumni scholars</span>
          <span className="font-semibold text-slate-600">Hinthar Alumni Relations Office</span>
        </div>
      </div>

      {/* 1. INSPECT SCHOLAR CARD MODAL */}
      {inspectingScholar && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectingScholar(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setInspectingScholar(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="flex items-center gap-4 mb-5">
              <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-[#FFC700] shadow-md shrink-0">
                <Image src={inspectingScholar.image} alt={inspectingScholar.name} fill className="object-cover" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#0E3B7D] bg-[#E8F0FE] px-2.5 py-0.5 rounded-md">
                  {inspectingScholar.category}
                </span>
                <h3 className="text-xl font-black text-[#09234B] mt-1">{inspectingScholar.name}</h3>
                {inspectingScholar.badge && (
                  <span className="inline-block text-[10px] font-black text-[#09234B] bg-[#FFC700] px-2 py-0.5 rounded uppercase mt-0.5">
                    {inspectingScholar.badge}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-5">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Role &amp; Honor</span>
                <p className="font-bold text-[#09234B] mt-0.5">{inspectingScholar.role}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">University Matriculation</span>
                <p className="font-semibold text-emerald-700 mt-0.5">{inspectingScholar.destination || "Under Review"}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Academic Achievements / Subjects</span>
                <p className="text-slate-700 mt-0.5 font-medium">{inspectingScholar.subjects}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Scholar Quote</span>
                <p className="italic text-slate-600 mt-0.5 bg-white p-3 rounded-xl border border-slate-200">
                  &ldquo;{inspectingScholar.quote}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingScholar({ ...inspectingScholar });
                  setInspectingScholar(null);
                }}
                className="px-4 py-2 bg-[#0E3B7D] hover:bg-[#164E9A] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
              >
                Edit Scholar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADD SCHOLAR MODAL */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0E3B7D]">
                Honors &amp; Alumni Archive
              </span>
              <h3 className="text-xl font-black text-[#09234B] mt-1">Register Graduating Scholar</h3>
            </div>

            <form onSubmit={handleCreateScholar} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Scholar Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    placeholder="e.g. Aung Kaung Myat"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Graduation Cohort *</label>
                  <select
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="Class of 2026">Class of 2026</option>
                    <option value="Class of 2025">Class of 2025</option>
                    <option value="Class of 2024">Class of 2024</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Role / Distinction Title *</label>
                  <input
                    type="text"
                    required
                    value={newForm.role}
                    onChange={(e) => setNewForm({ ...newForm, role: e.target.value })}
                    placeholder="e.g. Valedictorian & Student Council President"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Distinction Badge</label>
                  <select
                    value={newForm.badge}
                    onChange={(e) => setNewForm({ ...newForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    {badgePresets.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">University Destination</label>
                <input
                  type="text"
                  value={newForm.destination}
                  onChange={(e) => setNewForm({ ...newForm, destination: e.target.value })}
                  placeholder="e.g. Imperial College London (Mechanical Engineering)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Academic Scores / Subjects</label>
                <input
                  type="text"
                  value={newForm.subjects}
                  onChange={(e) => setNewForm({ ...newForm, subjects: e.target.value })}
                  placeholder="e.g. IAL 4 A*s: Pure Math, Further Math, Physics, Chemistry"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              {/* Photo Selector */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Profile Photo</label>
                <div className="flex flex-wrap gap-2">
                  {availableImages.map((img) => (
                    <button
                      type="button"
                      key={img.path}
                      onClick={() => setNewForm({ ...newForm, image: img.path })}
                      className={`relative w-11 h-11 rounded-xl overflow-hidden border-2 transition-all ${
                        newForm.image === img.path
                          ? "border-[#0E3B7D] ring-2 ring-[#0E3B7D]/40 scale-105"
                          : "border-slate-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={img.path} alt={img.label} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Graduation Quote / Testimonial</label>
                <textarea
                  rows={3}
                  value={newForm.quote}
                  onChange={(e) => setNewForm({ ...newForm, quote: e.target.value })}
                  placeholder="Inspiring quote about student life at Hinthar..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all"
                >
                  Save to Yearbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. EDIT SCHOLAR MODAL */}
      {editingScholar && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingScholar(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingScholar(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="mb-5">
              <h3 className="text-xl font-black text-[#09234B]">Edit Scholar Dossier</h3>
              <p className="text-xs text-slate-500">Update scholar accolades and placements.</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Scholar Name</label>
                  <input
                    type="text"
                    required
                    value={editingScholar.name}
                    onChange={(e) => setEditingScholar({ ...editingScholar, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Cohort</label>
                  <select
                    value={editingScholar.category}
                    onChange={(e) => setEditingScholar({ ...editingScholar, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="Class of 2026">Class of 2026</option>
                    <option value="Class of 2025">Class of 2025</option>
                    <option value="Class of 2024">Class of 2024</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Role / Distinction</label>
                  <input
                    type="text"
                    required
                    value={editingScholar.role}
                    onChange={(e) => setEditingScholar({ ...editingScholar, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Badge</label>
                  <select
                    value={editingScholar.badge || ""}
                    onChange={(e) => setEditingScholar({ ...editingScholar, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="">No Badge</option>
                    {badgePresets.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">University Destination</label>
                <input
                  type="text"
                  value={editingScholar.destination}
                  onChange={(e) => setEditingScholar({ ...editingScholar, destination: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Subjects &amp; Results</label>
                <input
                  type="text"
                  value={editingScholar.subjects}
                  onChange={(e) => setEditingScholar({ ...editingScholar, subjects: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Quote</label>
                <textarea
                  rows={3}
                  value={editingScholar.quote}
                  onChange={(e) => setEditingScholar({ ...editingScholar, quote: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingScholar(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DELETE CONFIRMATION MODAL */}
      {deletingScholar && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingScholar(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl font-bold">delete_forever</span>
            </div>
            <h3 className="text-lg font-black text-[#09234B]">Remove Scholar from Yearbook</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to remove <strong>{deletingScholar.name}</strong> ({deletingScholar.category}) from the honors archive?
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={() => setDeletingScholar(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white uppercase tracking-wider rounded-xl shadow-xs transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
