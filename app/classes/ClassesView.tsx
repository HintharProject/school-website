"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";

interface CourseItem {
  id: number;
  name: string;
  code: string;
  level: "Lower Secondary" | "Pearson IGCSE" | "Pearson IAL";
  category: "STEM" | "Business" | "Computing" | "Languages";
  schedule: string;
  room: string;
  instructor: string;
  description: string;
  credits: string;
}

const coursesData: CourseItem[] = [
  {
    id: 1,
    name: "Pure Mathematics (P1 – P4)",
    code: "WMA11 / WMA12",
    level: "Pearson IAL",
    category: "STEM",
    schedule: "Mon, Wed, Fri &bull; 08:30 AM – 10:00 AM",
    room: "Mathematics Lab 2",
    instructor: "Dr. Kaung Myat Htut & U Than Win",
    description: "Advanced calculus, differential equations, vectors, coordinate geometry, and sequence & series.",
    credits: "4 Modules",
  },
  {
    id: 2,
    name: "Advanced Physics & Practical Lab (Units 1–6)",
    code: "WPH11 / WPH14",
    level: "Pearson IAL",
    category: "STEM",
    schedule: "Tue, Thu &bull; 10:30 AM – 12:30 PM",
    room: "Newton Science Lab",
    instructor: "Dr. Htet Aung Lin",
    description: "Mechanics, electrical circuits, thermodynamics, fields, waves, nuclear physics and empirical experiments.",
    credits: "Units 1–6",
  },
  {
    id: 3,
    name: "Pearson IGCSE Computer Science",
    code: "4CP0",
    level: "Pearson IGCSE",
    category: "Computing",
    schedule: "Mon, Thu &bull; 01:00 PM – 02:30 PM",
    room: "Turing Digital Lab",
    instructor: "Daw May Zin Thet",
    description: "Algorithms, Python software architecture, data structures, network security, and computer systems.",
    credits: "2 Papers",
  },
  {
    id: 4,
    name: "Pearson IGCSE Chemistry & Biology",
    code: "4CH1 / 4BI1",
    level: "Pearson IGCSE",
    category: "STEM",
    schedule: "Mon, Wed, Fri &bull; 10:30 AM – 12:00 PM",
    room: "Chemistry & Bio Lab",
    instructor: "Dr. Su Mon Kyaw",
    description: "Chemical bonding, stoichiometry, human physiology, genetics, organic synthesis, and laboratory investigation.",
    credits: "Core & Extended",
  },
  {
    id: 5,
    name: "Economics & Business Studies",
    code: "4EC1 / 4BS1",
    level: "Pearson IGCSE",
    category: "Business",
    schedule: "Tue, Thu &bull; 02:00 PM – 03:30 PM",
    room: "Economics Seminar Room",
    instructor: "U Myo Min Tun (MBA)",
    description: "Micro & macroeconomics, market dynamics, international trade, financial statements, and business strategy.",
    credits: "2 Papers",
  },
  {
    id: 6,
    name: "Lower Secondary STEM Discovery & Math (Year 7–9)",
    code: "SEC-MATH-08",
    level: "Lower Secondary",
    category: "STEM",
    schedule: "Daily &bull; 09:00 AM – 10:30 AM",
    room: "Room 104 (Secondary Wing)",
    instructor: "Tr. Rachel Evans",
    description: "Pre-algebra, introductory physics concepts, scientific inquiry, and global perspective workshops for Year 7 to Year 9.",
    credits: "Full Year",
  },
  {
    id: 7,
    name: "Lower Secondary English & Global Perspectives (Year 7–9)",
    code: "SEC-ENG-09",
    level: "Lower Secondary",
    category: "Languages",
    schedule: "Daily &bull; 11:00 AM – 12:30 PM",
    room: "Language Arts Studio",
    instructor: "Tr. Sarah Jenkins",
    description: "Critical reading, structured academic essays, speech debate, and international contemporary issues for middle schoolers.",
    credits: "Core Secondary",
  },
];

const announcementsData = [
  {
    id: 1,
    title: "Pearson Edexcel October/November 2026 Examination Registration",
    date: "August 20, 2026",
    badge: "Official Notice",
    badgeColor: "bg-red-100 text-red-700",
    content:
      "All candidate entries for the upcoming Pearson Edexcel IGCSE and International A-Level examination series must be confirmed through the exam officer by September 10th. Statement of Entries will be issued subsequently.",
  },
  {
    id: 2,
    title: "Science & Engineering Lab Practical Timetable Released",
    date: "August 15, 2026",
    badge: "Academic Schedule",
    badgeColor: "bg-[#E8F0FE] text-[#0E3B7D]",
    content:
      "Physics and Chemistry Unit 3 / Unit 6 experimental lab sessions for AS & A2 students will commence this week. Please check your assigned workstation and safety gear requirements.",
  },
  {
    id: 3,
    title: "Parent-Teacher Academic Progress Review Meetings (Year 7–13)",
    date: "August 10, 2026",
    badge: "Parent Portal",
    badgeColor: "bg-[#FFF8E1] text-[#09234B]",
    content:
      "Individual 1-on-1 consultations with faculty subject leads for Lower Secondary, IGCSE, and IAL will take place on campus on Saturday, August 29th. Appointment booking slots are now available via the school office.",
  },
  {
    id: 4,
    title: "Campus Library & Digital Archive Extended Hours",
    date: "August 02, 2026",
    badge: "Facility Update",
    badgeColor: "bg-emerald-100 text-emerald-800",
    content:
      "The academic library and quiet study carrels are now open until 06:30 PM on weekdays with high-speed internet access and Pearson revision past-paper banks.",
  },
];

export default function ClassesView() {
  const [activeTab, setActiveTab] = useState<"courses" | "announcements">("courses");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const filteredCourses =
    levelFilter === "all"
      ? coursesData
      : coursesData.filter((c) => c.level === levelFilter);

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-8 py-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-4 py-1.5 rounded-full mb-4 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">schedule</span>
            <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">
              Year 7 to 13 Timetables &amp; Bulletins
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#09234B] mb-3 tracking-tight">
            Classes &amp; <span className="text-[#0E3B7D]">Announcements</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-normal">
            Review detailed course syllabi, laboratory timetables, and official Pearson Edexcel academic notifications for Lower Secondary (Year 7–9), IGCSE, and IAL.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white rounded-full max-w-xs mx-auto mb-8 border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex-1 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
              activeTab === "courses"
                ? "bg-[#0E3B7D] text-white shadow-sm"
                : "text-slate-600 hover:text-[#0E3B7D]"
            }`}
          >
            Course Schedules
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex-1 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
              activeTab === "announcements"
                ? "bg-[#0E3B7D] text-white shadow-sm"
                : "text-slate-600 hover:text-[#0E3B7D]"
            }`}
          >
            Notices &amp; News
          </button>
        </div>

        {/* Courses Tab */}
        <AnimatePresence mode="wait">
          {activeTab === "courses" ? (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Level Filter */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
                {[
                  { id: "all", label: "All Levels" },
                  { id: "Lower Secondary", label: "Lower Secondary (Year 7–9)" },
                  { id: "Pearson IGCSE", label: "Pearson IGCSE (Year 10–11)" },
                  { id: "Pearson IAL", label: "Pearson IAL (Year 12–13)" },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setLevelFilter(btn.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      levelFilter === btn.id
                        ? "bg-[#FFC700] text-[#09234B] shadow-sm scale-105 font-black border border-[#FFC700]"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-[#0E3B7D]/40"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#E8F0FE] text-[#0E3B7D]">
                          {course.level} &bull; {course.category}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          {course.code}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-[#09234B] mb-2 group-hover:text-[#0E3B7D] transition-colors">
                        {course.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mb-4 font-normal leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#FFC700] text-sm font-bold">schedule</span>
                        <span>{course.schedule}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#0E3B7D] text-sm">meeting_room</span>
                          <span>{course.room}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0E3B7D]">
                          <span className="material-symbols-outlined text-sm">person</span>
                          <span>{course.instructor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="announcements"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 max-w-3xl mx-auto"
            >
              {announcementsData.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#0E3B7D]/40 transition-all"
                >
                  <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${ann.badgeColor}`}>
                      {ann.badge}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <span className="material-symbols-outlined text-xs text-[#0E3B7D]">calendar_today</span>
                      <span>{ann.date}</span>
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#09234B] mb-2">
                    {ann.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {ann.content}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inquiry Callout */}
        <div className="mt-12 text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-base font-black text-[#09234B] mb-1">
            Looking for specific class schedules or trial lessons?
          </h4>
          <p className="text-xs text-slate-600 mb-4 font-normal">
            Contact our academic coordinator or schedule a campus placement assessment.
          </p>
          <Link
            href="/admission"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#0E3B7D] hover:bg-[#164E9A] text-white rounded-full text-xs font-black uppercase tracking-wider shadow-md transition-all"
          >
            <span>Book Assessment</span>
            <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
          </Link>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
