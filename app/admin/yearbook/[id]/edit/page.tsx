"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const categories = ["Class of 2023", "Class of 2024", "Science Fair", "Sports", "Arts"];

type EntryType = "student" | "event";

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

const mockEntries: YearbookEntry[] = [
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

export default function EditYearbookEntryPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const entry = mockEntries.find((e) => e.id === id);

  const [entryType, setEntryType] = useState<EntryType>(entry?.type ?? "student");

  // Student fields
  const [name, setName] = useState(entry?.type === "student" ? entry.name : "");
  const [role, setRole] = useState(entry?.type === "student" ? entry.role : "");
  const [quote, setQuote] = useState(entry?.type === "student" ? entry.quote : "");

  // Event fields
  const [title, setTitle] = useState(entry?.type === "event" ? entry.title : "");
  const [description, setDescription] = useState(entry?.type === "event" ? entry.description : "");

  // Common fields
  const [category, setCategory] = useState(entry?.category ?? categories[0]);
  const [image, setImage] = useState(entry?.image ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Yearbook entry updated successfully!");
    router.push("/admin/yearbook");
  };

  if (!entry) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/admin/yearbook"
            className="inline-flex items-center gap-1 text-on-surface-variant hover:text-oxford-blue dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Yearbook
          </Link>
        </div>
        <div className="bg-surface dark:bg-surface-variant p-6 rounded-2xl shadow-sm border border-outline-variant/30 text-center py-16">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">error</span>
          <h1 className="text-2xl font-bold text-oxford-blue dark:text-white mb-2">Entry Not Found</h1>
          <p className="text-on-surface-variant mb-6">The yearbook entry you are looking for does not exist.</p>
          <Link
            href="/admin/yearbook"
            className="bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue py-3 px-6 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Yearbook
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/admin/yearbook"
          className="inline-flex items-center gap-1 text-on-surface-variant hover:text-oxford-blue dark:hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Yearbook
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-oxford-blue dark:text-white">Edit Yearbook Entry</h1>
        <p className="text-on-surface-variant">
          Editing: <span className="font-bold text-primary dark:text-primary-fixed">
            {entry.type === "student" ? entry.name : entry.title}
          </span>
        </p>
      </div>

      <div className="bg-surface dark:bg-surface-variant p-6 rounded-2xl shadow-sm border border-outline-variant/30">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Entry Type Toggle */}
          <div>
            <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-3">
              Entry Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEntryType("student")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider border transition-all ${
                  entryType === "student"
                    ? "bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue border-primary dark:border-primary-fixed"
                    : "bg-neutral-surface dark:bg-black/20 border-outline-variant/30 text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-lg">person</span>
                Student
              </button>
              <button
                type="button"
                onClick={() => setEntryType("event")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider border transition-all ${
                  entryType === "event"
                    ? "bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue border-primary dark:border-primary-fixed"
                    : "bg-neutral-surface dark:bg-black/20 border-outline-variant/30 text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-lg">event</span>
                Event
              </button>
            </div>
          </div>

          {/* Student Fields */}
          {entryType === "student" && (
            <>
              <div>
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter student name"
                  required
                  className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Valedictorian, Head Prefect"
                  required
                  className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                  Quote
                </label>
                <textarea
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Enter a memorable quote from this student"
                  rows={3}
                  required
                  className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white resize-none"
                />
              </div>
            </>
          )}

          {/* Event Fields */}
          {entryType === "event" && (
            <>
              <div>
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter event title"
                  required
                  className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the event and its significance"
                  rows={3}
                  required
                  className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white resize-none"
                />
              </div>
            </>
          )}

          {/* Common Fields */}
          <div>
            <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue py-3 px-8 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Update Entry
            </button>
            <Link
              href="/admin/yearbook"
              className="bg-neutral-surface dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/5 border border-outline-variant/30 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors text-oxford-blue dark:text-white"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
