"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ClubItem,
  mapClubRecord,
  ActivityItem,
  mapActivityRecord,
  UserProfile,
  FALLBACK_GUEST_USER,
  HIERARCHICAL_CAMPUS_OPTIONS,
  formatCampusBadge,
  mapUserProfileRecord,
} from "../adminStore";
import ImageUploadPicker from "@/app/components/admin/ImageUploadPicker";
import { isR2AssetUrl } from "@/lib/utils/r2Image";
import { authClient } from "@/lib/auth/auth-client";
import {
  getClubs,
  createClubAction,
  updateClubAction,
  deleteClubAction,
  setClubStatusAction,
} from "@/lib/actions/clubs";
import {
  getActivities,
  createActivityAction,
  updateActivityAction,
  deleteActivityAction,
} from "@/lib/actions/activities";
import {
  getClubMembersAction,
  addClubMemberAction,
  removeClubMemberAction,
} from "@/lib/actions/clubMembers";

interface ClubMemberRow {
  id: number;
  clubId: number;
  studentName: string;
  grade?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
  status: string;
}

export default function AdminClubsPage() {
  const [activeSection, setActiveSection] = useState<"clubs" | "activities">("clubs");
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(FALLBACK_GUEST_USER);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state - Clubs
  const [isAddClubModalOpen, setIsAddClubModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<ClubItem | null>(null);
  const [deletingClub, setDeletingClub] = useState<ClubItem | null>(null);

  // Club members state
  const [membersClub, setMembersClub] = useState<ClubItem | null>(null);
  const [clubMemberList, setClubMemberList] = useState<ClubMemberRow[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberForm, setMemberForm] = useState({
    studentName: "",
    grade: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
  });

  // Modals state - Activities
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<ActivityItem | null>(null);

  // New Club Form
  const [clubForm, setClubForm] = useState({
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

  // New Activity Form
  const [activityForm, setActivityForm] = useState({
    clubId: undefined as number | undefined,
    title: "",
    category: "academic" as "academic" | "sports" | "cultural" | "science",
    date: "September 20, 2026",
    month: "SEP",
    day: "20",
    time: "09:00 AM – 03:00 PM",
    location: "Main Auditorium",
    description: "",
    image: "/images/engineering.avif",
    status: "Upcoming" as "Upcoming" | "Active Registration" | "Past Highlight",
    campus: "both-campuses",
    featured: false,
  });

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      setCurrentUser(mapUserProfileRecord(session.user));
    }
  }, [session]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const [clubsData, actsData] = await Promise.all([
        getClubs().catch(() => []),
        getActivities().catch(() => []),
      ]);
      setClubs(clubsData.map(mapClubRecord));
      setActivities(actsData.map(mapActivityRecord));
    } catch (err) {
      console.warn("Failed to load clubs/activities:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isAdmin = currentUser?.role === "admin";

  // Filtered lists
  const filteredClubs = clubs.filter((c) => {
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.leadership.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredActivities = activities.filter((a) => {
    return (
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Action Handlers - Clubs
  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubForm.name.trim()) return;
    try {
      const res = await createClubAction(clubForm);
      showToast(
        isAdmin
          ? `Club "${clubForm.name}" created and published.`
          : `Club proposal for "${clubForm.name}" submitted for admin review.`
      );
      setIsAddClubModalOpen(false);
      setClubForm({
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
      loadData();
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to create club."}`);
    }
  };

  const handleSaveEditClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClub) return;
    try {
      await updateClubAction(editingClub.id, editingClub);
      setClubs((prev) =>
        prev.map((c) => (c.id === editingClub.id ? editingClub : c))
      );
      setEditingClub(null);
      showToast(`Club "${editingClub.name}" updated successfully.`);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to update club."}`);
    }
  };

  const handleDeleteClub = async () => {
    if (!deletingClub) return;
    try {
      await deleteClubAction(deletingClub.id);
      setClubs((prev) => prev.filter((c) => c.id !== deletingClub.id));
      showToast(`Club "${deletingClub.name}" removed.`);
      setDeletingClub(null);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to delete club."}`);
    }
  };

  // Club members handlers
  const openMembersModal = async (club: ClubItem) => {
    setMembersClub(club);
    setIsLoadingMembers(true);
    setMemberForm({ studentName: "", grade: "", contactEmail: "", contactPhone: "", notes: "" });
    try {
      const rows = await getClubMembersAction(club.id);
      setClubMemberList(rows as ClubMemberRow[]);
    } catch (err: any) {
      showToast(`Error: ${err?.message || "Failed to load club members."}`);
      setClubMemberList([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membersClub || !memberForm.studentName.trim() || isAddingMember) return;
    setIsAddingMember(true);
    try {
      const res = await addClubMemberAction(membersClub.id, memberForm);
      if (res.success) {
        showToast(`${memberForm.studentName} added to ${membersClub.name}.`);
        setMemberForm({ studentName: "", grade: "", contactEmail: "", contactPhone: "", notes: "" });
        const rows = await getClubMembersAction(membersClub.id);
        setClubMemberList(rows as ClubMemberRow[]);
      } else {
        showToast(`Error: ${res.error || "Failed to add member."}`);
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || "Failed to add member."}`);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: number, studentName: string) => {
    if (!membersClub) return;
    try {
      const res = await removeClubMemberAction(memberId);
      if (res.success) {
        setClubMemberList((prev) => prev.filter((m) => m.id !== memberId));
        showToast(`${studentName} removed from ${membersClub.name}.`);
      } else {
        showToast(`Error: ${res.error || "Failed to remove member."}`);
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || "Failed to remove member."}`);
    }
  };

  // Action Handlers - Activities
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.title.trim()) return;
    try {
      await createActivityAction(activityForm);
      showToast(
        isAdmin
          ? `Activity "${activityForm.title}" added to school calendar.`
          : `Activity proposal for "${activityForm.title}" submitted.`
      );
      setIsAddActivityModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to create activity."}`);
    }
  };

  const handleSaveEditActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    try {
      await updateActivityAction(editingActivity.id, editingActivity);
      setActivities((prev) =>
        prev.map((a) => (a.id === editingActivity.id ? editingActivity : a))
      );
      setEditingActivity(null);
      showToast(`Activity "${editingActivity.title}" updated.`);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to update activity."}`);
    }
  };

  const handleDeleteActivity = async () => {
    if (!deletingActivity) return;
    try {
      await deleteActivityAction(deletingActivity.id);
      setActivities((prev) => prev.filter((a) => a.id !== deletingActivity.id));
      showToast(`Activity "${deletingActivity.title}" removed.`);
      setDeletingActivity(null);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to delete activity."}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 bg-[#0E3B7D] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FFC700] animate-fade-in">
          <span aria-hidden="true" className="material-symbols-outlined text-[#FFC700]">check_circle</span>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0E3B7D]">Clubs &amp; Activities</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0E3B7D] font-extrabold text-xs">
              Extracurricular Hub
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage student societies, STEM clubs, sports leagues, and campus calendar events.
          </p>
        </div>

        {/* Section Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveSection("clubs")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeSection === "clubs"
                ? "bg-[#0E3B7D] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">groups</span>
            <span>Clubs ({clubs.length})</span>
          </button>
          <button
            onClick={() => setActiveSection("activities")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeSection === "activities"
                ? "bg-[#0E3B7D] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">event</span>
            <span>Events &amp; Activities ({activities.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Add Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <span aria-hidden="true" className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSection === "clubs"
                ? "Search club title, leader..."
                : "Search events, locations..."
            }
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
        </div>

        {activeSection === "clubs" ? (
          <button
            onClick={() => setIsAddClubModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">add_circle</span>
            <span>{isAdmin ? "Add New Club" : "Propose New Club"}</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAddActivityModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">event_available</span>
            <span>{isAdmin ? "Add Event / Activity" : "Propose Activity"}</span>
          </button>
        )}
      </div>

      {/* CLUBS SECTION */}
      {activeSection === "clubs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => {
            const campusInfo = formatCampusBadge(club.campus);
            return (
              <div
                key={club.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-900">
                    <Image
                      src={club.image || "/images/engineering.avif"}
                      alt={club.name}
                      fill
                      unoptimized={isR2AssetUrl(club.image)}
                      className="object-cover opacity-90"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#09234B]/80 text-[#FFC700] backdrop-blur-sm">
                        {club.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-black text-[#09234B]">{club.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {club.description}
                    </p>

                    <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <p className="flex items-center gap-1.5">
                        <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">schedule</span>
                        <span>{club.meetingTime}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">person</span>
                        <span className="truncate">{club.leadership}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${campusInfo.badgeClass}`}>
                    {campusInfo.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isAdmin && (
                      <button
                        onClick={() => openMembersModal(club)}
                        aria-label={`Manage members of ${club.name}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-base">group_add</span>
                      </button>
                    )}
                    <button
                      onClick={() => setEditingClub(club)}
                      aria-label={`Edit ${club.name}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0E3B7D] hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
                    </button>
                    {isAdmin && (
                      <button aria-label="Delete"
                        onClick={() => setDeletingClub(club)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ACTIVITIES SECTION */}
      {activeSection === "activities" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 w-full bg-slate-900">
                  <Image
                    src={act.image || "/images/engineering.avif"}
                    alt={act.title}
                    fill
                    unoptimized={isR2AssetUrl(act.image)}
                    className="object-cover opacity-90"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600/90 text-white backdrop-blur-sm">
                      {act.status}
                    </span>
                    {act.featured && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFC700] text-[#09234B]">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0E3B7D]">
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">calendar_month</span>
                    <span>{act.date} • {act.time}</span>
                  </div>
                  <h3 className="text-base font-black text-[#09234B]">{act.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{act.description}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span aria-hidden="true" className="material-symbols-outlined text-xs">location_on</span>
                    <span>{act.location}</span>
                  </p>
                </div>
              </div>

              <div className="p-3 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <button aria-label="Edit"
                  onClick={() => setEditingActivity(act)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#0E3B7D] hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
                </button>
                {isAdmin && (
                  <button aria-label="Delete"
                    onClick={() => setDeletingActivity(act)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD CLUB MODAL */}
      {isAddClubModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-[#09234B]">Add / Propose Student Club</h2>
            <form onSubmit={handleCreateClub} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Club Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & Robotics Innovation Club"
                  value={clubForm.name}
                  onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={clubForm.category}
                    onChange={(e) => setClubForm({ ...clubForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="STEM & Tech">STEM & Tech</option>
                    <option value="Academic & Debate">Academic & Debate</option>
                    <option value="STEM & Science">STEM & Science</option>
                    <option value="Creative Arts">Creative Arts</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus</label>
                  <select
                    value={clubForm.campus}
                    onChange={(e) => setClubForm({ ...clubForm, campus: e.target.value })}
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
                <label className="font-bold text-slate-700 block mb-1">Meeting Time / Schedule</label>
                <input
                  type="text"
                  required
                  placeholder="Wednesdays · 03:45 PM – 05:15 PM"
                  value={clubForm.meetingTime}
                  onChange={(e) => setClubForm({ ...clubForm, meetingTime: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Leadership &amp; Faculty Advisor</label>
                <input
                  type="text"
                  required
                  placeholder="Student Lead: Min Khant | Advisor: Dr. Htet Aung Lin"
                  value={clubForm.leadership}
                  onChange={(e) => setClubForm({ ...clubForm, leadership: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Club Mission &amp; Overview</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe focus, projects, and activities..."
                  value={clubForm.description}
                  onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <ImageUploadPicker
                  label="Cover Photo"
                  value={clubForm.image}
                  onChange={(url) => setClubForm({ ...clubForm, image: url })}
                  folder="clubs"
                  defaultPresetsCategory="club"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddClubModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0E3B7D] text-white font-bold"
                >
                  Save Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CLUB MODAL */}
      {editingClub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-[#09234B]">Edit Club: {editingClub.name}</h2>
            <form onSubmit={handleSaveEditClub} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Club Name</label>
                <input
                  type="text"
                  required
                  value={editingClub.name}
                  onChange={(e) => setEditingClub({ ...editingClub, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editingClub.category}
                    onChange={(e) => setEditingClub({ ...editingClub, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="STEM & Tech">STEM & Tech</option>
                    <option value="Academic & Debate">Academic & Debate</option>
                    <option value="STEM & Science">STEM & Science</option>
                    <option value="Creative Arts">Creative Arts</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus</label>
                  <select
                    value={editingClub.campus || "both-campuses"}
                    onChange={(e) => setEditingClub({ ...editingClub, campus: e.target.value })}
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
                <label className="font-bold text-slate-700 block mb-1">Meeting Time</label>
                <input
                  type="text"
                  required
                  value={editingClub.meetingTime}
                  onChange={(e) => setEditingClub({ ...editingClub, meetingTime: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Leadership</label>
                <input
                  type="text"
                  required
                  value={editingClub.leadership}
                  onChange={(e) => setEditingClub({ ...editingClub, leadership: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingClub.description}
                  onChange={(e) => setEditingClub({ ...editingClub, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <ImageUploadPicker
                  label="Cover Photo"
                  value={editingClub.image}
                  onChange={(url) => setEditingClub({ ...editingClub, image: url })}
                  folder="clubs"
                  defaultPresetsCategory="club"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingClub(null)}
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

      {/* ADD ACTIVITY MODAL */}
      {isAddActivityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-[#09234B]">Add / Propose Activity</h2>
            <form onSubmit={handleCreateActivity} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual STEM & Robotics Fair"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={activityForm.category}
                    onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="academic">Academic</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="science">Science</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Associated Club (Optional)</label>
                  <select
                    value={activityForm.clubId || ""}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        clubId: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">General School Event</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Month Code</label>
                  <input
                    type="text"
                    required
                    placeholder="SEP"
                    value={activityForm.month}
                    onChange={(e) => setActivityForm({ ...activityForm, month: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Day</label>
                  <input
                    type="text"
                    required
                    placeholder="18"
                    value={activityForm.day}
                    onChange={(e) => setActivityForm({ ...activityForm, day: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={activityForm.status}
                    onChange={(e) => setActivityForm({ ...activityForm, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Active Registration">Active Registration</option>
                    <option value="Past Highlight">Past Highlight</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 AM – 03:30 PM"
                    value={activityForm.time}
                    onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="Main Auditorium"
                    value={activityForm.location}
                    onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Event agenda and highlights..."
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <ImageUploadPicker
                  label="Cover Photo"
                  value={activityForm.image}
                  onChange={(url) => setActivityForm({ ...activityForm, image: url })}
                  folder="activities"
                  defaultPresetsCategory="club"
                />
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featCheck"
                    checked={activityForm.featured}
                    onChange={(e) => setActivityForm({ ...activityForm, featured: e.target.checked })}
                    className="rounded text-[#0E3B7D]"
                  />
                  <label htmlFor="featCheck" className="font-bold text-slate-700">
                    Feature on Activities Header Showcase
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddActivityModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0E3B7D] text-white font-bold"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ACTIVITY MODAL */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-[#09234B]">Edit Activity: {editingActivity.title}</h2>
            <form onSubmit={handleSaveEditActivity} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingActivity.title}
                  onChange={(e) => setEditingActivity({ ...editingActivity, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editingActivity.category}
                    onChange={(e) => setEditingActivity({ ...editingActivity, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="academic">Academic</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="science">Science</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={editingActivity.status}
                    onChange={(e) => setEditingActivity({ ...editingActivity, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Active Registration">Active Registration</option>
                    <option value="Past Highlight">Past Highlight</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={editingActivity.time}
                    onChange={(e) => setEditingActivity({ ...editingActivity, time: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={editingActivity.location}
                    onChange={(e) => setEditingActivity({ ...editingActivity, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingActivity.description}
                  onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <ImageUploadPicker
                  label="Cover Photo"
                  value={editingActivity.image}
                  onChange={(url) => setEditingActivity({ ...editingActivity, image: url })}
                  folder="activities"
                  defaultPresetsCategory="club"
                />
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="editFeatCheck"
                    checked={editingActivity.featured}
                    onChange={(e) => setEditingActivity({ ...editingActivity, featured: e.target.checked })}
                    className="rounded text-[#0E3B7D]"
                  />
                  <label htmlFor="editFeatCheck" className="font-bold text-slate-700">
                    Feature on Activities Header Showcase
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
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

      {/* CLUB MEMBERS MODAL */}
      {membersClub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="members-modal-title"
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="members-modal-title" className="text-xl font-black text-[#09234B]">
                  Members — {membersClub.name}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Add students to this club by entering their details. No student account is required.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMembersClub(null)}
                aria-label="Close members panel"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Add member form */}
            {isAdmin && (
              <form onSubmit={handleAddMember} className="space-y-3 p-4 rounded-2xl border border-slate-200 bg-slate-50">
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Add Student to Club</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label htmlFor="member-name" className="font-bold text-slate-700 block mb-1">Student Name *</label>
                    <input
                      id="member-name"
                      type="text"
                      required
                      placeholder="e.g. Aung Kaung Myat"
                      value={memberForm.studentName}
                      onChange={(e) => setMemberForm({ ...memberForm, studentName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label htmlFor="member-grade" className="font-bold text-slate-700 block mb-1">Grade / Year</label>
                    <input
                      id="member-grade"
                      type="text"
                      placeholder="e.g. IGCSE Year 10"
                      value={memberForm.grade}
                      onChange={(e) => setMemberForm({ ...memberForm, grade: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label htmlFor="member-email" className="font-bold text-slate-700 block mb-1">Contact Email</label>
                    <input
                      id="member-email"
                      type="email"
                      placeholder="student@hinthar.education"
                      value={memberForm.contactEmail}
                      onChange={(e) => setMemberForm({ ...memberForm, contactEmail: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label htmlFor="member-phone" className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                    <input
                      id="member-phone"
                      type="tel"
                      placeholder="+95 9 ..."
                      value={memberForm.contactPhone}
                      onChange={(e) => setMemberForm({ ...memberForm, contactPhone: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isAddingMember}
                  className="px-5 py-2 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isAddingMember ? "Adding..." : "Add Member"}
                </button>
              </form>
            )}

            {/* Member list */}
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Roster ({clubMemberList.length})
              </p>
              {isLoadingMembers ? (
                <div className="py-8 flex justify-center" role="status" aria-label="Loading members">
                  <span aria-hidden="true" className="w-6 h-6 border-2 border-slate-200 border-t-[#0E3B7D] rounded-full animate-spin" />
                </div>
              ) : clubMemberList.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-slate-300 rounded-2xl">
                  <span aria-hidden="true" className="material-symbols-outlined text-3xl text-slate-300">group_off</span>
                  <p className="text-xs text-slate-500 mt-2">No members yet. Use the form above to add the first student.</p>
                </div>
              ) : (
                clubMemberList.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#09234B] truncate">{m.studentName}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {[m.grade, m.contactEmail, m.contactPhone].filter(Boolean).join(" · ") || "No additional details"}
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.id, m.studentName)}
                        aria-label={`Remove ${m.studentName} from ${membersClub.name}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-base">person_remove</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATIONS */}
      {deletingClub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-[#09234B]">Delete Club?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong>{deletingClub.name}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingClub(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteClub}
                className="px-4 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingActivity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-[#09234B]">Delete Activity?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to remove <strong>{deletingActivity.title}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingActivity(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteActivity}
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
