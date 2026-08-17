"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  YearbookScholar,
  getStoredYearbook,
  saveStoredYearbook,
  getActiveAdminRole,
  UserProfile,
  INITIAL_USER_ACCOUNTS,
  HIERARCHICAL_CAMPUS_OPTIONS,
  formatCampusBadge,
} from "../adminStore";
import ImageUploadPicker from "@/app/components/admin/ImageUploadPicker";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

const badgePresets = [
  "World Top Scorer",
  "Top Distinction",
  "Valedictorian",
  "Math Olympiad Silver",
  "Alumni 2026",
  "Alumni 2025",
  "Alumni 2024",
  "Pearson World Distinction",
  "ASEAN Scholar Candidate",
  "Global Excellence Award",
  "Dean's Honour Roll",
];

export default function YearbookManagementPage() {
  const [entries, setEntries] = useState<YearbookScholar[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER_ACCOUNTS[0]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<"published" | "pending_review" | "my_submissions">("published");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [campusFilter, setCampusFilter] = useState<string>("All");
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
    role: "Senior Scholar & High Distinction",
    destination: "",
    subjects: "",
    quote: "",
    image: "/images/g5.jpg",
    badge: "World Top Scorer",
    campus: "both-campuses",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    const active = getActiveAdminRole();
    setCurrentUser(active);
    if (active.role === "student") {
      setActiveTab("my_submissions");
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("yearbook_alumni")
          .select("*")
          .order("id", { ascending: false });

        if (!error && data) {
          const mapped: YearbookScholar[] = data.map((d: any) => ({
            id: Number(d.id),
            name: d.name,
            category: d.category,
            role: d.role,
            destination: d.destination,
            subjects: d.subjects,
            quote: d.quote,
            image: d.image || "/images/g5.jpg",
            badge: d.badge,
            campus: d.campus || "both-campuses",
            status: d.status || "published",
            submittedBy: d.submitted_by,
            reviewerNotes: d.reviewer_notes,
          }));
          setEntries(mapped);
          saveStoredYearbook(mapped);
          setIsLoaded(true);
          return;
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to local store", err);
      }
    }

    const loaded = getStoredYearbook().map((item) => ({
      ...item,
      status: item.status || "published",
      campus: item.campus || "both-campuses",
    }));
    setEntries(loaded);
    setIsLoaded(true);
  };

  useEffect(() => {
    loadData();

    const handleStorageUpdate = () => {
      setEntries(getStoredYearbook());
    };
    const handleRoleUpdate = () => {
      const u = getActiveAdminRole();
      setCurrentUser(u);
      if (u.role === "student") {
        setActiveTab("my_submissions");
      }
    };

    window.addEventListener("his_yearbook_updated", handleStorageUpdate);
    window.addEventListener("his_role_updated", handleRoleUpdate);

    return () => {
      window.removeEventListener("his_yearbook_updated", handleStorageUpdate);
      window.removeEventListener("his_role_updated", handleRoleUpdate);
    };
  }, []);

  const isStudent = currentUser.role === "student";
  const isStaffOrPrincipal = currentUser.role === "principal" || currentUser.role === "staff_admin";

  // Pending Count for Staff/Principal
  const pendingReviewCount = entries.filter((e) => e.status === "pending_review").length;

  // Filtered entries
  const filteredEntries = entries.filter((e) => {
    const campusInfo = formatCampusBadge(e.campus);
    const matchesCampus =
      campusFilter === "All" ||
      campusInfo.city === campusFilter ||
      (campusFilter === "Both" && campusInfo.city === "Both") ||
      (campusFilter === "Yangon" && (campusInfo.city === "Yangon" || campusInfo.city === "Both")) ||
      (campusFilter === "Mawlamyine" && (campusInfo.city === "Mawlamyine" || campusInfo.city === "Both"));

    if (isStudent || activeTab === "my_submissions") {
      const matchesAuthor = e.submittedBy === currentUser.id || !e.submittedBy;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        e.name.toLowerCase().includes(searchLower) ||
        e.role.toLowerCase().includes(searchLower) ||
        (e.destination && e.destination.toLowerCase().includes(searchLower));
      return matchesAuthor && matchesSearch && matchesCampus;
    }

    if (activeTab === "pending_review") {
      const isPending = e.status === "pending_review";
      const matchesCategory = categoryFilter === "All" || e.category === categoryFilter;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        e.name.toLowerCase().includes(searchLower) ||
        e.role.toLowerCase().includes(searchLower) ||
        (e.destination && e.destination.toLowerCase().includes(searchLower));
      return isPending && matchesCategory && matchesSearch && matchesCampus;
    }

    // Default 'published' tab
    const isPublished = e.status === "published" || !e.status;
    const matchesCategory = categoryFilter === "All" || e.category === categoryFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      e.name.toLowerCase().includes(searchLower) ||
      e.role.toLowerCase().includes(searchLower) ||
      (e.destination && e.destination.toLowerCase().includes(searchLower));
    return isPublished && matchesCategory && matchesSearch && matchesCampus;
  });

  // Actions
  const handleCreateScholar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;

    const initialStatus = isStudent ? "pending_review" : "published";

    const newRecord: YearbookScholar = {
      id: Date.now(),
      name: newForm.name.trim(),
      category: newForm.category,
      role: newForm.role,
      destination: newForm.destination,
      subjects: newForm.subjects,
      quote: newForm.quote,
      image: newForm.image || "/images/g5.jpg",
      badge: newForm.badge || undefined,
      campus: newForm.campus || "both-campuses",
      status: initialStatus,
      submittedBy: isStudent ? currentUser.id : undefined,
      submittedByName: isStudent ? currentUser.fullName : undefined,
    };

    const updated = [newRecord, ...entries];
    setEntries(updated);
    saveStoredYearbook(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from("yearbook_alumni").insert([
          {
            name: newRecord.name,
            category: newRecord.category,
            role: newRecord.role,
            destination: newRecord.destination,
            subjects: newRecord.subjects,
            quote: newRecord.quote,
            image: newRecord.image,
            badge: newRecord.badge,
            campus: newRecord.campus,
            status: newRecord.status,
            submitted_by: isStudent ? currentUser.id : null,
          },
        ]);
      } catch (err) {
        console.warn("Supabase insert error:", err);
      }
    }

    setIsAddModalOpen(false);
    setNewForm({
      name: "",
      category: "Class of 2026",
      role: "Senior Scholar & High Distinction",
      destination: "",
      subjects: "",
      quote: "",
      image: "/images/g5.jpg",
      badge: "World Top Scorer",
      campus: "both-campuses",
    });

    if (isStudent) {
      showToast("Profile submitted! Sent to Staff Review Queue for approval.");
    } else {
      showToast(`Scholar "${newRecord.name}" published directly to Yearbook.`);
    }
  };

  const handleApproveEntry = async (id: number) => {
    const updated = entries.map((e) =>
      e.id === id ? { ...e, status: "published" as const } : e
    );
    setEntries(updated);
    saveStoredYearbook(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from("yearbook_alumni")
          .update({ status: "published" })
          .eq("id", id);
      } catch (err) {
        console.warn("Supabase update error:", err);
      }
    }

    showToast("Profile approved and published to public Yearbook!");
  };

  const handleRejectEntry = async (id: number) => {
    const updated = entries.map((e) =>
      e.id === id ? { ...e, status: "archived" as const } : e
    );
    setEntries(updated);
    saveStoredYearbook(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from("yearbook_alumni")
          .update({ status: "archived" })
          .eq("id", id);
      } catch (err) {
        console.warn("Supabase archive error:", err);
      }
    }

    showToast("Submission returned / archived.");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScholar) return;

    const updated = entries.map((e) =>
      e.id === editingScholar.id ? editingScholar : e
    );
    setEntries(updated);
    saveStoredYearbook(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from("yearbook_alumni")
          .update({
            name: editingScholar.name,
            category: editingScholar.category,
            role: editingScholar.role,
            destination: editingScholar.destination,
            subjects: editingScholar.subjects,
            quote: editingScholar.quote,
            image: editingScholar.image,
            badge: editingScholar.badge,
            campus: editingScholar.campus,
            status: editingScholar.status,
          })
          .eq("id", editingScholar.id);
      } catch (err) {
        console.warn("Supabase update error:", err);
      }
    }

    setEditingScholar(null);
    showToast("Scholar profile updated successfully.");
  };

  const handleConfirmDelete = async () => {
    if (!deletingScholar) return;
    const updated = entries.filter((e) => e.id !== deletingScholar.id);
    setEntries(updated);
    saveStoredYearbook(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from("yearbook_alumni")
          .delete()
          .eq("id", deletingScholar.id);
      } catch (err) {
        console.warn("Supabase delete error:", err);
      }
    }

    if (inspectingScholar?.id === deletingScholar.id) setInspectingScholar(null);
    setDeletingScholar(null);
    showToast("Scholar profile removed.");
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
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-3 py-1 rounded-full mb-2 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-xs font-bold">auto_stories</span>
            <span className="text-[11px] font-black text-[#0E3B7D] uppercase tracking-wider">
              {isStudent ? "Student Contributor Portal" : "Yearbook & Alumni Master Admin"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#09234B] tracking-tight">
            {isStudent ? "Yearbook Data Entry & Submissions" : "Yearbook & Honors Management"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isStudent
              ? "Submit your academic achievements, distinctions, and photos for the Class of 2026/2025/2024 gallery (Yangon, Mawlamyine, or Both)."
              : "Review student submissions, manage distinctions, and publish official university placement records across all campuses."}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-base font-bold">add_circle</span>
          <span>{isStudent ? "Submit Profile for Review" : "Add New Scholar"}</span>
        </button>
      </div>

      {/* Top Workflow Tabs for Staff/Principal */}
      {isStaffOrPrincipal && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("published")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "published"
                ? "bg-[#0E3B7D] text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>Live Published ({entries.filter((e) => e.status === "published" || !e.status).length})</span>
          </button>

          <button
            onClick={() => setActiveTab("pending_review")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "pending_review"
                ? "bg-[#FFC700] text-[#09234B] shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>Review Queue</span>
            {pendingReviewCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                {pendingReviewCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          {!isStudent && activeTab !== "pending_review" && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Cohort:</span>
              {["All", "Class of 2026", "Class of 2025", "Class of 2024"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                    categoryFilter === cat
                      ? "bg-[#0E3B7D] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="relative w-full sm:w-72 ml-auto">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholar, distinction, destination..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
            />
          </div>
        </div>

        {/* Campus Location Filter Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-[#0E3B7D]">pin_drop</span>
            <span>Campus Location:</span>
          </span>
          {[
            { id: "All", label: "All Campuses" },
            { id: "Yangon", label: "Yangon Campuses" },
            { id: "Mawlamyine", label: "Mawlamyine Campus" },
            { id: "Both", label: "Both (Yangon & Mawlamyine)" },
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

      {/* Review Queue Banner if in pending_review tab */}
      {activeTab === "pending_review" && isStaffOrPrincipal && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600">pending_actions</span>
            <span>
              <strong>Student Submissions Awaiting Approval</strong>. Review data accuracy before publishing live to the Yearbook.
            </span>
          </div>
        </div>
      )}

      {/* Empty Notice if Cleaned */}
      {filteredEntries.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">auto_stories</span>
          <h3 className="text-base font-bold text-[#09234B]">No entries published yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Click &quot;Add New Scholar&quot; to upload scholar portraits and honors distinctions.
          </p>
        </div>
      )}

      {/* Grid of Scholars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntries.map((scholar) => {
          const campusBadge = formatCampusBadge(scholar.campus);

          return (
            <div
              key={scholar.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo & Badge */}
                <div className="relative h-56 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={scholar.image || "/images/g5.jpg"}
                    alt={scholar.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFC700] text-[#09234B] text-[10px] font-black uppercase">
                      {scholar.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${campusBadge.badgeClass}`}
                    >
                      {campusBadge.label}
                    </span>
                    {scholar.status === "pending_review" && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase animate-pulse">
                        Pending Review
                      </span>
                    )}
                  </div>

                  {scholar.badge && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-md bg-white/90 text-[#0E3B7D] text-[10px] font-extrabold shadow-sm">
                        {scholar.badge}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-lg font-black">{scholar.name}</h3>
                    <p className="text-xs text-[#FFC700] font-bold line-clamp-1">{scholar.role}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3 text-xs text-slate-600">
                  {scholar.submittedByName && (
                    <div className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                      Submitted by: <span className="text-slate-700">{scholar.submittedByName}</span>
                    </div>
                  )}

                  {scholar.destination && (
                    <div className="flex items-start gap-1.5 bg-blue-50/60 p-2 rounded-xl border border-blue-100">
                      <span className="material-symbols-outlined text-sm text-[#0E3B7D] shrink-0 mt-0.5">
                        school
                      </span>
                      <span className="font-bold text-[#0E3B7D] line-clamp-2">{scholar.destination}</span>
                    </div>
                  )}

                  {scholar.subjects && (
                    <div>
                      <span className="font-bold uppercase text-[10px] text-slate-400 block mb-0.5">
                        Subject Distinction
                      </span>
                      <span className="font-medium text-slate-700">{scholar.subjects}</span>
                    </div>
                  )}

                  <p className="italic text-slate-500 line-clamp-2">&quot;{scholar.quote}&quot;</p>
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                {scholar.status === "pending_review" && isStaffOrPrincipal ? (
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => handleApproveEntry(scholar.id)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base">check</span>
                      <span>Approve &amp; Publish</span>
                    </button>
                    <button
                      onClick={() => handleRejectEntry(scholar.id)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setInspectingScholar(scholar)}
                      className="text-xs font-bold text-[#0E3B7D] hover:underline"
                    >
                      View Details
                    </button>

                    <div className="flex items-center gap-1.5">
                      {(!isStudent || scholar.submittedBy === currentUser.id) && (
                        <button
                          onClick={() => setEditingScholar({ ...scholar })}
                          className="p-1.5 text-slate-500 hover:text-[#0E3B7D] hover:bg-slate-200 rounded-lg transition-colors"
                          title="Edit Scholar"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      )}
                      {isStaffOrPrincipal && (
                        <button
                          onClick={() => setDeletingScholar(scholar)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Scholar"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add / Submit Scholar Modal ────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-black text-[#0E3B7D]">
                  {isStudent ? "Submit Yearbook Profile" : "Add Scholar Profile"}
                </h2>
                <p className="text-xs text-slate-400">
                  {isStudent
                    ? "Your entry will be reviewed and published by Faculty Staff."
                    : "Published immediately to the official Yearbook gallery."}
                </p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateScholar} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Scholar Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lin Myat Thu"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Graduating Class</label>
                  <select
                    value={newForm.category}
                    onChange={(e) =>
                      setNewForm({
                        ...newForm,
                        category: e.target.value as "Class of 2026" | "Class of 2025" | "Class of 2024",
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  >
                    <option value="Class of 2026">Class of 2026</option>
                    <option value="Class of 2025">Class of 2025</option>
                    <option value="Class of 2024">Class of 2024</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Honors Badge</label>
                  <select
                    value={newForm.badge}
                    onChange={(e) => setNewForm({ ...newForm, badge: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  >
                    {badgePresets.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Campus Attribution */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Campus Location</label>
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
                <label className="font-bold text-slate-700 block mb-1">Leadership Role / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Head Boy & Pearson Highest Mark in Pure Math"
                  value={newForm.role}
                  onChange={(e) => setNewForm({ ...newForm, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">University Destination / Offer</label>
                <input
                  type="text"
                  placeholder="e.g. Imperial College London · BEng Aeronautical Engineering"
                  value={newForm.destination}
                  onChange={(e) => setNewForm({ ...newForm, destination: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Results / Distinctions</label>
                <input
                  type="text"
                  placeholder="e.g. IAL: Pure Math (A*), Physics (A*), Chemistry (A*)"
                  value={newForm.subjects}
                  onChange={(e) => setNewForm({ ...newForm, subjects: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quote / Student Message</label>
                <textarea
                  rows={2}
                  placeholder="Share your reflection on studying at Hinthar..."
                  value={newForm.quote}
                  onChange={(e) => setNewForm({ ...newForm, quote: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              {/* Scholar Photo Upload */}
              <div>
                <ImageUploadPicker
                  label="Scholar Photo / Portrait"
                  value={newForm.image}
                  onChange={(url) => setNewForm({ ...newForm, image: url })}
                  folder="yearbook"
                  aspectRatio="portrait"
                  defaultPresetsCategory="scholar"
                  helperText="Upload scholar portrait or pick from school portrait presets."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black"
                >
                  {isStudent ? "Submit for Approval" : "Publish Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Scholar Modal ────────────────────────────────────── */}
      {editingScholar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <h2 className="text-lg font-black text-[#0E3B7D]">Edit Scholar Profile</h2>
              <button onClick={() => setEditingScholar(null)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Scholar Name</label>
                <input
                  type="text"
                  value={editingScholar.name}
                  onChange={(e) => setEditingScholar({ ...editingScholar, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Graduating Class</label>
                  <select
                    value={editingScholar.category}
                    onChange={(e) =>
                      setEditingScholar({
                        ...editingScholar,
                        category: e.target.value as "Class of 2026" | "Class of 2025" | "Class of 2024",
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  >
                    <option value="Class of 2026">Class of 2026</option>
                    <option value="Class of 2025">Class of 2025</option>
                    <option value="Class of 2024">Class of 2024</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Honors Badge</label>
                  <select
                    value={editingScholar.badge || ""}
                    onChange={(e) => setEditingScholar({ ...editingScholar, badge: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  >
                    <option value="">No Honors Badge</option>
                    {badgePresets.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Campus Attribution */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Campus Location</label>
                <select
                  value={editingScholar.campus || "both-campuses"}
                  onChange={(e) => setEditingScholar({ ...editingScholar, campus: e.target.value })}
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
                <label className="font-bold text-slate-700 block mb-1">Role / Distinction</label>
                <input
                  type="text"
                  value={editingScholar.role}
                  onChange={(e) => setEditingScholar({ ...editingScholar, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">University Destination</label>
                <input
                  type="text"
                  value={editingScholar.destination}
                  onChange={(e) => setEditingScholar({ ...editingScholar, destination: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Distinctions</label>
                <input
                  type="text"
                  value={editingScholar.subjects}
                  onChange={(e) => setEditingScholar({ ...editingScholar, subjects: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quote</label>
                <textarea
                  rows={2}
                  value={editingScholar.quote}
                  onChange={(e) => setEditingScholar({ ...editingScholar, quote: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                />
              </div>

              {/* Scholar Photo Upload */}
              <div>
                <ImageUploadPicker
                  label="Scholar Photo / Portrait"
                  value={editingScholar.image || ""}
                  onChange={(url) => setEditingScholar({ ...editingScholar, image: url })}
                  folder="yearbook"
                  aspectRatio="portrait"
                  defaultPresetsCategory="scholar"
                  helperText="Upload scholar portrait or pick from school portrait presets."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingScholar(null)}
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

      {/* ── View Details Modal ────────────────────────────────────── */}
      {inspectingScholar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <h2 className="text-lg font-black text-[#0E3B7D]">Scholar Record Details</h2>
              <button onClick={() => setInspectingScholar(null)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-900">
                <Image
                  src={inspectingScholar.image || "/images/g5.jpg"}
                  alt={inspectingScholar.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#FFC700] text-[#09234B] font-black text-[10px]">
                    {inspectingScholar.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white text-[#0E3B7D] font-bold text-[10px]">
                    {formatCampusBadge(inspectingScholar.campus).label}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">{inspectingScholar.name}</h3>
                <p className="text-xs font-bold text-[#0E3B7D]">{inspectingScholar.role}</p>
              </div>

              {inspectingScholar.destination && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">University Destination</p>
                  <p className="font-bold text-[#0E3B7D] mt-0.5">{inspectingScholar.destination}</p>
                </div>
              )}

              {inspectingScholar.subjects && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Subject Distinctions</p>
                  <p className="text-slate-700 mt-0.5">{inspectingScholar.subjects}</p>
                </div>
              )}

              {inspectingScholar.quote && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Student Reflection</p>
                  <p className="italic text-slate-600 mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    &quot;{inspectingScholar.quote}&quot;
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setInspectingScholar(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ─────────────────────────────────────────── */}
      {deletingScholar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">Remove Scholar</h3>
            <p className="text-xs text-slate-600 mt-1 mb-5">
              Are you sure you want to remove <strong>{deletingScholar.name}</strong> from the yearbook?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeletingScholar(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
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
