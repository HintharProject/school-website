"use client";

import { useState, useEffect } from "react";
import {
  CourseItem,
  BulletinNotice,
  mapCourseRecord,
  mapBulletinRecord,
  UserProfile,
  FALLBACK_GUEST_USER,
  mapUserProfileRecord,
} from "../adminStore";
import { fetchCourses, createCourse, updateCourse, deleteCourse, fetchBulletins, createBulletin, deleteBulletin, getCurrentUserProfile } from "@/lib/supabase/actions";

export default function AdminClassesPage() {
  const [activeTab, setActiveTab] = useState<"courses" | "announcements">("courses");
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [announcements, setAnnouncements] = useState<BulletinNotice[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(FALLBACK_GUEST_USER);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseItem | null>(null);

  const [isAddNoticeModalOpen, setIsAddNoticeModalOpen] = useState(false);
  const [deletingNotice, setDeletingNotice] = useState<BulletinNotice | null>(null);

  // New Course Form
  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    grade: "Pearson IAL" as "Lower Secondary (Year 7–9)" | "Pearson IGCSE" | "Pearson IAL",
    category: "STEM" as "STEM" | "Business" | "Computing" | "Languages",
    time: "",
    instructor: "",
    room: "",
  });

  // New Notice Form
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    type: "Official Notice" as "Official Notice" | "Academic" | "General",
    content: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const profile = await getCurrentUserProfile();
      if (profile) setCurrentUser(mapUserProfileRecord(profile));
      const [coursesData, bulletinsData] = await Promise.all([fetchCourses(), fetchBulletins()]);
      setCourses(coursesData.map(mapCourseRecord));
      setAnnouncements(bulletinsData.map(mapBulletinRecord));
    } catch (err) {
      console.warn("Failed to load classes/bulletins:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered lists
  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Actions - Courses
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.name.trim() || !courseForm.code.trim()) return;
    const newId = `course-${Date.now()}`;
    try {
      const created = await createCourse({
        id: newId,
        name: courseForm.name,
        code: courseForm.code,
        grade: courseForm.grade,
        category: courseForm.category,
        time: courseForm.time || "Mon, Wed, Fri • 10:00 AM",
        instructor: courseForm.instructor || "Faculty Lead",
        room: courseForm.room || "Room 101",
        is_active: true,
      });
      setCourses((prev) => [mapCourseRecord(created), ...prev]);
      setIsAddCourseModalOpen(false);
      setCourseForm({ name: "", code: "", grade: "Pearson IAL", category: "STEM", time: "", instructor: "", room: "" });
      showToast(`Course "${courseForm.name}" added successfully.`);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to add course."}`);
    }
  };

  const handleSaveEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      const updated = await updateCourse(editingCourse.id, editingCourse);
      setCourses((prev) => prev.map((c) => c.id === editingCourse.id ? mapCourseRecord(updated) : c));
      setEditingCourse(null);
      showToast(`Course "${editingCourse.name}" updated successfully.`);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to update course."}`);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;
    try {
      await deleteCourse(deletingCourse.id);
      setCourses((prev) => prev.filter((c) => c.id !== deletingCourse.id));
      showToast(`Course "${deletingCourse.name}" removed.`);
      setDeletingCourse(null);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to delete course."}`);
    }
  };

  // Actions - Announcements
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) return;
    try {
      const created = await createBulletin({
        title: noticeForm.title,
        date: noticeForm.date || new Date().toISOString().split("T")[0],
        type: noticeForm.type,
        content: noticeForm.content,
      });
      setAnnouncements((prev) => [mapBulletinRecord(created), ...prev]);
      setIsAddNoticeModalOpen(false);
      setNoticeForm({ title: "", date: new Date().toISOString().split("T")[0], type: "Official Notice", content: "" });
      showToast("Announcement published.");
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to create announcement."}`);
    }
  };

  const handleDeleteNotice = async () => {
    if (!deletingNotice) return;
    try {
      await deleteBulletin(deletingNotice.id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== deletingNotice.id));
      showToast("Announcement removed.");
      setDeletingNotice(null);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to delete announcement."}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#09234B] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#FFC700]/30 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <span className="material-symbols-outlined text-[#FFC700]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0E3B7D] via-[#09234B] to-[#05152E] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-900/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFC700]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC700]/20 text-[#FFC700] text-xs font-bold uppercase tracking-wider mb-3 border border-[#FFC700]/30">
              <span className="material-symbols-outlined text-sm">menu_book</span>
              Pearson Edexcel Continuum & Timetables
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Classes & Announcements Management
            </h1>
            <p className="text-blue-200 text-sm mt-1 max-w-2xl">
              Curate Lower Secondary, Pearson IGCSE, and Pearson IAL schedules, faculty instructors, and official bulletins with live public synchronization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "courses" ? (
              <button
                onClick={() => setIsAddCourseModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#E5B300] text-[#09234B] font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span>Add Class Schedule</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAddNoticeModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#E5B300] text-[#09234B] font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">campaign</span>
                <span>Post Announcement</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex-1 md:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "courses"
                ? "bg-white text-[#0E3B7D] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-base">school</span>
            <span>Academic Courses ({courses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex-1 md:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "announcements"
                ? "bg-white text-[#0E3B7D] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-base">campaign</span>
            <span>Bulletins & Notices ({announcements.length})</span>
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "courses" ? "Search course name, code, instructor..." : "Search announcements..."}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">
            search
          </span>
        </div>
      </div>

      {/* Courses Tab View */}
      {activeTab === "courses" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-extrabold text-slate-500">
                <tr>
                  <th className="py-3.5 px-6">Course & Code</th>
                  <th className="py-3.5 px-4">Curriculum Stream</th>
                  <th className="py-3.5 px-4">Schedule & Venue</th>
                  <th className="py-3.5 px-4">Instructor</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 leading-snug">{c.name}</div>
                      <span className="inline-block mt-1 font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          c.grade.includes("IAL")
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : c.grade.includes("IGCSE")
                            ? "bg-blue-100 text-[#0E3B7D] border border-blue-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {c.grade}
                      </span>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{c.category}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-xs font-semibold text-slate-800">{c.time}</p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">meeting_room</span>
                        {c.room || "Main Hall"}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-xs font-bold text-slate-900">{c.instructor}</p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingCourse(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#0E3B7D] transition-all"
                          title="Edit Course"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingCourse(c)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-all"
                          title="Delete Course"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Announcements Tab View */}
      {activeTab === "announcements" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAnnouncements.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                      a.type === "Official Notice"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : a.type === "Academic"
                        ? "bg-blue-100 text-[#0E3B7D] border border-blue-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {a.type}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{a.date}</span>
                </div>
                <h3 className="font-extrabold text-[#09234B] text-base leading-snug mb-2">{a.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{a.content}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setDeletingNotice(a)}
                  className="px-3 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Course Modal */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-[#09234B]">Add Class Schedule</h3>
              <button onClick={() => setIsAddCourseModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  placeholder="e.g. Pure Mathematics (P1 – P4)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    placeholder="e.g. WMA11"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Stream Level</label>
                  <select
                    value={courseForm.grade}
                    onChange={(e) => setCourseForm({ ...courseForm, grade: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="Lower Secondary (Year 7–9)">Lower Secondary (Year 7–9)</option>
                    <option value="Pearson IGCSE">Pearson IGCSE</option>
                    <option value="Pearson IAL">Pearson IAL</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Category</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="STEM">STEM</option>
                    <option value="Business">Business</option>
                    <option value="Computing">Computing</option>
                    <option value="Languages">Languages</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Instructor</label>
                  <input
                    type="text"
                    value={courseForm.instructor}
                    onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                    placeholder="e.g. Dr. Htet Aung Lin"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Schedule Time</label>
                  <input
                    type="text"
                    value={courseForm.time}
                    onChange={(e) => setCourseForm({ ...courseForm, time: e.target.value })}
                    placeholder="e.g. Mon, Wed • 08:30 AM"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Room / Venue</label>
                  <input
                    type="text"
                    value={courseForm.room}
                    onChange={(e) => setCourseForm({ ...courseForm, room: e.target.value })}
                    placeholder="e.g. Newton Lab"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCourseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#09234B] text-white font-bold text-xs shadow-md"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-[#09234B]">Edit Class Schedule</h3>
              <button onClick={() => setEditingCourse(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveEditCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={editingCourse.name}
                  onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.code}
                    onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Stream Level</label>
                  <select
                    value={editingCourse.grade}
                    onChange={(e) => setEditingCourse({ ...editingCourse, grade: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="Lower Secondary (Year 7–9)">Lower Secondary (Year 7–9)</option>
                    <option value="Pearson IGCSE">Pearson IGCSE</option>
                    <option value="Pearson IAL">Pearson IAL</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Category</label>
                  <select
                    value={editingCourse.category}
                    onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="STEM">STEM</option>
                    <option value="Business">Business</option>
                    <option value="Computing">Computing</option>
                    <option value="Languages">Languages</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Instructor</label>
                  <input
                    type="text"
                    value={editingCourse.instructor}
                    onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Schedule Time</label>
                  <input
                    type="text"
                    value={editingCourse.time}
                    onChange={(e) => setEditingCourse({ ...editingCourse, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Room / Venue</label>
                  <input
                    type="text"
                    value={editingCourse.room || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, room: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#09234B] text-white font-bold text-xs shadow-md"
                >
                  Update Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Notice Modal */}
      {isAddNoticeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-[#09234B]">Post Bulletin Notice</h3>
              <button onClick={() => setIsAddNoticeModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="e.g. Pearson IAL May/June Examination Briefing"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Notice Type</label>
                  <select
                    value={noticeForm.type}
                    onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="Official Notice">Official Notice</option>
                    <option value="Academic">Academic</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Publish Date</label>
                  <input
                    type="date"
                    value={noticeForm.date}
                    onChange={(e) => setNoticeForm({ ...noticeForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Announcement Content *</label>
                <textarea
                  required
                  rows={4}
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  placeholder="Write the notice details here..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddNoticeModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#09234B] text-white font-bold text-xs shadow-md"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Course Modal */}
      {deletingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl mx-auto flex items-center justify-center text-rose-600 mb-4 border border-rose-200">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h3 className="text-lg font-black text-[#09234B]">Delete Course?</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to remove <strong>{deletingCourse.name}</strong> ({deletingCourse.code})?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeletingCourse(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Notice Modal */}
      {deletingNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl mx-auto flex items-center justify-center text-rose-600 mb-4 border border-rose-200">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h3 className="text-lg font-black text-[#09234B]">Delete Announcement?</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to remove <strong>{deletingNotice.title}</strong>?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeletingNotice(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNotice}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
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
