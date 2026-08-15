"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";

interface SchoolEvent {
  id: number;
  title: string;
  category: "academic" | "sports" | "cultural" | "science";
  date: string;
  month: string;
  day: string;
  time: string;
  location: string;
  description: string;
  image: string;
  status: "Upcoming" | "Active Registration" | "Past Highlight";
  featured?: boolean;
}

const schoolEvents: SchoolEvent[] = [
  {
    id: 1,
    title: "Annual STEM & Robotics Innovation Fair 2026",
    category: "science",
    date: "September 18, 2026",
    month: "SEP",
    day: "18",
    time: "09:00 AM – 03:30 PM",
    location: "Main Auditorium & Innovation Labs",
    description:
      "Showcasing student-engineered AI models, IoT environmental sensors, physics experiments, and autonomous robot obstacle runs.",
    image: "/images/engineering.avif",
    status: "Active Registration",
    featured: true,
  },
  {
    id: 2,
    title: "Pearson Edexcel IGCSE & IAL Mock Exam Series",
    category: "academic",
    date: "October 05, 2026",
    month: "OCT",
    day: "05",
    time: "08:30 AM – 01:00 PM",
    location: "Exam Hall A & B (Hlaing Campus)",
    description:
      "Comprehensive British Council & Pearson standard trial examinations with full examiner mark schemes and personalized feedback sessions.",
    image: "/images/g4.jpg",
    status: "Upcoming",
    featured: true,
  },
  {
    id: 3,
    title: "Inter-House Badminton & Table Tennis Tournament",
    category: "sports",
    date: "November 12, 2026",
    month: "NOV",
    day: "12",
    time: "01:00 PM – 05:00 PM",
    location: "Hinthar Sports Complex",
    description:
      "Annual house championship featuring singles, doubles, and faculty-student exhibition matches to build camaraderie and sportsmanship.",
    image: "/images/g7.jpg",
    status: "Upcoming",
  },
  {
    id: 4,
    title: "Global Perspectives & Model United Nations (MUN)",
    category: "cultural",
    date: "November 25, 2026",
    month: "NOV",
    day: "25",
    time: "10:00 AM – 04:00 PM",
    location: "Conference Hall",
    description:
      "Student delegates debate geopolitical solutions, climate resilience, and economic sustainability in a formal diplomatic simulation.",
    image: "/images/business.jpg",
    status: "Upcoming",
  },
  {
    id: 5,
    title: "International Cultural Diversity Festival",
    category: "cultural",
    date: "December 15, 2026",
    month: "DEC",
    day: "15",
    time: "09:00 AM – 04:00 PM",
    location: "Campus Courtyard",
    description:
      "Celebrating world cultures with traditional culinary booths, traditional music performances, traditional costume parades, and art displays.",
    image: "/images/g6.jpg",
    status: "Upcoming",
  },
  {
    id: 6,
    title: "Class of 2026 Graduation & Academic Awards Ceremony",
    category: "academic",
    date: "July 20, 2026",
    month: "JUL",
    day: "20",
    time: "10:00 AM – 02:00 PM",
    location: "Grand Ballroom & Live Stream",
    description:
      "Honoring our Pearson Edexcel IGCSE and International A-Level graduates with distinction medals and university scholarship recognition.",
    image: "/images/graduation.jpg",
    status: "Past Highlight",
  },
];

const galleryMoments = [
  { image: "/images/g1.jpg", caption: "Primary Science Discovery Day", tag: "Primary" },
  { image: "/images/g2.jpg", caption: "Physics Optics & Mechanics Workshop", tag: "IGCSE Lab" },
  { image: "/images/g3.jpg", caption: "Coding & Python Project Showcase", tag: "Computing" },
  { image: "/images/g5.jpg", caption: "Student Council Election & Leadership Camp", tag: "Student Life" },
  { image: "/images/g8.jpg", caption: "Art, Design & Global Culture Exhibition", tag: "Arts" },
  { image: "/images/g9.jpg", caption: "Alumni & Parent Engagement Night", tag: "Community" },
];

export default function ActivitiesView() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [rsvpModalEvent, setRsvpModalEvent] = useState<SchoolEvent | null>(null);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");

  const filteredEvents =
    activeCategory === "all"
      ? schoolEvents
      : schoolEvents.filter((e) => e.category === activeCategory);

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpSubmitted(true);
    setTimeout(() => {
      setRsvpSubmitted(false);
      setRsvpModalEvent(null);
      setRsvpName("");
      setRsvpEmail("");
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-8 py-10">
        {/* Page Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-4 py-1.5 rounded-full mb-4 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">campaign</span>
            <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">
              Campus Life &amp; Events
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#09234B] mb-3 tracking-tight">
            Activities &amp; <span className="text-[#0E3B7D]">Announcements</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-normal">
            Stay updated with upcoming academic competitions, school workshops, athletic meets, and student celebrations at Hinthar International School.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {[
            { id: "all", label: "All Events" },
            { id: "science", label: "STEM & Science" },
            { id: "academic", label: "Academic & Exams" },
            { id: "sports", label: "Sports & Athletics" },
            { id: "cultural", label: "Arts & Culture" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeCategory === tab.id
                  ? "bg-[#0E3B7D] text-white shadow-md scale-105"
                  : "bg-white text-slate-600 hover:text-[#0E3B7D] border border-slate-200 shadow-sm"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Image & Date Badge */}
              <div className="h-48 relative overflow-hidden">
                <Image
                  src={evt.image}
                  alt={evt.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09234B]/80 via-transparent to-black/20" />

                {/* Date Badge */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl p-2 text-center shadow-md min-w-[50px] border border-slate-200">
                  <span className="block text-[10px] font-black text-[#0E3B7D] uppercase tracking-wider leading-none">
                    {evt.month}
                  </span>
                  <span className="block text-xl font-black text-[#09234B] leading-tight">
                    {evt.day}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md bg-[#09234B]/85 text-[#FFC700] border border-[#FFC700]/30 shadow-sm">
                    {evt.status}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-black text-[#09234B] mb-2 group-hover:text-[#0E3B7D] transition-colors line-clamp-2">
                  {evt.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed font-normal flex-1">
                  {evt.description}
                </p>

                {/* Location & Time Info */}
                <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0E3B7D] text-sm">schedule</span>
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0E3B7D] text-sm">location_on</span>
                    <span className="truncate">{evt.location}</span>
                  </div>
                </div>

                {/* Card Button */}
                <button
                  type="button"
                  onClick={() => setRsvpModalEvent(evt)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#E8F0FE] hover:bg-[#0E3B7D] hover:text-white text-[#0E3B7D] text-xs font-black tracking-wider uppercase transition-all"
                >
                  <span>Attend / Register</span>
                  <span className="material-symbols-outlined text-sm font-bold">event_available</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Gallery / Campus Moments Showcase */}
        <div className="mb-16">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-[#09234B] tracking-tight">
              Life at <span className="text-[#0E3B7D]">Hinthar School</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal mt-1">
              Snapshots of student discoveries, lab experiments, cultural festivities, and academic achievements.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryMoments.map((item, i) => (
              <div
                key={i}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
              >
                <Image
                  src={item.image}
                  alt={item.caption}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09234B]/90 via-[#09234B]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC700] mb-1">
                    {item.tag}
                  </span>
                  <p className="text-xs font-bold leading-snug">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notice Board Banner */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-[#09234B] via-[#0E3B7D] to-[#164E9A] rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-[#FFC700]/30">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 bg-[#FFC700] text-[#09234B] text-[10px] font-black uppercase tracking-wider rounded-md">
              Official Bulletin
            </span>
            <h3 className="text-xl md:text-2xl font-black tracking-tight">
              Want to organize a club or student activity?
            </h3>
            <p className="text-xs md:text-sm text-slate-200 max-w-xl font-light">
              Student Council &amp; Faculty Activity Committee applications for 2026–2027 are currently open for all Secondary &amp; A-Level students.
            </p>
          </div>
          <Link
            href="/clubs"
            className="px-6 py-3 rounded-full bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] text-xs font-black tracking-wider uppercase shadow-md transition-colors shrink-0"
          >
            Explore Student Clubs
          </Link>
        </div>
      </main>

      {/* RSVP Modal */}
      {rsvpModalEvent && (
        <div
          className="fixed inset-0 z-[120] bg-[#09234B]/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRsvpModalEvent(null);
          }}
        >
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setRsvpModalEvent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Close Modal"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {!rsvpSubmitted ? (
              <form onSubmit={handleRsvpSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0E3B7D]">
                    Event Registration
                  </span>
                  <h3 className="text-lg font-black text-[#09234B] mt-1">
                    {rsvpModalEvent.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    📅 {rsvpModalEvent.date} &bull; 📍 {rsvpModalEvent.location}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email / Contact *
                  </label>
                  <input
                    required
                    type="email"
                    value={rsvpEmail}
                    onChange={(e) => setRsvpEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    Confirm RSVP &amp; Send Pass
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <span className="material-symbols-outlined text-4xl text-emerald-600 font-bold">check_circle</span>
                <h4 className="text-lg font-black text-[#09234B]">
                  RSVP Confirmed!
                </h4>
                <p className="text-xs text-slate-600">
                  We look forward to seeing you at the event. Confirmation pass sent to <strong>{rsvpEmail}</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <FooterSection />
    </div>
  );
}
