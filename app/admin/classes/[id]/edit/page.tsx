"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const mockCourses: Record<string, { name: string; grade: string; time: string; instructor: string; desc: string }> = {
  "1": { name: "Advanced Mathematics", grade: "A-Level", time: "Mon, Wed, Fri - 9:00 AM", instructor: "Mr. Davis", desc: "Complex numbers, calculus, and advanced algebra." },
  "2": { name: "Physics", grade: "O-Level", time: "Tue, Thu - 10:30 AM", instructor: "Dr. Chen", desc: "Mechanics, waves, and introductory quantum physics." },
  "3": { name: "Computer Science", grade: "BCS Prep", time: "Mon, Wed - 1:00 PM", instructor: "Ms. Rahman", desc: "Algorithms, data structures, and Python programming." },
  "4": { name: "World Literature", grade: "A-Level", time: "Tue, Fri - 2:00 PM", instructor: "Mrs. Smith", desc: "Analysis of global literary masterpieces." },
  "5": { name: "Chemistry", grade: "O-Level", time: "Mon, Thu - 8:00 AM", instructor: "Dr. Patel", desc: "Organic and inorganic chemistry fundamentals." },
  "6": { name: "Economics", grade: "BCS Prep", time: "Wed, Fri - 11:00 AM", instructor: "Mr. Thompson", desc: "Micro and macroeconomics principles." },
};

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const course = mockCourses[id];

  const [name, setName] = useState(course?.name ?? "");
  const [grade, setGrade] = useState(course?.grade ?? "A-Level");
  const [time, setTime] = useState(course?.time ?? "");
  const [instructor, setInstructor] = useState(course?.instructor ?? "");
  const [desc, setDesc] = useState(course?.desc ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Course updated successfully!");
    router.push("/admin/classes");
  };

  if (!course) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">error</span>
        <h1 className="text-2xl font-bold text-oxford-blue dark:text-white mb-2">Course Not Found</h1>
        <p className="text-on-surface-variant mb-6">The course with ID &quot;{id}&quot; does not exist.</p>
        <Link
          href="/admin/classes"
          className="bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue py-3 px-8 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Classes
        </Link>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-oxford-blue dark:text-white">Edit Course</h1>
        <p className="text-on-surface-variant">Update course details for &quot;{course.name}&quot;.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface dark:bg-surface-variant p-6 rounded-2xl shadow-sm border border-outline-variant/30 space-y-5">
        <div>
          <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Course Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
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
            required
          />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue py-3 px-8 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Update Course
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
