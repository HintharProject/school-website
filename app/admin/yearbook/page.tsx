"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  YearbookScholar,
  mapYearbookRecord,
  UserProfile,
  FALLBACK_GUEST_USER,
  HIERARCHICAL_CAMPUS_OPTIONS,
  formatCampusBadge,
  mapUserProfileRecord,
} from "../adminStore";
import ImageUploadPicker from "@/app/components/admin/ImageUploadPicker";
import { authClient } from "@/lib/auth/auth-client";
import {
  getYearbook,
  createYearbookAction,
  updateYearbookAction,
  deleteYearbookAction,
  setYearbookStatusAction,
} from "@/lib/actions/yearbook";

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
  const [currentUser, setCurrentUser] = useState<UserProfile>(FALLBACK_GUEST_USER);
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

  // New Scholar Form
  const [newForm, setNewForm] = useState({
    name: "",
    category: "Class of 2026" as "Class of 2026" | "Class of 2025" | "Class of 2024" | "University Placements" | "Competitions",
    role: "Senior Scholar & High Distinction",
    destination: "",
    subjects: "",
    quote: "",
    image: "/images/g5.jpg",
    badge: "World Top Scorer",
    campus: "both-campuses",
  });

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      const u = mapUserProfileRecord(session.user);
      setCurrentUser(u);
      if (u.role === "student") {
        setActiveTab("my_submissions");
      }
    }
  }, [session]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const data = await getYearbook();
      setEntries(data.map(mapYearbookRecord));
    } catch (err) {
      console.warn("Failed to load yearbook:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isStudent = (currentUser?.role ?? "") === "student";
  const isAdmin = (currentUser?.role ?? "admin") === "admin";

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
    try {
      await createYearbookAction({
        name: newForm.name.trim(),
        category: newForm.category,
        role: newForm.role,
        destination: newForm.destination,
        subjects: newForm.subjects,
        quote: newForm.quote,
        image: newForm.image || "/images/g5.jpg",
        badge: newForm.badge || undefined,
        campus: newForm.campus || "both-campuses",
      });
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
      showToast(
        isStudent
          ? "Profile submitted! Sent to Review Queue for admin approval."
          : `Scholar "${newForm.name.trim()}" published directly to Yearbook.`
      );
      loadData();
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to create yearbook entry."}`);
    }
  };

  const handleApproveEntry = async (id: number) => {
    try {
      await setYearbookStatusAction(id, "published");
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "published" as const } : e))
      );
      showToast("Profile approved and published to public Yearbook!");
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to approve."}`);
    }
  };

  const handleRejectEntry = async (id: number) => {
    try {
      await setYearbookStatusAction(id, "archived");
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "archived" as const } : e))
      );
      showToast("Submission archived.");
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to archive."}`);
    }
  };

  const handleSaveEditScholar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScholar) return;
    try {
      await updateYearbookAction(editingScholar.id, editingScholar);
      setEntries((prev) =>
        prev.map((s) => (s.id === editingScholar.id ? editingScholar : s))
      );
      setEditingScholar(null);
      showToast(`Scholar "${editingScholar.name}" updated successfully.`);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to update entry."}`);
    }
  };

  const handleDeleteScholar = async () => {
    if (!deletingScholar) return;
    try {
      await deleteYearbookAction(deletingScholar.id);
      setEntries((prev) => prev.filter((s) => s.id !== deletingScholar.id));
      showToast(`Scholar "${deletingScholar.name}" deleted.`);
      setDeletingScholar(null);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to delete entry."}`);
    }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0E3B7D]">Yearbook &amp; Honors</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0E3B7D] font-extrabold text-xs">
              Alumni Chronicle
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Curate Class of 2026, 2025, 2024 graduate profiles, world distinction medals, and university placements.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {isAdmin ? (
            <>
              <button
                onClick={() => setActiveTab("published")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                  activeTab === "published"
                    ? "bg-[#0E3B7D] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="material-symbols-outlined text-base">verified</span>
                <span>Published ({entries.filter((e) => e.status !== "pending_review").length})</span>
              </button>
              <button
                onClick={() => setActiveTab("pending_review")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                  activeTab === "pending_review"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="material-symbols-outlined text-base">pending_actions</span>
                <span>Review Queue ({pendingReviewCount})</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab("my_submissions")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-xs bg-[#0E3B7D] text-white shadow-xs"
            >
              <span className="material-symbols-outlined text-base">person</span>
              <span>My Submissions</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Add Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search graduate name, university, subjects..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>{isAdmin ? "Add Scholar Entry" : "Submit My Profile"}</span>
          </button>
        </div>
      </div>

      {/* Grid of Yearbook Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntries.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">auto_stories</span>
            <p className="text-sm font-bold text-slate-700">No yearbook profiles found</p>
            <p className="text-xs text-slate-400 mt-1">Try refining search parameters or submit a new scholar profile.</p>
          </div>
        ) : (
          filteredEntries.map((scholar) => {
            const campusInfo = formatCampusBadge(scholar.campus);
            const isPending = scholar.status === "pending_review";

            return (
              <div
                key={scholar.id}
                className={`bg-white rounded-3xl border ${
                  isPending ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200"
                } overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between`}
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-900">
                    <Image
                      src={scholar.image || "/images/g5.jpg"}
                      alt={scholar.name}
                      fill
                      className="object-cover opacity-90"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#09234B]/80 text-[#FFC700] backdrop-blur-sm">
                        {scholar.category}
                      </span>
                      {scholar.badge && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600/90 text-white backdrop-blur-sm">
                          {scholar.badge}
                        </span>
                      )}
                      {isPending && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white animate-pulse">
                          Pending Review
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-lg font-black text-[#09234B]">{scholar.name}</h3>
                      <p className="text-xs font-semibold text-[#0E3B7D] mt-0.5">{scholar.role}</p>
                    </div>

                    {scholar.destination && (
                      <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
                        <span className="font-bold text-[#0E3B7D] block text-[10px] uppercase tracking-wider">
                          University Destination
                        </span>
                        <span className="text-slate-800 font-semibold">{scholar.destination}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
                      &ldquo;{scholar.quote}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="p-3 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${campusInfo.badgeClass}`}>
                    {campusInfo.label}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isAdmin && isPending ? (
                      <>
                        <button
                          onClick={() => handleApproveEntry(scholar.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectEntry(scholar.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                        >
                          Archive
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingScholar(scholar)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#0E3B7D] hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setDeletingScholar(scholar)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD SCHOLAR MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-[#09234B]">Add / Submit Graduate Profile</h2>
            <form onSubmit={handleCreateScholar} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Scholar Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lin Myat Thu"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Graduation Cohort</label>
                  <select
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Class of 2026">Class of 2026</option>
                    <option value="Class of 2025">Class of 2025</option>
                    <option value="Class of 2024">Class of 2024</option>
                    <option value="University Placements">University Placements</option>
                    <option value="Competitions">Competitions</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus</label>
                  <select
                    value={newForm.campus}
                    onChange={(e) => setNewForm({ ...newForm, campus: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {HIERARCHICAL_CAMPUS_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Academic Role &amp; Honors</label>
                <input
                  type="text"
                  required
                  placeholder="Valedictorian & Student Council President"
                  value={newForm.role}
                  onChange={(e) => setNewForm({ ...newForm, role: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">University Destination &amp; Major</label>
                <input
                  type="text"
                  placeholder="Imperial College London · Aeronautical Engineering"
                  value={newForm.destination}
                  onChange={(e) => setNewForm({ ...newForm, destination: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Grades / Distinctions</label>
                <input
                  type="text"
                  placeholder="Pure Maths (A*), Physics (A*), Chemistry (A*)"
                  value={newForm.subjects}
                  onChange={(e) => setNewForm({ ...newForm, subjects: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Honors Badge</label>
                <select
                  value={newForm.badge}
                  onChange={(e) => setNewForm({ ...newForm, badge: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {badgePresets.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alumni Quote</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share reflections on your Hinthar journey..."
                  value={newForm.quote}
                  onChange={(e) => setNewForm({ ...newForm, quote: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <ImageUploadPicker
                  label="Portrait Photo"
                  value={newForm.image}
                  onChange={(url) => setNewForm({ ...newForm, image: url })}
                  folder="yearbook"
                  defaultPresetsCategory="scholar"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0E3B7D] text-white font-bold"
                >
                  {isAdmin ? "Save Scholar" : "Submit for Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SCHOLAR MODAL */}
      {editingScholar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-[#09234B]">Edit Profile: {editingScholar.name}</h2>
            <form onSubmit={handleSaveEditScholar} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingScholar.name}
                  onChange={(e) => setEditingScholar({ ...editingScholar, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cohort</label>
                  <select
                    value={editingScholar.category}
                    onChange={(e) => setEditingScholar({ ...editingScholar, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Class of 2026">Class of 2026</option>
                    <option value="Class of 2025">Class of 2025</option>
                    <option value="Class of 2024">Class of 2024</option>
                    <option value="University Placements">University Placements</option>
                    <option value="Competitions">Competitions</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus</label>
                  <select
                    value={editingScholar.campus || "both-campuses"}
                    onChange={(e) => setEditingScholar({ ...editingScholar, campus: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {HIERARCHICAL_CAMPUS_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Academic Role</label>
                <input
                  type="text"
                  required
                  value={editingScholar.role}
                  onChange={(e) => setEditingScholar({ ...editingScholar, role: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">University Destination</label>
                <input
                  type="text"
                  value={editingScholar.destination || ""}
                  onChange={(e) => setEditingScholar({ ...editingScholar, destination: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subjects &amp; Marks</label>
                <input
                  type="text"
                  value={editingScholar.subjects || ""}
                  onChange={(e) => setEditingScholar({ ...editingScholar, subjects: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Badge</label>
                <select
                  value={editingScholar.badge || ""}
                  onChange={(e) => setEditingScholar({ ...editingScholar, badge: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {badgePresets.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quote</label>
                <textarea
                  rows={3}
                  required
                  value={editingScholar.quote}
                  onChange={(e) => setEditingScholar({ ...editingScholar, quote: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <ImageUploadPicker
                  label="Portrait Photo"
                  value={editingScholar.image}
                  onChange={(url) => setEditingScholar({ ...editingScholar, image: url })}
                  folder="yearbook"
                  defaultPresetsCategory="scholar"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingScholar(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0E3B7D] text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deletingScholar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-[#09234B]">Delete Scholar?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong>{deletingScholar.name}</strong> from the yearbook?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingScholar(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteScholar}
                className="px-4 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
