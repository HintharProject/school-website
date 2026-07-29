"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const categories = ["Technology", "Academic", "Community", "Arts"];

const clubsData = [
  {
    id: 1,
    name: "Robotics & AI Club",
    category: "Technology",
    icon: "smart_toy",
    meetingTime: "Wednesdays, 3:30 PM",
    leadership: "President: Alex J. | Advisor: Dr. Chen",
    description: "Explore the future by building autonomous robots and learning fundamental machine learning concepts.",
    image: "",
  },
  {
    id: 2,
    name: "Debate Society",
    category: "Academic",
    icon: "forum",
    meetingTime: "Tuesdays, 4:00 PM",
    leadership: "Captain: Michael C. | Advisor: Mrs. Smith",
    description: "Sharpen your public speaking and critical thinking skills by discussing global issues.",
    image: "",
  },
  {
    id: 3,
    name: "Eco Warriors",
    category: "Community",
    icon: "eco",
    meetingTime: "Fridays, 3:00 PM",
    leadership: "President: Sarah L. | Advisor: Mr. Davis",
    description: "Lead sustainability initiatives on campus and organize community clean-up drives.",
    image: "",
  },
  {
    id: 4,
    name: "Performing Arts Group",
    category: "Arts",
    icon: "theater_comedy",
    meetingTime: "Mon & Thu, 4:30 PM",
    leadership: "Director: Ms. Rahman",
    description: "Express yourself through drama, dance, and musical performances in our biannual showcases.",
    image: "",
  },
  {
    id: 5,
    name: "Coding Club",
    category: "Technology",
    icon: "code",
    meetingTime: "Thursdays, 3:30 PM",
    leadership: "President: Emily T. | Advisor: Mr. Park",
    description: "Learn web development, competitive programming, and build real-world applications.",
    image: "",
  },
  {
    id: 6,
    name: "Chess Club",
    category: "Academic",
    icon: "chess",
    meetingTime: "Mondays, 4:00 PM",
    leadership: "Captain: David K. | Advisor: Mrs. Garcia",
    description: "Master the art of strategy and critical thinking through competitive chess.",
    image: "",
  },
];

export default function EditClubPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const club = clubsData.find((c) => c.id === id);

  const [formData, setFormData] = useState({
    name: club?.name || "",
    category: club?.category || "Technology",
    icon: club?.icon || "",
    meetingTime: club?.meetingTime || "",
    leadership: club?.leadership || "",
    description: club?.description || "",
    image: club?.image || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Club updated successfully!");
    router.push("/admin/clubs");
  };

  if (!club) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/clubs"
          className="text-sm text-on-surface-variant hover:text-oxford-blue dark:hover:text-white transition-colors inline-flex items-center gap-1 mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Clubs
        </Link>
        <div className="bg-surface dark:bg-surface-variant p-6 rounded-2xl shadow-sm border border-outline-variant/30 text-center py-16">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">error_outline</span>
          <p className="text-xl font-bold text-oxford-blue dark:text-white mb-2">Club not found</p>
          <p className="text-on-surface-variant">The club you are trying to edit does not exist.</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-oxford-blue dark:text-white">Edit Club</h1>
        <p className="text-on-surface-variant">Update the details for <span className="font-semibold text-oxford-blue dark:text-white">{club.name}</span>.</p>
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
            Save Changes
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
