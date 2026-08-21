"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import ChatbotWidget from "../components/ChatbotWidget";
import { getCourses, getBulletins } from "@/lib/actions/classes";

interface CourseItem {
  id: string | number;
  name: string;
  code: string;
  level: "Lower Secondary" | "Pearson IGCSE" | "Pearson IAL";
  category: "STEM" | "Business" | "Computing" | "Languages";
  schedule: string;
  room: string;
  instructor: string;
  description: string;
  credits?: string;
}

interface AnnouncementItem {
  id: number;
  title: string;
  date: string;
  badge: string;
  badgeColor: string;
  content: string;
}

export default function ClassesView() {
  const [activeTab, setActiveTab] = useState<"courses" | "announcements">("courses");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [dbCourses, dbBulletins] = await Promise.all([
          getCourses().catch(() => []),
          getBulletins().catch(() => []),
        ]);

        if (dbCourses && dbCourses.length > 0) {
          const mapped: CourseItem[] = dbCourses.map((c: any) => {
            let level: "Lower Secondary" | "Pearson IGCSE" | "Pearson IAL" = "Pearson IAL";
            if (c.grade.includes("Lower Secondary")) level = "Lower Secondary";
            else if (c.grade.includes("IGCSE")) level = "Pearson IGCSE";

            return {
              id: c.id,
              name: c.name,
              code: c.code,
              level,
              category: c.category,
              schedule: c.time,
              room: c.room || "Campus Academic Wing",
              instructor: c.instructor,
              description: c.description || `${c.grade} curriculum specialized instruction.`,
              credits: c.credits || "Core Course",
            };
          });
          setCourses(mapped);
        }

        if (dbBulletins && dbBulletins.length > 0) {
          const mappedBulletins: AnnouncementItem[] = dbBulletins.map((b: any) => {
            let badgeColor = "bg-[#E8F0FE] text-[#0E3B7D]";
            if (b.type === "Official Notice") badgeColor = "bg-red-100 text-red-700";
            else if (b.type === "General") badgeColor = "bg-slate-100 text-slate-700";

            return {
              id: Number(b.id),
              title: b.title,
              date: b.date,
              badge: b.type,
              badgeColor,
              content: b.content,
            };
          });
          setAnnouncements(mappedBulletins);
        }
      } catch (err) {
        console.warn("Classes query note:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredCourses =
    levelFilter === "all"
      ? courses
      : courses.filter((c) => c.level === levelFilter);

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
            className={`flex-1 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === "courses"
                ? "bg-[#0E3B7D] text-white shadow-sm"
                : "text-slate-600 hover:text-[#0E3B7D]"
            }`}
          >
            Course Schedules ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex-1 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === "announcements"
                ? "bg-[#0E3B7D] text-white shadow-sm"
                : "text-slate-600 hover:text-[#0E3B7D]"
            }`}
          >
            Notices ({announcements.length})
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
                    className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      levelFilter === btn.id
                        ? "bg-[#FFC700] text-[#09234B] shadow-sm font-black"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E8F0FE] text-[#0E3B7D]">
                          {course.level}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-400">
                          {course.code}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-[#09234B] mb-2 leading-tight">
                        {course.name}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-[#0E3B7D]">schedule</span>
                        <span className="font-medium">{course.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-[#0E3B7D]">person</span>
                        <span className="font-semibold text-slate-800">{course.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-[#0E3B7D]">location_on</span>
                        <span>{course.room}</span>
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
              className="max-w-3xl mx-auto space-y-4"
            >
              {announcements.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${notice.badgeColor}`}>
                      {notice.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{notice.date}</span>
                  </div>
                  <h3 className="text-base font-black text-[#09234B]">{notice.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{notice.content}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <FooterSection />
      <ChatbotWidget />
    </div>
  );
}
