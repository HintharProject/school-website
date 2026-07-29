"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const categories = ["Technology", "Academic", "Community", "Arts"];

export default function NewClubPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    category: "Technology",
    icon: "",
    meetingTime: "",
    leadership: "",
    description: "",
    image: "/images/g1.jpg",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Club created successfully!");
    router.push("/admin/clubs");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/admin/clubs"
          className="text-sm text-on-surface-variant hover:text-oxford-blue dark:hover:text-white transition-colors inline-flex items-center gap-1 mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Clubs
        </Link>
        <h1 className="text-2xl font-bold text-oxford-blue dark:text-white">Add New Club</h1>
        <p className="text-on-surface-variant">Create a new student club or organization.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface dark:bg-surface-variant p-6 rounded-2xl shadow-sm border border-outline-variant/30 space-y-6">
        <div>
          <label htmlFor="name" className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
            Club Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Robotics & AI Club"
            className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="category" className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
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
          <label htmlFor="icon" className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
            Icon
          </label>
          <input
            id="icon"
            name="icon"
            type="text"
            value={formData.icon}
            onChange={handleChange}
            required
            placeholder="e.g. smart_toy, forum, eco"
            className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
          />
          <p className="mt-1 text-xs text-on-surface-variant">Material Symbol name. Find icons at fonts.google.com/icons</p>
        </div>

        <div>
          <label htmlFor="meetingTime" className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
            Meeting Time
          </label>
          <input
            id="meetingTime"
            name="meetingTime"
            type="text"
            value={formData.meetingTime}
            onChange={handleChange}
            required
            placeholder="e.g. Wednesdays, 3:30 PM"
            className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="leadership" className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
            Leadership
          </label>
          <input
            id="leadership"
            name="leadership"
            type="text"
            value={formData.leadership}
            onChange={handleChange}
            required
            placeholder="e.g. President: Alex J. | Advisor: Dr. Chen"
            className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe what this club is about..."
            className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white resize-none"
          />
        </div>

        <div>
          <label htmlFor="image" className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
            Image URL
          </label>
          <input
            id="image"
            name="image"
            type="text"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
          />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue py-3 px-8 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Create Club
          </button>
          <Link
            href="/admin/clubs"
            className="bg-neutral-surface dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/5 border border-outline-variant/30 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors text-oxford-blue dark:text-white"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
