"use client";

import { useState } from "react";
import Link from "next/link";

const initialClubs = [
  {
    id: 1,
    name: "Robotics & AI Club",
    category: "Technology",
    icon: "smart_toy",
    meetingTime: "Wednesdays, 3:30 PM",
    leadership: "President: Alex J. | Advisor: Dr. Chen",
    description: "Explore the future by building autonomous robots and learning fundamental machine learning concepts.",
    image: "/images/g1.jpg",
  },
  {
    id: 2,
    name: "Debate Society",
    category: "Academic",
    icon: "forum",
    meetingTime: "Tuesdays, 4:00 PM",
    leadership: "Captain: Michael C. | Advisor: Mrs. Smith",
    description: "Sharpen your public speaking and critical thinking skills by discussing global issues.",
    image: "/images/g2.jpg",
  },
  {
    id: 3,
    name: "Eco Warriors",
    category: "Community",
    icon: "eco",
    meetingTime: "Fridays, 3:00 PM",
    leadership: "President: Sarah L. | Advisor: Mr. Davis",
    description: "Lead sustainability initiatives on campus and organize community clean-up drives.",
    image: "/images/g3.jpg",
  },
  {
    id: 4,
    name: "Performing Arts Group",
    category: "Arts",
    icon: "theater_comedy",
    meetingTime: "Mon & Thu, 4:30 PM",
    leadership: "Director: Ms. Rahman",
    description: "Express yourself through drama, dance, and musical performances in our biannual showcases.",
    image: "/images/g4.jpg",
  },
  {
    id: 5,
    name: "Coding Club",
    category: "Technology",
    icon: "code",
    meetingTime: "Thursdays, 3:30 PM",
    leadership: "President: Emily T. | Advisor: Mr. Park",
    description: "Learn web development, competitive programming, and build real-world applications.",
    image: "/images/g5.jpg",
  },
  {
    id: 6,
    name: "Chess Club",
    category: "Academic",
    icon: "chess",
    meetingTime: "Mondays, 4:00 PM",
    leadership: "Captain: David K. | Advisor: Mrs. Garcia",
    description: "Master the art of strategy and critical thinking through competitive chess.",
    image: "/images/g6.jpg",
  },
];

const categoryColors: Record<string, string> = {
  Technology: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
  Academic: "bg-purple-500/10 text-purple-600 dark:text-purple-300",
  Community: "bg-green-500/10 text-green-600 dark:text-green-300",
  Arts: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
};

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState(initialClubs);

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      setClubs((prev) => prev.filter((club) => club.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-oxford-blue dark:text-white">Clubs Management</h1>
          <p className="text-on-surface-variant">Manage all student clubs and organizations.</p>
        </div>
        <Link
          href="/admin/clubs/new"
          className="bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue py-3 px-6 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add New Club
        </Link>
      </div>

      <div className="bg-surface dark:bg-surface-variant p-6 rounded-2xl shadow-sm border border-outline-variant/30">
        {clubs.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">groups</span>
            <p className="text-xl font-bold text-oxford-blue dark:text-white mb-2">No clubs yet</p>
            <p className="text-on-surface-variant mb-6">Get started by adding your first club.</p>
            <Link
              href="/admin/clubs/new"
              className="bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue py-3 px-6 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add New Club
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="px-4 py-3 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">Club Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">Meeting Time</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">Leadership</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-on-surface-variant uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clubs.map((club) => (
                  <tr key={club.id} className="border-b border-outline-variant/10 hover:bg-neutral-surface dark:hover:bg-black/20 transition-colors">
                    <td className="px-4 py-4 text-sm text-oxford-blue dark:text-white font-semibold">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary dark:text-primary-fixed">{club.icon}</span>
                        {club.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${categoryColors[club.category] || "bg-neutral-surface dark:bg-black/20 text-on-surface-variant"}`}>
                        {club.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-on-surface dark:text-white">{club.meetingTime}</td>
                    <td className="px-4 py-4 text-sm text-on-surface dark:text-white max-w-[200px] truncate">{club.leadership}</td>
                    <td className="px-4 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/clubs/${club.id}/edit`}
                          className="bg-neutral-surface dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/5 border border-outline-variant/30 px-3 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors text-oxford-blue dark:text-white inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(club.id, club.name)}
                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-3 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors text-red-600 dark:text-red-400 inline-flex items-center gap-1"
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
        )}
      </div>
    </div>
  );
}
