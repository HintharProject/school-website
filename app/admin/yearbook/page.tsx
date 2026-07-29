"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface YearbookStudentEntry {
  id: number;
  name: string;
  category: string;
  role: string;
  quote: string;
  image: string;
  type: "student";
}

interface YearbookEventEntry {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  type: "event";
}

type YearbookEntry = YearbookStudentEntry | YearbookEventEntry;

const initialEntries: YearbookEntry[] = [
  {
    id: 1,
    name: "Alex Johnson",
    category: "Class of 2023",
    role: "Valedictorian",
    quote: "The future belongs to those who prepare for it today.",
    image: "https://lh3.googleusercontent.com/aida/placeholder",
    type: "student",
  },
  {
    id: 2,
    name: "Sarah Lin",
    category: "Class of 2024",
    role: "Student Council President",
    quote: "Leadership is an action, not a position.",
    image: "https://lh3.googleusercontent.com/aida/placeholder",
    type: "student",
  },
  {
    id: 3,
    title: "Regional Science Fair Winners",
    category: "Science Fair",
    description: "Our robotics team took 1st place in the regional competition.",
    image: "https://lh3.googleusercontent.com/aida/placeholder",
    type: "event",
  },
  {
    id: 4,
    title: "Annual Sports Meet",
    category: "Sports",
    description: "Blue house emerged victorious after a highly competitive weekend.",
    image: "https://lh3.googleusercontent.com/aida/placeholder",
    type: "event",
  },
  {
    id: 5,
    name: "Michael Chang",
    category: "Class of 2023",
    role: "Captain, Debate Team",
    quote: "Words have the power to change the world.",
    image: "/images/graduation.png",
    type: "student",
  },
  {
    id: 6,
    title: "Spring Art Exhibition",
    category: "Arts",
    description: "Showcasing the incredible talent of our senior artists.",
    image: "https://lh3.googleusercontent.com/aida/placeholder",
    type: "event",
  },
  {
    id: 7,
    name: "Emily Watson",
    category: "Class of 2024",
    role: "Head Prefect",
    quote: "Excellence is not a skill, it is an attitude.",
    image: "https://lh3.googleusercontent.com/aida/placeholder",
    type: "student",
  },
  {
    id: 8,
    title: "Science Fair Grand Prize",
    category: "Science Fair",
    description: "Innovative water purification project wins national recognition.",
    image: "https://lh3.googleusercontent.com/aida/placeholder",
    type: "event",
  },
];

export default function YearbookManagementPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<YearbookEntry[]>(initialEntries);

  const handleDelete = (id: number) => {
    const entry = entries.find((e) => e.id === id);
    const label = entry?.type === "student" ? entry.name : (entry as YearbookEventEntry).title;
    if (window.confirm(`Are you sure you want to delete "${label}"? This action cannot be undone.`)) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-oxford-blue dark:text-white">Yearbook Management</h1>
          <p className="text-on-surface-variant">Manage yearbook entries, students, and events.</p>
        </div>
        <Link
          href="/admin/yearbook/new"
          className="bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue py-3 px-6 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add New Entry
        </Link>
      </div>

      {/* Table */}
      <div className="bg-surface dark:bg-surface-variant p-6 rounded-2xl shadow-sm border border-outline-variant/30">
        {entries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="text-sm font-bold text-on-surface-variant uppercase tracking-wider pb-4 pr-4">Name / Title</th>
                  <th className="text-sm font-bold text-on-surface-variant uppercase tracking-wider pb-4 pr-4">Category</th>
                  <th className="text-sm font-bold text-on-surface-variant uppercase tracking-wider pb-4 pr-4">Type</th>
                  <th className="text-sm font-bold text-on-surface-variant uppercase tracking-wider pb-4 pr-4">Role</th>
                  <th className="text-sm font-bold text-on-surface-variant uppercase tracking-wider pb-4 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-outline-variant/10 hover:bg-neutral-surface dark:hover:bg-black/20 transition-colors"
                  >
                    <td className="py-4 pr-4">
                      <span className="font-bold text-oxford-blue dark:text-white">
                        {entry.type === "student" ? entry.name : (entry as YearbookEventEntry).title}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-block bg-primary/10 text-primary dark:text-primary-fixed text-xs font-bold px-3 py-1 rounded-full">
                        {entry.category}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${
                        entry.type === "student" ? "text-blue-500" : "text-academic-gold"
                      }`}>
                        <span className="material-symbols-outlined text-sm">
                          {entry.type === "student" ? "person" : "event"}
                        </span>
                        {entry.type === "student" ? "Student" : "Event"}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-on-surface-variant text-sm">
                      {entry.type === "student" ? entry.role : "—"}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/yearbook/${entry.id}/edit`}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-neutral-surface dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/5 border border-outline-variant/30 rounded-xl text-sm font-bold transition-colors text-oxford-blue dark:text-white"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/30 rounded-xl text-sm font-bold transition-colors text-red-600 dark:text-red-400"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">auto_stories</span>
            <h3 className="text-xl font-bold text-oxford-blue dark:text-white mb-2">No yearbook entries yet</h3>
            <p className="text-on-surface-variant mb-6">Get started by adding your first yearbook entry.</p>
            <Link
              href="/admin/yearbook/new"
              className="bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue py-3 px-6 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add New Entry
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
