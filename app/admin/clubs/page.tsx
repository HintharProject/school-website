"use client";

import { useState } from "react";
import Image from "next/image";

const initialClubs = [
  {
    id: 1,
    name: "Robotics, IoT & AI Club",
    category: "STEM & Tech",
    icon: "smart_toy",
    members: "38 Active Members",
    meetingTime: "Wednesdays · 03:45 PM – 05:15 PM",
    leadership: "Student Lead: Aung Kaung | Advisor: Dr. Kaung Myat Htut",
    description: "Design autonomous Arduino & Raspberry Pi robots, code computer vision scripts, and prepare for international robotics olympiads.",
    image: "/images/engineering.avif",
  },
  {
    id: 2,
    name: "Model United Nations & Debate Society",
    category: "Academic & Debate",
    icon: "forum",
    members: "45 Active Members",
    meetingTime: "Tuesdays · 04:00 PM – 05:30 PM",
    leadership: "President: Su Myat Noe | Advisor: Tr. Rachel Evans",
    description: "Master diplomatic public speaking, persuasive negotiation, international policy analysis, and competitive debate sparring.",
    image: "/images/business.jpg",
  },
  {
    id: 3,
    name: "Science Discovery & Astronomy Society",
    category: "STEM & Science",
    icon: "biotech",
    members: "32 Active Members",
    meetingTime: "Thursdays · 03:30 PM – 05:00 PM",
    leadership: "President: Lin Htet | Advisor: Dr. Su Mon Kyaw",
    description: "Conduct chemical reaction experiments, study celestial bodies with telescopes, and organize the annual Science Fair.",
    image: "/images/g2.jpg",
  },
  {
    id: 4,
    name: "Digital Media, Photography & Film",
    category: "Creative Arts",
    icon: "photo_camera",
    members: "28 Active Members",
    meetingTime: "Fridays · 03:30 PM – 05:00 PM",
    leadership: "Editor: Min Khant | Advisor: Daw May Zin Thet",
    description: "Learn cinematography, digital graphic design, school magazine journalism, and yearbook photography coverage.",
    image: "/images/g8.jpg",
  },
  {
    id: 5,
    name: "Badminton & Table Tennis Club",
    category: "Sports & Fitness",
    icon: "sports_tennis",
    members: "50+ Active Members",
    meetingTime: "Mon & Thu · 04:15 PM – 05:45 PM",
    leadership: "Captains: Thura & May | Coach: U Zaw Lin",
    description: "Training agility, competitive drills, inter-school friendly fixtures, and intra-house championship tournaments.",
    image: "/images/g7.jpg",
  },
  {
    id: 6,
    name: "Music, Choir & Performing Arts",
    category: "Creative Arts",
    icon: "theater_comedy",
    members: "34 Active Members",
    meetingTime: "Wednesdays · 04:00 PM – 05:30 PM",
    leadership: "Director: Kay Zin | Advisor: Tr. Sarah Jenkins",
    description: "Acoustic ensemble, classical choral singing, and stage theatre productions for school galas and cultural festivals.",
    image: "/images/g6.jpg",
  },
];

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState(initialClubs);

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the active clubs registry?`)) {
      setClubs((prev) => prev.filter((club) => club.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-3 py-1 rounded-full mb-1.5 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-xs font-bold">groups</span>
            <span className="text-[10px] font-black text-[#0E3B7D] uppercase tracking-wider">
              Extracurricular Excellence
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#09234B] tracking-tight">Student Clubs &amp; Societies</h1>
          <p className="text-xs text-slate-500 font-normal">
            Manage student organizations, faculty advisors, and weekly meeting schedules
          </p>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
          Active Clubs: <strong>{clubs.length}</strong>
        </span>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clubs.map((club) => (
          <div
            key={club.id}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-36 relative overflow-hidden">
                <Image
                  src={club.image}
                  alt={club.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09234B]/90 via-[#09234B]/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white/20 backdrop-blur-md">
                    {club.category}
                  </span>
                  <h4 className="text-sm font-black mt-1 leading-snug">{club.name}</h4>
                </div>
              </div>

              <div className="p-4 space-y-2.5">
                <p className="text-xs text-slate-600 line-clamp-2 font-normal leading-relaxed">
                  {club.description}
                </p>
                <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#FFC700] text-xs font-bold">schedule</span>
                    <span>{club.meetingTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0E3B7D] text-xs font-bold">person</span>
                    <span className="truncate">{club.leadership}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 flex justify-between items-center border-t border-slate-100 mt-2">
              <span className="text-[10px] font-bold text-[#0E3B7D] bg-[#E8F0FE] px-2 py-0.5 rounded">
                {club.members}
              </span>
              <button
                onClick={() => handleDelete(club.id, club.name)}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">delete</span>
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
