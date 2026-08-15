"use client";

import { useState, useEffect } from "react";
import {
  CourseItem,
  BulletinNotice,
  getStoredCourses,
  saveStoredCourses,
  getStoredBulletins,
  saveStoredBulletins,
} from "../adminStore";

export default function AdminClassesPage() {
  const [activeTab, setActiveTab] = useState<"courses" | "announcements">("courses");
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [announcements, setAnnouncements] = useState<BulletinNotice[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
    date: "",
    type: "Official Notice" as "Official Notice" | "Academic" | "General",
    content: "",
  });

  useEffect(() => {
    setCourses(getStoredCourses());
    setAnnouncements(getStoredBulletins());
    setIsLoaded(true);

    const handleCoursesUpdate = () => setCourses(getStoredCourses());
    const handleBulletinsUpdate = () => setAnnouncements(getStoredBulletins());

    window.addEventListener("his_courses_updated", handleCoursesUpdate);
    window.addEventListener("his_bulletins_updated", handleBulletinsUpdate);

    return () => {
      window.removeEventListener("his_courses_updated", handleCoursesUpdate);
      window.removeEventListener("his_bulletins_updated", handleBulletinsUpdate);
    };
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
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.name.trim() || !courseForm.code.trim()) return;

    const newRecord: CourseItem = {
      id: Date.now().toString(),
      name: courseForm.name,
      code: courseForm.code,
      grade: courseForm.grade,
      category: courseForm.category,
      time: courseForm.time || "Mon, Wed, Fri - 10:00 AM",
      instructor: courseForm.instructor,
      room: courseForm.room || "Room 101",
    };

    const updated = [newRecord, ...courses];
    setCourses(updated);
    saveStoredCourses(updated);
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
  };

  const handleSaveEditCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const updated = courses.map((c) =>
      c.id === editingCourse.id ? editingCourse : c
    );
    setCourses(updated);
    saveStoredCourses(updated);
    setEditingCourse(null);
  };

  const handleConfirmDeleteCourse = () => {
    if (!deletingCourse) return;
    const updated = courses.filter((c) => c.id !== deletingCourse.id);
    setCourses(updated);
    saveStoredCourses(updated);
    setDeletingCourse(null);
  };

  // Actions - Announcements
  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) return;

    const newRecord: BulletinNotice = {
      id: Date.now(),
      title: noticeForm.title,
      date: noticeForm.date || "Today",
      type: noticeForm.type,
      content: noticeForm.content,
    };

    const updated = [newRecord, ...announcements];
    setAnnouncements(updated);
    saveStoredBulletins(updated);
    setIsAddNoticeModalOpen(false);
    setNoticeForm({
      title: "",
      date: "",
      type: "Official Notice",
      content: "",
    });
  };

  const handleConfirmDeleteNotice = () => {
    if (!deletingNotice) return;
    const updated = announcements.filter((a) => a.id !== deletingNotice.id);
    setAnnouncements(updated);
    saveStoredBulletins(updated);
    setDeletingNotice(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-3.5 py-1 rounded-full mb-2 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-xs font-bold">menu_book</span>
            <span className="text-[11px] font-black text-[#0E3B7D] uppercase tracking-wider">
              Academic Timetable &amp; Exam Bulletins
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#09234B] tracking-tight">
            Classes &amp; Syllabi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Manage course schedules, instructor assignments, classroom allocations, and official Pearson Edexcel bulletins
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "courses"
                ? "bg-[#0E3B7D] text-white shadow-xs font-black"
                : "text-slate-600 hover:text-[#0E3B7D]"
            }`}
          >
            Course Schedules ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "announcements"
                ? "bg-[#0E3B7D] text-white shadow-xs font-black"
                : "text-slate-600 hover:text-[#0E3B7D]"
            }`}
          >
            Bulletins ({announcements.length})
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "courses"
                ? "Search course, code, or faculty..."
                : "Search academic bulletin notice..."
            }
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
        </div>

        {activeTab === "courses" ? (
          <button
            onClick={() => setIsAddCourseModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            <span>Add New Course</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAddNoticeModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-sm font-bold">campaign</span>
            <span>Post New Bulletin</span>
          </button>
        )}
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Course Name &amp; Code</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Academic Grade</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Weekly Schedule &amp; Room</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Faculty Instructor</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoaded && filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-black text-sm text-[#09234B]">{course.name}</p>
                        <span className="font-mono text-[10px] text-slate-400 font-bold">{course.code}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-[#E8F0FE] text-[#0E3B7D] text-[10px] font-black rounded-md uppercase tracking-wider">
                          {course.grade}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-slate-700 font-medium">{course.time}</p>
                        {course.room && (
                          <span className="text-[10px] text-slate-400 font-medium">📍 {course.room}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-bold">{course.instructor}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingCourse({ ...course })}
                            className="p-1.5 text-slate-500 hover:text-[#0E3B7D] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Course"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => setDeletingCourse(course)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Course"
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
                      <p className="text-slate-500 font-medium">No courses found matching criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulletins Tab */}
      {activeTab === "announcements" && (
        <div className="grid grid-cols-1 gap-4">
          {isLoaded && filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#E8F0FE] text-[#0E3B7D]">
                      {ann.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{ann.date}</span>
                  </div>
                  <h4 className="text-base font-black text-[#09234B]">{ann.title}</h4>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">{ann.content}</p>
                </div>
                <button
                  onClick={() => setDeletingNotice(ann)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                  title="Delete Bulletin"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">campaign</span>
              <p className="text-slate-500 font-medium">No official bulletins found.</p>
            </div>
          )}
        </div>
      )}

      {/* 1. ADD COURSE MODAL */}
      {isAddCourseModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddCourseModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddCourseModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0E3B7D]">
                Academic Curriculum
              </span>
              <h3 className="text-xl font-black text-[#09234B] mt-1">Add New Course Module</h3>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    placeholder="e.g. Pure Mathematics (P1–P4)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Module Code *</label>
                  <input
                    type="text"
                    required
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    placeholder="e.g. WMA11 / WMA12"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Academic Tier *</label>
                  <select
                    value={courseForm.grade}
                    onChange={(e) => setCourseForm({ ...courseForm, grade: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="Pearson IAL">Pearson IAL (A-Level)</option>
                    <option value="Pearson IGCSE">Pearson IGCSE</option>
                    <option value="Lower Secondary (Year 7–9)">Lower Secondary (Year 7–9)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Subject Area *</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="STEM">STEM &amp; Sciences</option>
                    <option value="Computing">Computing &amp; IT</option>
                    <option value="Business">Economics &amp; Business</option>
                    <option value="Languages">Languages &amp; Arts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Faculty Instructor *</label>
                  <input
                    type="text"
                    required
                    value={courseForm.instructor}
                    onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                    placeholder="e.g. Dr. Kaung Myat Htut"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Weekly Time Slot</label>
                  <input
                    type="text"
                    value={courseForm.time}
                    onChange={(e) => setCourseForm({ ...courseForm, time: e.target.value })}
                    placeholder="e.g. Mon, Wed, Fri - 8:30 AM"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Classroom / Lab</label>
                <input
                  type="text"
                  value={courseForm.room}
                  onChange={(e) => setCourseForm({ ...courseForm, room: e.target.value })}
                  placeholder="e.g. Newton Hall 101"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCourseModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all"
                >
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT COURSE MODAL */}
      {editingCourse && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingCourse(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingCourse(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="mb-5">
              <h3 className="text-xl font-black text-[#09234B]">Edit Course Module</h3>
            </div>

            <form onSubmit={handleSaveEditCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.name}
                    onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Module Code</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.code}
                    onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Faculty Instructor</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.instructor}
                    onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Schedule Slot</label>
                  <input
                    type="text"
                    value={editingCourse.time}
                    onChange={(e) => setEditingCourse({ ...editingCourse, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Room Allocation</label>
                <input
                  type="text"
                  value={editingCourse.room || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, room: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
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

      {/* 3. DELETE COURSE MODAL */}
      {deletingCourse && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingCourse(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl font-bold">delete_forever</span>
            </div>
            <h3 className="text-lg font-black text-[#09234B]">Remove Course Module</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Remove <strong>{deletingCourse.name}</strong> ({deletingCourse.code}) from active timetable?
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={() => setDeletingCourse(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteCourse}
                className="px-5 py-2 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white uppercase tracking-wider rounded-xl shadow-xs transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ADD NOTICE MODAL */}
      {isAddNoticeModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddNoticeModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddNoticeModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0E3B7D]">
                Academic Bulletin
              </span>
              <h3 className="text-xl font-black text-[#09234B] mt-1">Publish Notice</h3>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Notice Headline *</label>
                <input
                  type="text"
                  required
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="e.g. October Exam Series Registration"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Notice Category</label>
                  <select
                    value={noticeForm.type}
                    onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="Official Notice">Official Notice</option>
                    <option value="Academic">Academic Schedule</option>
                    <option value="General">General Bulletin</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Display Date</label>
                  <input
                    type="text"
                    value={noticeForm.date}
                    onChange={(e) => setNoticeForm({ ...noticeForm, date: e.target.value })}
                    placeholder="e.g. Aug 25, 2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Notice Details *</label>
                <textarea
                  required
                  rows={3}
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  placeholder="Complete announcement text..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddNoticeModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. DELETE NOTICE MODAL */}
      {deletingNotice && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingNotice(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl font-bold">delete_forever</span>
            </div>
            <h3 className="text-lg font-black text-[#09234B]">Delete Bulletin Notice</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to delete <strong>&ldquo;{deletingNotice.title}&rdquo;</strong>?
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={() => setDeletingNotice(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteNotice}
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
