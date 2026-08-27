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
import { authClient } from "@/lib/auth/auth-client";
import {
  getCourses,
  createCourseAction,
  updateCourseAction,
  deleteCourseAction,
  getBulletins,
  createBulletinAction,
  deleteBulletinAction,
} from "@/lib/actions/classes";
import {
  getSubjectCatalog,
  upsertSubjectCatalogAction,
  type SubjectEntry,
} from "@/lib/actions/siteContent";
import { DEFAULT_SUBJECT_CATALOG } from "@/lib/content/defaults";

export default function AdminClassesPage() {
  const [activeTab, setActiveTab] = useState<"courses" | "announcements" | "subjects">("courses");
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [announcements, setAnnouncements] = useState<BulletinNotice[]>([]);
  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);
  const [subjectsSaving, setSubjectsSaving] = useState(false);
  const [newSubjectForm, setNewSubjectForm] = useState({ name: "", track: "STEM" as SubjectEntry["track"], level: "Both" as SubjectEntry["level"], code: "" });
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
      const [coursesData, bulletinsData, subjectsData] = await Promise.all([
        getCourses().catch(() => []),
        getBulletins().catch(() => []),
        getSubjectCatalog().catch(() => DEFAULT_SUBJECT_CATALOG),
      ]);
      setCourses(coursesData.map(mapCourseRecord));
      setAnnouncements(bulletinsData.map(mapBulletinRecord));
      setSubjects(subjectsData);
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
    const newRecord: CourseItem = {
      id: newId,
      name: courseForm.name,
      code: courseForm.code,
      grade: courseForm.grade,
      category: courseForm.category,
      time: courseForm.time || "Mon, Wed, Fri • 10:00 AM",
      instructor: courseForm.instructor || "Faculty Lead",
      room: courseForm.room || "Room 101",
      isActive: true,
    };
    try {
      await createCourseAction(newRecord);
      setCourses((prev) => [newRecord, ...prev]);
      setIsAddCourseModalOpen(false);
      setCourseForm({
        name: "",
        code: "",
        grade: "Pearson IAL",
        category: "STEM",
        time: "",
        instructor: "",
        room: "",
      });
      showToast(`Course "${courseForm.name}" added successfully.`);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to add course."}`);
    }
  };

  const handleSaveEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      await updateCourseAction(editingCourse.id, editingCourse);
      setCourses((prev) =>
        prev.map((c) => (c.id === editingCourse.id ? editingCourse : c))
      );
      setEditingCourse(null);
      showToast(`Course "${editingCourse.name}" updated successfully.`);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to update course."}`);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;
    try {
      await deleteCourseAction(deletingCourse.id);
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
      const res = await createBulletinAction({
        title: noticeForm.title,
        date: noticeForm.date || new Date().toISOString().split("T")[0],
        type: noticeForm.type,
        content: noticeForm.content,
      });
      const newNotice: BulletinNotice = {
        id: res.id || Date.now(),
        title: noticeForm.title,
        date: noticeForm.date || new Date().toISOString().split("T")[0],
        type: noticeForm.type,
        content: noticeForm.content,
        isPinned: false,
      };
      setAnnouncements((prev) => [newNotice, ...prev]);
      setIsAddNoticeModalOpen(false);
      setNoticeForm({
        title: "",
        date: new Date().toISOString().split("T")[0],
        type: "Official Notice",
        content: "",
      });
      showToast("Announcement published.");
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to create announcement."}`);
    }
  };

  const handleDeleteNotice = async () => {
    if (!deletingNotice) return;
    try {
      await deleteBulletinAction(deletingNotice.id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== deletingNotice.id));
      showToast("Announcement removed.");
      setDeletingNotice(null);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to delete announcement."}`);
    }
  };

  // Actions - Subject Catalog
  const handleToggleSubjectActive = (id: string) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleAddSubject = () => {
    const name = newSubjectForm.name.trim();
    if (!name) return;
    const newEntry: SubjectEntry = {
      id: `s-${Date.now()}`,
      name,
      track: newSubjectForm.track,
      level: newSubjectForm.level,
      code: newSubjectForm.code.trim() || undefined,
      isActive: true,
    };
    setSubjects((prev) => [...prev, newEntry]);
    setNewSubjectForm({ name: "", track: "STEM", level: "Both", code: "" });
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveSubjectCatalog = async () => {
    setSubjectsSaving(true);
    try {
      const res = await upsertSubjectCatalogAction(subjects);
      showToast(res.message);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to save subject catalog."}`);
    } finally {
      setSubjectsSaving(false);
    }
  };

  const handleResetSubjectCatalog = async () => {
    const confirmed = window.confirm("Reset subject catalog to built-in defaults? This cannot be undone.");
    if (!confirmed) return;
    setSubjectsSaving(true);
    try {
      await upsertSubjectCatalogAction([]);
      setSubjects(DEFAULT_SUBJECT_CATALOG);
      showToast("Subject catalog reset to defaults.");
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to reset."}`);
    } finally {
      setSubjectsSaving(false);
    }
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 bg-[#09234B] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#FFC700]/30 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <span aria-hidden="true" className="material-symbols-outlined text-[#FFC700]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0E3B7D]">Classes &amp; Syllabi</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0E3B7D] font-extrabold text-xs">
              Pearson Edexcel
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage course timetables, instructor assignments, rooms, and academic bulletin notices.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === "courses"
                ? "bg-[#0E3B7D] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">menu_book</span>
            <span>Courses ({courses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === "announcements"
                ? "bg-[#0E3B7D] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">campaign</span>
            <span>Bulletins ({announcements.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("subjects")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === "subjects"
                ? "bg-[#FFC700] text-[#09234B] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">science</span>
            <span>Subjects ({subjects.filter((s) => s.isActive).length} active)</span>
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
              activeTab === "courses" ? "Search course name, code, teacher..." : "Search bulletins..."
            }
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
        </div>

        {activeTab === "courses" ? (
          <button
            onClick={() => setIsAddCourseModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">add_circle</span>
            <span>Add New Course</span>
          </button>
        ) : (
          isAdmin && (
            <button
              onClick={() => setIsAddNoticeModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">campaign</span>
              <span>Publish Notice</span>
            </button>
          )
        )}
      </div>

      {/* COURSES TAB */}
      {activeTab === "courses" && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Course Name &amp; Code</th>
                  <th className="p-4">Grade / Level</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Faculty Instructor</th>
                  <th className="p-4">Room</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No courses found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <span className="inline-block font-mono text-[10px] text-[#0E3B7D] bg-blue-50 px-2 py-0.5 rounded font-bold mt-0.5">
                          {c.code}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          {c.grade}
                        </span>
                      </td>
                      <td className="p-4">{c.time}</td>
                      <td className="p-4 font-semibold text-slate-800">{c.instructor}</td>
                      <td className="p-4 text-slate-500">{c.room || "Lab"}</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button aria-label="Edit"
                            onClick={() => setEditingCourse(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0E3B7D] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Timetable"
                          >
                            <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
                          </button>
                          {isAdmin && (
                            <button aria-label="Delete"
                              onClick={() => setDeletingCourse(c)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Course"
                            >
                              <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === "announcements" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAnnouncements.map((notice) => (
            <div
              key={notice.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      notice.type === "Official Notice"
                        ? "bg-red-100 text-red-800"
                        : notice.type === "Academic"
                        ? "bg-blue-100 text-[#0E3B7D]"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {notice.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{notice.date}</span>
                </div>
                <h3 className="text-base font-black text-[#09234B] mt-2">{notice.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{notice.content}</p>
              </div>

              {isAdmin && (
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button aria-label="Delete"
                    onClick={() => setDeletingNotice(notice)}
                    className="px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">delete</span>
                    <span>Remove</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ADD COURSE MODAL */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-[#09234B]">Add Class Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure Mathematics (P1–P4)"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Syllabus Code</label>
                  <input
                    type="text"
                    required
                    placeholder="WMA11 / 4CP0"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category Stream</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="STEM">STEM</option>
                    <option value="Business">Business</option>
                    <option value="Computing">Computing</option>
                    <option value="Languages">Languages</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Grade Continuum</label>
                <select
                  value={courseForm.grade}
                  onChange={(e) => setCourseForm({ ...courseForm, grade: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Lower Secondary (Year 7–9)">Lower Secondary (Year 7–9)</option>
                  <option value="Pearson IGCSE">Pearson IGCSE</option>
                  <option value="Pearson IAL">Pearson IAL</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="course-days" className="font-bold text-slate-700 block mb-1">Class Days</label>
                  <input
                    id="course-days"
                    type="text"
                    required
                    placeholder="Mon, Wed, Fri"
                    value={(courseForm.time.split("•")[0] || "").trim()}
                    onChange={(e) => {
                      const time = (courseForm.time.split("•")[1] || "").trim();
                      setCourseForm({ ...courseForm, time: [e.target.value.trim(), time].filter(Boolean).join(" • ") });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label htmlFor="course-time" className="font-bold text-slate-700 block mb-1">Start Time</label>
                  <input
                    id="course-time"
                    type="time"
                    required
                    value={(courseForm.time.split("•")[1] || "").trim()}
                    onChange={(e) => {
                      const days = (courseForm.time.split("•")[0] || "").trim();
                      setCourseForm({ ...courseForm, time: [days, e.target.value].filter(Boolean).join(" • ") });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="course-room" className="font-bold text-slate-700 block mb-1">Room / Lab</label>
                  <input
                    id="course-room"
                    type="text"
                    placeholder="Newton Science Lab"
                    value={courseForm.room}
                    onChange={(e) => setCourseForm({ ...courseForm, room: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Faculty Instructor</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Kaung Myat Htut"
                  value={courseForm.instructor}
                  onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0E3B7D] text-white font-bold"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-[#09234B]">Edit Class Schedule</h2>
            <form onSubmit={handleSaveEditCourse} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={editingCourse.name}
                  onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Syllabus Code</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.code}
                    onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category Stream</label>
                  <select
                    value={editingCourse.category}
                    onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="STEM">STEM</option>
                    <option value="Business">Business</option>
                    <option value="Computing">Computing</option>
                    <option value="Languages">Languages</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-course-days" className="font-bold text-slate-700 block mb-1">Class Days</label>
                  <input
                    id="edit-course-days"
                    type="text"
                    required
                    value={(editingCourse.time.split("•")[0] || "").trim()}
                    onChange={(e) => {
                      const time = (editingCourse.time.split("•")[1] || "").trim();
                      setEditingCourse({ ...editingCourse, time: [e.target.value.trim(), time].filter(Boolean).join(" • ") });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label htmlFor="edit-course-time" className="font-bold text-slate-700 block mb-1">Start Time</label>
                  <input
                    id="edit-course-time"
                    type="time"
                    required
                    value={(editingCourse.time.split("•")[1] || "").trim()}
                    onChange={(e) => {
                      const days = (editingCourse.time.split("•")[0] || "").trim();
                      setEditingCourse({ ...editingCourse, time: [days, e.target.value].filter(Boolean).join(" • ") });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-course-room" className="font-bold text-slate-700 block mb-1">Room / Lab</label>
                  <input
                    id="edit-course-room"
                    type="text"
                    value={editingCourse.room || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, room: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Faculty Instructor</label>
                <input
                  type="text"
                  required
                  value={editingCourse.instructor}
                  onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
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

      {/* ADD NOTICE MODAL */}
      {isAddNoticeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-[#09234B]">Publish Bulletin Notice</h2>
            <form onSubmit={handleCreateNotice} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pearson Exam Timetable Released"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category Type</label>
                  <select
                    value={noticeForm.type}
                    onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Official Notice">Official Notice</option>
                    <option value="Academic">Academic</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Effective Date</label>
                  <input
                    type="date"
                    required
                    value={noticeForm.date}
                    onChange={(e) => setNoticeForm({ ...noticeForm, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notice Body Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed announcement notes..."
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddNoticeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0E3B7D] text-white font-bold"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECTS CATALOG TAB */}
      {activeTab === "subjects" && (
        <div className="space-y-4">
          {/* Subject catalog header */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-[#09234B]">Master Subject Catalog</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  These subjects appear as selectable options in the public Admission Form (Step 2) and in the admin Admissions edit modal.
                  Toggle active/inactive to control visibility, then click <strong>Save Catalog</strong>.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetSubjectCatalog}
                  disabled={subjectsSaving}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">restart_alt</span>
                  <span>Reset to Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveSubjectCatalog}
                  disabled={subjectsSaving}
                  className="px-4 py-2 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-black text-xs transition-all shadow-sm disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
                >
                  {subjectsSaving ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true" className="material-symbols-outlined text-sm">save</span>
                      <span>Save Catalog</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Subject list */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-3 pl-5">Subject Name</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Track</th>
                    <th className="p-3">Level</th>
                    <th className="p-3 text-center">Active</th>
                    <th className="p-3 pr-5 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {subjects.map((s) => (
                    <tr key={s.id} className={`hover:bg-slate-50/60 transition-colors ${!s.isActive ? "opacity-50" : ""}`}>
                      <td className="p-3 pl-5 font-semibold text-slate-900">{s.name}</td>
                      <td className="p-3">
                        {s.code ? (
                          <span className="font-mono text-[10px] bg-blue-50 text-[#0E3B7D] px-2 py-0.5 rounded font-bold">{s.code}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.track === "STEM" ? "bg-blue-50 text-blue-800" :
                          s.track === "Business" ? "bg-amber-50 text-amber-800" :
                          s.track === "Computing" ? "bg-purple-50 text-purple-800" :
                          s.track === "Languages" ? "bg-emerald-50 text-emerald-800" :
                          "bg-slate-100 text-slate-600"
                        }`}>{s.track}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.level === "IGCSE" ? "bg-indigo-50 text-indigo-800" :
                          s.level === "IAL" ? "bg-rose-50 text-rose-800" :
                          s.level === "Both" ? "bg-teal-50 text-teal-800" :
                          "bg-slate-100 text-slate-600"
                        }`}>{s.level}</span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSubjectActive(s.id)}
                          aria-pressed={s.isActive}
                          className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${s.isActive ? "bg-[#0E3B7D]" : "bg-slate-300"}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${s.isActive ? "left-5" : "left-0.5"}`} />
                        </button>
                      </td>
                      <td className="p-3 pr-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(s.id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          aria-label={`Remove ${s.name}`}
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add new subject form */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Add New Subject to Catalog</p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex-1 min-w-[140px]">
                  <input
                    type="text"
                    placeholder="Subject name..."
                    value={newSubjectForm.name}
                    onChange={(e) => setNewSubjectForm({ ...newSubjectForm, name: e.target.value })}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSubject(); } }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Code (e.g. 4PH1)"
                    value={newSubjectForm.code}
                    onChange={(e) => setNewSubjectForm({ ...newSubjectForm, code: e.target.value })}
                    className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>

                <select
                  value={newSubjectForm.track}
                  onChange={(e) => setNewSubjectForm({ ...newSubjectForm, track: e.target.value as SubjectEntry["track"] })}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                >
                  <option value="STEM">STEM</option>
                  <option value="Business">Business</option>
                  <option value="Computing">Computing</option>
                  <option value="Languages">Languages</option>
                  <option value="General">General</option>
                </select>
                <select
                  value={newSubjectForm.level}
                  onChange={(e) => setNewSubjectForm({ ...newSubjectForm, level: e.target.value as SubjectEntry["level"] })}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                >
                  <option value="IGCSE">IGCSE</option>
                  <option value="IAL">IAL</option>
                  <option value="Both">Both</option>
                  <option value="Lower Secondary">Lower Secondary</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddSubject}
                  disabled={!newSubjectForm.name.trim()}
                  className="px-4 py-2 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black text-xs rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">add_circle</span>
                  <span>Add Subject</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE NOTICES / COURSE CONFIRM */}

      {deletingNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-[#09234B]">Delete Notice?</h3>
            <p className="text-xs text-slate-600">Are you sure you want to remove this bulletin announcement?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingNotice(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteNotice}
                className="px-4 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-[#09234B]">Delete Course?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to remove <strong>{deletingCourse.name}</strong> from syllabus schedules?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCourse(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCourse}
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
