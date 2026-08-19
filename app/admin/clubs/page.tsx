"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ClubItem,
  getStoredClubs,
  saveStoredClubs,
  getActiveAdminRole,
  UserProfile,
  FALLBACK_GUEST_USER,
  HIERARCHICAL_CAMPUS_OPTIONS,
  formatCampusBadge,
} from "../adminStore";
import ImageUploadPicker from "@/app/components/admin/ImageUploadPicker";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(FALLBACK_GUEST_USER);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [campusFilter, setCampusFilter] = useState<string>("All");
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
    campus: "both-campuses",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setCurrentUser(getActiveAdminRole());

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("clubs")
          .select("*")
          .order("id", { ascending: false });

        if (!error && data) {
          const mapped: ClubItem[] = data.map((d: any) => ({
            id: Number(d.id),
            name: d.name,
            category: d.category,
            icon: d.icon || "groups",
            members: d.members || "25+ Members",
            meetingTime: d.meeting_time || "",
            leadership: d.leadership || "",
            description: d.description || "",
            image: d.image || "/images/engineering.avif",
            campus: d.campus || "both-campuses",
            status: d.status || "published",
            submittedBy: d.submitted_by,
          }));
          setClubs(mapped);
          saveStoredClubs(mapped);
          setIsLoaded(true);
          return;
        }
      } catch (err) {
        console.warn("Supabase clubs fetch failed, falling back to local store", err);
      }
    }

    setClubs(getStoredClubs());
    setIsLoaded(true);
  };

  useEffect(() => {
    loadData();

    const handleClubsUpdate = () => setClubs(getStoredClubs());
    const handleRoleUpdate = () => setCurrentUser(getActiveAdminRole());

    window.addEventListener("his_clubs_updated", handleClubsUpdate);
    window.addEventListener("his_role_updated", handleRoleUpdate);

    return () => {
      window.removeEventListener("his_clubs_updated", handleClubsUpdate);
      window.removeEventListener("his_role_updated", handleRoleUpdate);
    };
  }, []);

  const isStudent = (currentUser?.role ?? "") === "student";

  const filteredClubs = clubs.filter((c) => {
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    const campusInfo = formatCampusBadge(c.campus);
    const matchesCampus =
      campusFilter === "All" ||
      campusInfo.city === campusFilter ||
      (campusFilter === "Both" && campusInfo.city === "Both") ||
      (campusFilter === "Yangon" && (campusInfo.city === "Yangon" || campusInfo.city === "Both")) ||
      (campusFilter === "Mawlamyine" && (campusInfo.city === "Mawlamyine" || campusInfo.city === "Both"));

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(searchLower) ||
      c.description.toLowerCase().includes(searchLower) ||
      c.leadership.toLowerCase().includes(searchLower);

    return matchesCategory && matchesCampus && matchesSearch;
  });

  // Actions
  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;

    const newRecord: ClubItem = {
      id: Date.now(),
      name: newForm.name.trim(),
      category: newForm.category,
      icon: newForm.icon || "groups",
      members: newForm.members,
      meetingTime: newForm.meetingTime,
      leadership: newForm.leadership,
      description: newForm.description,
      image: newForm.image || "/images/engineering.avif",
      campus: newForm.campus || "both-campuses",
      status: isStudent ? "pending_review" : "published",
      submittedBy: isStudent ? currentUser.id : undefined,
      submittedByName: isStudent ? currentUser.fullName : undefined,
    };

    const updated = [newRecord, ...clubs];
    setClubs(updated);
    saveStoredClubs(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from("clubs").insert([
          {
            name: newRecord.name,
            category: newRecord.category,
            icon: newRecord.icon,
            members: newRecord.members,
            meeting_time: newRecord.meetingTime,
            leadership: newRecord.leadership,
            description: newRecord.description,
            image: newRecord.image,
            campus: newRecord.campus,
            status: newRecord.status,
            submitted_by: isStudent ? currentUser.id : null,
            is_active: true,
          },
        ]);
      } catch (err) {
        console.warn("Supabase insert error:", err);
      }
    }

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
      campus: "both-campuses",
    });

    if (isStudent) {
      showToast("Club proposal submitted for Faculty review!");
    } else {
      showToast(`Club "${newRecord.name}" created successfully.`);
    }
  };

  const handleSaveEditClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClub) return;

    const updated = clubs.map((c) =>
      c.id === editingClub.id ? editingClub : c
    );
    setClubs(updated);
    saveStoredClubs(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from("clubs")
          .update({
            name: editingClub.name,
            category: editingClub.category,
            icon: editingClub.icon,
            members: editingClub.members,
            meeting_time: editingClub.meetingTime,
            leadership: editingClub.leadership,
            description: editingClub.description,
            image: editingClub.image,
            campus: editingClub.campus,
          })
          .eq("id", editingClub.id);
      } catch (err) {
        console.warn("Supabase club update error:", err);
      }
    }

    setEditingClub(null);
    showToast("Club details updated.");
  };

  const handleConfirmDeleteClub = async () => {
    if (!deletingClub) return;
    if (isStudent) {
      alert("Students cannot delete clubs.");
      setDeletingClub(null);
      return;
    }

    const updated = clubs.filter((c) => c.id !== deletingClub.id);
    setClubs(updated);
    saveStoredClubs(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from("clubs").delete().eq("id", deletingClub.id);
      } catch (err) {
        console.warn("Supabase club delete error:", err);
      }
    }

    setDeletingClub(null);
    showToast("Club removed.");
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0E3B7D] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FFC700] animate-bounce">
          <span className="material-symbols-outlined text-[#FFC700]">check_circle</span>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-3.5 py-1 rounded-full mb-2 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-xs font-bold">groups</span>
            <span className="text-[11px] font-black text-[#0E3B7D] uppercase tracking-wider">
              {isStudent ? "Student Societies Contributor" : "Student Leadership & Societies Hub"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#09234B] tracking-tight">
            Student Clubs &amp; Societies
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            {isStudent
              ? "Manage society activity announcements, propose new inter-school initiatives, and upload banners (Yangon, Mawlamyine, or Both)."
              : "Manage student organizations, faculty advisors, meeting schedules, and society registrations across all campus branches."}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-base font-bold">add_circle</span>
          <span>{isStudent ? "Propose Society Activity" : "Register New Club"}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-slate-400 mr-1 self-center">Category:</span>
            {["All", "STEM & Tech", "Academic & Debate", "Creative Arts", "Sports & Fitness"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-[#0E3B7D] text-white shadow-xs font-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search clubs, advisors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-xs text-slate-900"
            />
          </div>
        </div>

        {/* Campus Location Filter Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-[#0E3B7D]">pin_drop</span>
            <span>Campus Scope:</span>
          </span>
          {[
            { id: "All", label: "All Campuses" },
            { id: "Yangon", label: "Yangon Campuses" },
            { id: "Mawlamyine", label: "Mawlamyine Campus" },
            { id: "Both", label: "Both (All-School)" },
          ].map((loc) => (
            <button
              key={loc.id}
              onClick={() => setCampusFilter(loc.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                campusFilter === loc.id
                  ? "bg-[#FFC700] text-[#09234B] font-black shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty Notice if Cleaned */}
      {filteredClubs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">groups</span>
          <h3 className="text-base font-bold text-[#09234B]">No entries published yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Click &quot;Register New Club&quot; to add student societies, robotics teams, and sports clubs.
          </p>
        </div>
      )}

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map((club) => {
          const campusBadge = formatCampusBadge(club.campus);

          return (
            <div
              key={club.id}
              className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                {/* Card Image */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <Image
                    src={club.image || "/images/engineering.avif"}
                    alt={club.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09234B] via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFC700] text-[#09234B] text-[10px] font-black uppercase">
                      {club.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${campusBadge.badgeClass}`}
                    >
                      {campusBadge.label}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="font-black text-base drop-shadow-xs">{club.name}</h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0E3B7D] bg-blue-50/70 p-2 rounded-xl border border-blue-100">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span>{club.meetingTime}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="material-symbols-outlined text-sm text-[#0E3B7D]">supervisor_account</span>
                    <span className="font-semibold">{club.leadership}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="material-symbols-outlined text-sm text-[#0E3B7D]">groups</span>
                    <span>{club.members}</span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {club.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <a
                  href="/clubs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#0E3B7D] hover:underline flex items-center gap-1"
                >
                  <span>Public Page</span>
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingClub({ ...club })}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0E3B7D] rounded-xl font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Edit</span>
                  </button>
                  {!isStudent && (
                    <button
                      onClick={() => setDeletingClub(club)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add Club Modal ────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <h2 className="text-lg font-black text-[#0E3B7D]">
                {isStudent ? "Propose Society Activity / Event" : "Register New Student Club"}
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Club / Society Name</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence & Machine Learning Society"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newForm.category}
                    onChange={(e) =>
                      setNewForm({
                        ...newForm,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  >
                    <option value="STEM & Tech">STEM & Tech</option>
                    <option value="Academic & Debate">Academic & Debate</option>
                    <option value="Creative Arts">Creative Arts</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Active Members Count</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    placeholder="e.g. 35"
                    value={parseInt(newForm.members) || 30}
                    onChange={(e) => setNewForm({ ...newForm, members: `${e.target.value || 0} Active Members` })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                    required
                  />
                </div>
              </div>

              {/* Campus Scope */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Campus Scope</label>
                <select
                  value={newForm.campus}
                  onChange={(e) => setNewForm({ ...newForm, campus: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                >
                  {HIERARCHICAL_CAMPUS_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Meeting Time &amp; Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Tuesdays &amp; Thursdays · 03:45 PM – 05:15 PM"
                  value={newForm.meetingTime}
                  onChange={(e) => setNewForm({ ...newForm, meetingTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Leadership &amp; Advisor</label>
                <input
                  type="text"
                  placeholder="e.g. President: Lin Myat | Advisor: Tr. Min Zaw"
                  value={newForm.leadership}
                  onChange={(e) => setNewForm({ ...newForm, leadership: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description &amp; Objectives</label>
                <textarea
                  rows={3}
                  placeholder="Describe activities, olympiad competitions, and goals..."
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              {/* Club Banner Upload */}
              <div>
                <ImageUploadPicker
                  label="Club Cover Banner / Activity Photo"
                  value={newForm.image}
                  onChange={(url) => setNewForm({ ...newForm, image: url })}
                  folder="clubs"
                  aspectRatio="banner"
                  defaultPresetsCategory="club"
                  helperText="Upload banner image or choose from school society presets."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black"
                >
                  {isStudent ? "Submit Proposal" : "Register Club"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Club Modal ───────────────────────────────────────── */}
      {editingClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <h2 className="text-lg font-black text-[#0E3B7D]">Edit Club Details</h2>
              <button onClick={() => setEditingClub(null)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditClub} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Club Name</label>
                <input
                  type="text"
                  value={editingClub.name}
                  onChange={(e) => setEditingClub({ ...editingClub, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editingClub.category}
                    onChange={(e) => setEditingClub({ ...editingClub, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  >
                    <option value="STEM & Tech">STEM & Tech</option>
                    <option value="Academic & Debate">Academic & Debate</option>
                    <option value="Creative Arts">Creative Arts</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Members Count</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={parseInt(editingClub.members) || 25}
                    onChange={(e) => setEditingClub({ ...editingClub, members: `${e.target.value || 0} Members` })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Campus Scope</label>
                <select
                  value={editingClub.campus || "both-campuses"}
                  onChange={(e) => setEditingClub({ ...editingClub, campus: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                >
                  {HIERARCHICAL_CAMPUS_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Meeting Time</label>
                <input
                  type="text"
                  value={editingClub.meetingTime}
                  onChange={(e) => setEditingClub({ ...editingClub, meetingTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Leadership</label>
                <input
                  type="text"
                  value={editingClub.leadership}
                  onChange={(e) => setEditingClub({ ...editingClub, leadership: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingClub.description}
                  onChange={(e) => setEditingClub({ ...editingClub, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              {/* Club Banner Upload */}
              <div>
                <ImageUploadPicker
                  label="Club Cover Banner / Activity Photo"
                  value={editingClub.image || ""}
                  onChange={(url) => setEditingClub({ ...editingClub, image: url })}
                  folder="clubs"
                  aspectRatio="banner"
                  defaultPresetsCategory="club"
                  helperText="Upload banner image or choose from school society presets."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingClub(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ─────────────────────────────────────────── */}
      {deletingClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">Remove Club</h3>
            <p className="text-xs text-slate-600 mt-1 mb-5">
              Are you sure you want to remove <strong>{deletingClub.name}</strong>?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeletingClub(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteClub}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 font-black text-xs text-white"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
