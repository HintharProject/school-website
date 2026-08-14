"use client";

import { useState } from "react";
import Link from "next/link";

interface CourseItem {
  id: string;
  name: string;
  code: string;
  grade: "Lower Secondary (Year 7–9)" | "Pearson IGCSE" | "Pearson IAL";
  category: "STEM" | "Business" | "Computing" | "Languages";
  time: string;
  instructor: string;
}

const initialCourses: CourseItem[] = [
  { id: "1", name: "Pure Mathematics (P1–P4)", code: "WMA11 / WMA12", grade: "Pearson IAL", category: "STEM", time: "Mon, Wed, Fri - 8:30 AM", instructor: "Dr. Kaung Myat Htut & U Than Win" },
  { id: "2", name: "Advanced Physics & Practical Lab", code: "WPH11 / WPH14", grade: "Pearson IAL", category: "STEM", time: "Tue, Thu - 10:30 AM", instructor: "Dr. Htet Aung Lin" },
  { id: "3", name: "Pearson IGCSE Computer Science", code: "4CP0", grade: "Pearson IGCSE", category: "Computing", time: "Mon, Thu - 1:00 PM", instructor: "Daw May Zin Thet" },
  { id: "4", name: "Pearson IGCSE Chemistry & Biology", code: "4CH1 / 4BI1", grade: "Pearson IGCSE", category: "STEM", time: "Mon, Wed, Fri - 10:30 AM", instructor: "Dr. Su Mon Kyaw" },
  { id: "5", name: "Economics & Business Studies", code: "4EC1 / 4BS1", grade: "Pearson IGCSE", category: "Business", time: "Tue, Thu - 2:00 PM", instructor: "U Myo Min Tun (MBA)" },
  { id: "6", name: "Lower Secondary STEM & Math Discovery", code: "SEC-MATH-08", grade: "Lower Secondary (Year 7–9)", category: "STEM", time: "Daily - 9:00 AM", instructor: "Tr. Rachel Evans" },
  { id: "7", name: "Lower Secondary English & Perspectives", code: "SEC-ENG-09", grade: "Lower Secondary (Year 7–9)", category: "Languages", time: "Daily - 11:00 AM", instructor: "Tr. Sarah Jenkins" },
];

const initialAnnouncements = [
  { id: 1, title: "Pearson Edexcel Oct/Nov 2026 Registration", date: "Aug 20, 2026", type: "Important", content: "All candidate entries for upcoming Pearson Edexcel examination series must be confirmed through the exam officer." },
  { id: 2, title: "Science & Engineering Practical Schedule", date: "Aug 15, 2026", type: "Academic", content: "Physics and Chemistry practical lab sessions for AS & A2 students commence in Newton Lab this week." },
  { id: 3, title: "Parent-Teacher Consultations (Year 7–13)", date: "Aug 10, 2026", type: "Notice", content: "Individual consultations with faculty subject leads will take place on campus on Saturday, August 29th." },
];

export default function AdminClassesPage() {
  const [activeTab, setActiveTab] = useState<"courses" | "announcements">("courses");
  const [courses, setCourses] = useState(initialCourses);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

  const [showAddAnn, setShowAddAnn] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnDate, setNewAnnDate] = useState("");
  const [newAnnType, setNewAnnType] = useState("Notice");
  const [newAnnContent, setNewAnnContent] = useState("");

  const handleDeleteCourse = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the active curriculum timetable?`)) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleDeleteAnnouncement = (id: number) => {
    if (window.confirm("Are you sure you want to delete this bulletin notice?")) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;
    const newId = Date.now();
    setAnnouncements((prev) => [
      {
        id: newId,
        title: newAnnTitle,
        date: newAnnDate || "Today",
        type: newAnnType,
        content: newAnnContent,
      },
      ...prev,
    ]);
    setNewAnnTitle("");
    setNewAnnDate("");
    setNewAnnContent("");
    setShowAddAnn(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-3 py-1 rounded-full mb-1.5 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-xs font-bold">menu_book</span>
            <span className="text-[10px] font-black text-[#0E3B7D] uppercase tracking-wider">
              Academic Curriculums &amp; Notices
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#09234B] tracking-tight">Classes &amp; Timetables</h1>
          <p className="text-xs text-slate-500 font-normal">
            Manage course schedules, instructor assignments, and official Pearson Edexcel bulletins
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 bg-white border border-slate-200 rounded-full shadow-sm">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "courses"
                ? "bg-[#0E3B7D] text-white shadow-sm font-black"
                : "text-slate-600 hover:text-[#0E3B7D]"
            }`}
          >
            Course Schedules ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "announcements"
                ? "bg-[#0E3B7D] text-white shadow-sm font-black"
                : "text-slate-600 hover:text-[#0E3B7D]"
            }`}
          >
            Bulletins &amp; Notices ({announcements.length})
          </button>
        </div>
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Course Name &amp; Code</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Academic Grade</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Weekly Schedule</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Faculty Instructor</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
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
                    <td className="px-5 py-4 text-slate-600 font-medium">{course.time}</td>
                    <td className="px-5 py-4 text-slate-700 font-bold">{course.instructor}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDeleteCourse(course.id, course.name)}
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
      )}

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">
              Official school notifications displayed on the public classes page.
            </span>
            <button
              onClick={() => setShowAddAnn(true)}
              className="px-4 py-2 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              <span>Post New Bulletin</span>
            </button>
          </div>

          {/* Add Notice Modal / Inline Form */}
          {showAddAnn && (
            <form onSubmit={handleAddAnnouncement} className="bg-white p-6 rounded-2xl border border-[#0E3B7D]/30 shadow-md space-y-4">
              <h3 className="text-sm font-black text-[#09234B] uppercase tracking-wider">
                Create New Academic Bulletin
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Notice Title *</label>
                  <input
                    type="text"
                    required
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    placeholder="e.g. October Exam Registration"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Category Badge</label>
                  <select
                    value={newAnnType}
                    onChange={(e) => setNewAnnType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="Important">Official Notice</option>
                    <option value="Academic">Academic Schedule</option>
                    <option value="Notice">General Bulletin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Content Details *</label>
                <textarea
                  required
                  rows={3}
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  placeholder="Detailed announcement text for parents and students..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D] resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAnn(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] uppercase tracking-wider rounded-xl shadow-sm transition-all"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          )}

          {/* Announcements List */}
          <div className="grid grid-cols-1 gap-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#E8F0FE] text-[#0E3B7D]">
                      {ann.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{ann.date}</span>
                  </div>
                  <h4 className="text-sm font-black text-[#09234B]">{ann.title}</h4>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">{ann.content}</p>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                  title="Delete Bulletin"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
