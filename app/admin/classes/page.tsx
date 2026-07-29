"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initialCourses = [
  { id: "1", name: "Advanced Mathematics", grade: "A-Level", time: "Mon, Wed, Fri - 9:00 AM", instructor: "Mr. Davis", desc: "Complex numbers, calculus, and advanced algebra." },
  { id: "2", name: "Physics", grade: "O-Level", time: "Tue, Thu - 10:30 AM", instructor: "Dr. Chen", desc: "Mechanics, waves, and introductory quantum physics." },
  { id: "3", name: "Computer Science", grade: "BCS Prep", time: "Mon, Wed - 1:00 PM", instructor: "Ms. Rahman", desc: "Algorithms, data structures, and Python programming." },
  { id: "4", name: "World Literature", grade: "A-Level", time: "Tue, Fri - 2:00 PM", instructor: "Mrs. Smith", desc: "Analysis of global literary masterpieces." },
  { id: "5", name: "Chemistry", grade: "O-Level", time: "Mon, Thu - 8:00 AM", instructor: "Dr. Patel", desc: "Organic and inorganic chemistry fundamentals." },
  { id: "6", name: "Economics", grade: "BCS Prep", time: "Wed, Fri - 11:00 AM", instructor: "Mr. Thompson", desc: "Micro and macroeconomics principles." },
];

const initialAnnouncements = [
  { id: 1, title: "Mid-term Examinations Schedule", date: "Oct 15, 2026", type: "Important", content: "The mid-term examinations will commence on November 1st. Detailed schedules will be emailed to parents." },
  { id: 2, title: "Science Fair Registration Open", date: "Oct 10, 2026", type: "Event", content: "Students interested in participating in the annual science fair must register by October 25th." },
  { id: 3, title: "New Library Hours", date: "Oct 5, 2026", type: "Notice", content: "The school library will now remain open until 6:00 PM on weekdays to support study groups." },
];

export default function AdminClassesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"courses" | "announcements">("courses");
  const [courses, setCourses] = useState(initialCourses);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnDate, setNewAnnDate] = useState("");
  const [newAnnType, setNewAnnType] = useState<"Important" | "Event" | "Notice">("Notice");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [editingAnnId, setEditingAnnId] = useState<number | null>(null);
  const [editAnnTitle, setEditAnnTitle] = useState("");
  const [editAnnDate, setEditAnnDate] = useState("");
  const [editAnnType, setEditAnnType] = useState<"Important" | "Event" | "Notice">("Notice");
  const [editAnnContent, setEditAnnContent] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleDeleteCourse = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleDeleteAnnouncement = (id: number) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleAddAnnouncement = () => {
    if (!newAnnTitle.trim() || !newAnnDate.trim() || !newAnnContent.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    const newId = Math.max(...announcements.map((a) => a.id), 0) + 1;
    setAnnouncements((prev) => [
      ...prev,
      { id: newId, title: newAnnTitle, date: newAnnDate, type: newAnnType, content: newAnnContent },
    ]);
    setNewAnnTitle("");
    setNewAnnDate("");
    setNewAnnType("Notice");
    setNewAnnContent("");
    setShowAddForm(false);
  };

  const handleStartEdit = (ann: (typeof announcements)[0]) => {
    setEditingAnnId(ann.id);
    setEditAnnTitle(ann.title);
    setEditAnnDate(ann.date);
    setEditAnnType(ann.type as "Important" | "Event" | "Notice");
    setEditAnnContent(ann.content);
  };

  const handleSaveEdit = () => {
    if (!editAnnTitle.trim() || !editAnnDate.trim() || !editAnnContent.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === editingAnnId
          ? { ...a, title: editAnnTitle, date: editAnnDate, type: editAnnType, content: editAnnContent }
          : a
      )
    );
    setEditingAnnId(null);
  };

  const handleCancelEdit = () => {
    setEditingAnnId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-oxford-blue dark:text-white">Classes Management</h1>
          <p className="text-on-surface-variant">Manage courses and announcements.</p>
        </div>
        <Link
          href="/admin/classes/new"
          className="bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue py-3 px-6 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add New Course
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-surface-variant/30 dark:bg-surface-variant/50 rounded-full max-w-xs">
        <button
          onClick={() => setActiveTab("courses")}
          className={`flex-1 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === "courses"
              ? "bg-white dark:bg-surface shadow-sm text-primary dark:text-primary-fixed"
              : "text-on-surface-variant hover:text-oxford-blue dark:hover:text-white"
          }`}
        >
          Courses
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={`flex-1 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === "announcements"
              ? "bg-white dark:bg-surface shadow-sm text-primary dark:text-primary-fixed"
              : "text-on-surface-variant hover:text-oxford-blue dark:hover:text-white"
          }`}
        >
          Announcements
        </button>
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div className="bg-surface dark:bg-surface-variant rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="p-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider">Name</th>
                  <th className="p-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider">Grade</th>
                  <th className="p-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider">Schedule</th>
                  <th className="p-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider">Instructor</th>
                  <th className="p-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-outline-variant/10 hover:bg-neutral-surface dark:hover:bg-black/20 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-oxford-blue dark:text-white">{course.name}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-academic-gold/10 text-academic-gold text-xs font-bold rounded-full">
                        {course.grade}
                      </span>
                    </td>
                    <td className="p-4 text-on-surface-variant text-sm">{course.time}</td>
                    <td className="p-4 text-on-surface-variant text-sm">{course.instructor}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/classes/${course.id}/edit`}
                          className="flex items-center gap-1 text-primary dark:text-primary-fixed text-sm font-bold hover:underline"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteCourse(course.id, course.name)}
                          className="flex items-center gap-1 text-red-500 text-sm font-bold hover:underline"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                          Delete
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

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddForm((prev) => !prev)}
              className="bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue py-2.5 px-5 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform inline-flex items-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-lg">{showAddForm ? "close" : "add"}</span>
              {showAddForm ? "Cancel" : "Add Announcement"}
            </button>
          </div>

          {/* Add Announcement Inline Form */}
          {showAddForm && (
            <div className="bg-surface dark:bg-surface-variant p-6 rounded-2xl shadow-sm border border-outline-variant/30 space-y-4">
              <h3 className="text-lg font-bold text-oxford-blue dark:text-white">New Announcement</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Title</label>
                  <input
                    type="text"
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                    placeholder="Announcement title"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Date</label>
                  <input
                    type="text"
                    value={newAnnDate}
                    onChange={(e) => setNewAnnDate(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                    placeholder="e.g. Oct 15, 2026"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Type</label>
                  <select
                    value={newAnnType}
                    onChange={(e) => setNewAnnType(e.target.value as "Important" | "Event" | "Notice")}
                    className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                  >
                    <option value="Notice">Notice</option>
                    <option value="Event">Event</option>
                    <option value="Important">Important</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Content</label>
                <textarea
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white resize-none"
                  placeholder="Announcement content"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-neutral-surface dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/5 border border-outline-variant/30 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors text-oxford-blue dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAnnouncement}
                  className="bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue py-2.5 px-6 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Announcements Table */}
          <div className="bg-surface dark:bg-surface-variant rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant/30">
                    <th className="p-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider">Title</th>
                    <th className="p-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider">Date</th>
                    <th className="p-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider">Type</th>
                    <th className="p-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider">Content</th>
                    <th className="p-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((ann) => (
                    <tr key={ann.id} className="border-b border-outline-variant/10 hover:bg-neutral-surface dark:hover:bg-black/20 transition-colors">
                      {editingAnnId === ann.id ? (
                        <>
                          <td className="p-2">
                            <input
                              type="text"
                              value={editAnnTitle}
                              onChange={(e) => setEditAnnTitle(e.target.value)}
                              className="w-full px-3 py-2 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white text-sm"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={editAnnDate}
                              onChange={(e) => setEditAnnDate(e.target.value)}
                              className="w-full px-3 py-2 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white text-sm"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={editAnnType}
                              onChange={(e) => setEditAnnType(e.target.value as "Important" | "Event" | "Notice")}
                              className="w-full px-3 py-2 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white text-sm"
                            >
                              <option value="Notice">Notice</option>
                              <option value="Event">Event</option>
                              <option value="Important">Important</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={editAnnContent}
                              onChange={(e) => setEditAnnContent(e.target.value)}
                              className="w-full px-3 py-2 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white text-sm"
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleSaveEdit}
                                className="flex items-center gap-1 text-primary dark:text-primary-fixed text-sm font-bold hover:underline"
                              >
                                <span className="material-symbols-outlined text-base">check</span>
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex items-center gap-1 text-on-surface-variant text-sm font-bold hover:underline"
                              >
                                <span className="material-symbols-outlined text-base">close</span>
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-4">
                            <p className="font-bold text-oxford-blue dark:text-white">{ann.title}</p>
                          </td>
                          <td className="p-4 text-on-surface-variant text-sm">{ann.date}</td>
                          <td className="p-4">
                            <span
                              className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                                ann.type === "Important"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-fixed"
                              }`}
                            >
                              {ann.type}
                            </span>
                          </td>
                          <td className="p-4 text-on-surface-variant text-sm max-w-xs truncate">{ann.content}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStartEdit(ann)}
                                className="flex items-center gap-1 text-primary dark:text-primary-fixed text-sm font-bold hover:underline"
                              >
                                <span className="material-symbols-outlined text-base">edit</span>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAnnouncement(ann.id)}
                                className="flex items-center gap-1 text-red-500 text-sm font-bold hover:underline"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
