"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ClubItem,
  getStoredClubs,
  saveStoredClubs,
} from "../adminStore";

const clubImages = [
  { label: "Engineering & Tech", path: "/images/engineering.avif" },
  { label: "Business & Debate", path: "/images/business.jpg" },
  { label: "Science Lab", path: "/images/g2.jpg" },
  { label: "Music & Theatre", path: "/images/g6.jpg" },
  { label: "Sports", path: "/images/g7.jpg" },
  { label: "Photography & Media", path: "/images/g8.jpg" },
];

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filters & Search
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<ClubItem | null>(null);
  const [deletingClub, setDeletingClub] = useState<ClubItem | null>(null);

  // New Club Form
  const [newForm, setNewForm] = useState({
    name: "",
    category: "STEM & Tech" as "STEM & Tech" | "Academic & Debate" | "STEM & Science" | "Creative Arts" | "Sports & Fitness",
    icon: "smart_toy",
    members: "30 Active Members",
    meetingTime: "Wednesdays · 03:45 PM – 05:15 PM",
    leadership: "Student Lead: Lead | Advisor: Faculty Lead",
    description: "",
    image: "/images/engineering.avif",
  });

  useEffect(() => {
    setClubs(getStoredClubs());
    setIsLoaded(true);

    const handleClubsUpdate = () => setClubs(getStoredClubs());
    window.addEventListener("his_clubs_updated", handleClubsUpdate);
    return () => window.removeEventListener("his_clubs_updated", handleClubsUpdate);
  }, []);

  const filteredClubs = clubs.filter((c) => {
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.leadership.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Actions
  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;

    const newRecord: ClubItem = {
      id: Date.now(),
      name: newForm.name,
      category: newForm.category,
      icon: newForm.icon || "groups",
      members: newForm.members,
      meetingTime: newForm.meetingTime,
      leadership: newForm.leadership,
      description: newForm.description,
      image: newForm.image,
    };

    const updated = [newRecord, ...clubs];
    setClubs(updated);
    saveStoredClubs(updated);
    setIsAddModalOpen(false);
    setNewForm({
      name: "",
      category: "STEM & Tech",
      icon: "smart_toy",
      members: "30 Active Members",
      meetingTime: "Wednesdays · 03:45 PM – 05:15 PM",
      leadership: "Student Lead: Lead | Advisor: Faculty Lead",
      description: "",
      image: "/images/engineering.avif",
    });
  };

  const handleSaveEditClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClub) return;

    const updated = clubs.map((c) =>
      c.id === editingClub.id ? editingClub : c
    );
    setClubs(updated);
    saveStoredClubs(updated);
    setEditingClub(null);
  };

  const handleConfirmDeleteClub = () => {
    if (!deletingClub) return;
    const updated = clubs.filter((c) => c.id !== deletingClub.id);
    setClubs(updated);
    saveStoredClubs(updated);
    setDeletingClub(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-3.5 py-1 rounded-full mb-2 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-xs font-bold">groups</span>
            <span className="text-[11px] font-black text-[#0E3B7D] uppercase tracking-wider">
              Student Leadership &amp; Societies
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#09234B] tracking-tight">
            Student Clubs &amp; Societies
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Manage student organizations, faculty advisors, meeting schedules, and society registrations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            <span>Register New Club</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {["All", "STEM & Tech", "Academic & Debate", "Creative Arts", "Sports & Fitness"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeCategory === cat
                  ? "bg-[#0E3B7D] text-white shadow-xs font-black"
                  : "bg-slate-50 text-slate-600 hover:text-[#0E3B7D] hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
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
            placeholder="Search club name or advisor..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoaded && filteredClubs.length > 0 ? (
          filteredClubs.map((club) => (
            <div
              key={club.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-40 relative overflow-hidden">
                  <Image
                    src={club.image}
                    alt={club.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09234B]/95 via-[#09234B]/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#FFC700] text-[#09234B]">
                      {club.category}
                    </span>
                    <h4 className="text-sm font-black mt-1 leading-snug">{club.name}</h4>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <p className="text-xs text-slate-600 line-clamp-2 font-normal leading-relaxed">
                    {club.description}
                  </p>
                  <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#FFC700] text-xs font-bold">schedule</span>
                      <span>{club.meetingTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#0E3B7D] text-xs font-bold">person</span>
                      <span className="truncate">{club.leadership}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-2 flex justify-between items-center border-t border-slate-100">
                <span className="text-[10px] font-bold text-[#0E3B7D] bg-[#E8F0FE] px-2 py-0.5 rounded">
                  {club.members}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingClub({ ...club })}
                    className="p-1.5 text-slate-500 hover:text-[#0E3B7D] hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Club"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => setDeletingClub(club)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Club"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200">
            <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">groups</span>
            <p className="text-slate-500 font-medium">No student clubs match your filter criteria.</p>
          </div>
        )}
      </div>

      {/* 1. ADD CLUB MODAL */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0E3B7D]">
                Student Societies
              </span>
              <h3 className="text-xl font-black text-[#09234B] mt-1">Register New Society</h3>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Club Name *</label>
                <input
                  type="text"
                  required
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="e.g. Artificial Intelligence & Robotics"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Category *</label>
                  <select
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="STEM & Tech">STEM &amp; Tech</option>
                    <option value="Academic & Debate">Academic &amp; Debate</option>
                    <option value="STEM & Science">STEM &amp; Science</option>
                    <option value="Creative Arts">Creative Arts</option>
                    <option value="Sports & Fitness">Sports &amp; Fitness</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Enrolled Count</label>
                  <input
                    type="text"
                    value={newForm.members}
                    onChange={(e) => setNewForm({ ...newForm, members: e.target.value })}
                    placeholder="e.g. 35 Active Members"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Meeting Time Slot *</label>
                <input
                  type="text"
                  required
                  value={newForm.meetingTime}
                  onChange={(e) => setNewForm({ ...newForm, meetingTime: e.target.value })}
                  placeholder="e.g. Wednesdays · 03:45 PM – 05:15 PM"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Student Lead &amp; Faculty Advisor *</label>
                <input
                  type="text"
                  required
                  value={newForm.leadership}
                  onChange={(e) => setNewForm({ ...newForm, leadership: e.target.value })}
                  placeholder="e.g. President: Su Myat | Advisor: Tr. Rachel Evans"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Cover Image</label>
                <div className="flex flex-wrap gap-2">
                  {clubImages.map((img) => (
                    <button
                      type="button"
                      key={img.path}
                      onClick={() => setNewForm({ ...newForm, image: img.path })}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
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
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Club Description *</label>
                <textarea
                  required
                  rows={3}
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  placeholder="Describe the club mission and weekly activities..."
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
                  Register Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT CLUB MODAL */}
      {editingClub && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingClub(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingClub(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="mb-5">
              <h3 className="text-xl font-black text-[#09234B]">Edit Student Club</h3>
            </div>

            <form onSubmit={handleSaveEditClub} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Club Name</label>
                <input
                  type="text"
                  required
                  value={editingClub.name}
                  onChange={(e) => setEditingClub({ ...editingClub, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Meeting Time</label>
                  <input
                    type="text"
                    value={editingClub.meetingTime}
                    onChange={(e) => setEditingClub({ ...editingClub, meetingTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Members</label>
                  <input
                    type="text"
                    value={editingClub.members}
                    onChange={(e) => setEditingClub({ ...editingClub, members: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Leadership &amp; Advisor</label>
                <input
                  type="text"
                  value={editingClub.leadership}
                  onChange={(e) => setEditingClub({ ...editingClub, leadership: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingClub.description}
                  onChange={(e) => setEditingClub({ ...editingClub, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingClub(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DELETE CLUB MODAL */}
      {deletingClub && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingClub(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl font-bold">delete_forever</span>
            </div>
            <h3 className="text-lg font-black text-[#09234B]">Remove Club Society</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to remove <strong>{deletingClub.name}</strong> from the active societies registry?
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={() => setDeletingClub(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteClub}
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
