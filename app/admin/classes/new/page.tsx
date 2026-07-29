"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("A-Level");
  const [time, setTime] = useState("");
  const [instructor, setInstructor] = useState("");
  const [desc, setDesc] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Course created successfully!");
    router.push("/admin/classes");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/classes"
          className="inline-flex items-center gap-1 text-sm font-bold text-primary dark:text-primary-fixed hover:underline mb-4"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Classes
        </Link>
        <h1 className="text-2xl font-bold text-oxford-blue dark:text-white">Add New Course</h1>
        <p className="text-on-surface-variant">Create a new course for the academic program.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface dark:bg-surface-variant p-6 rounded-2xl shadow-sm border border-outline-variant/30 space-y-5">
        <div>
          <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Course Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
            placeholder="e.g. Advanced Mathematics"
            required
          />
        </div>

        <div>
          <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Grade</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
          >
            <option value="A-Level">A-Level</option>
            <option value="O-Level">O-Level</option>
            <option value="BCS Prep">BCS Prep</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Schedule</label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
            placeholder="e.g. Mon, Wed, Fri - 9:00 AM"
            required
          />
        </div>

        <div>
          <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Instructor</label>
          <input
            type="text"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
            placeholder="e.g. Mr. Davis"
            required
          />
        </div>

        <div>
          <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Description</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white resize-none"
            placeholder="Course description..."
            required
          />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue py-3 px-8 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Create Course
          </button>
          <Link
            href="/admin/classes"
            className="bg-neutral-surface dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/5 border border-outline-variant/30 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors text-oxford-blue dark:text-white"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
