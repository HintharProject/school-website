"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

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
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const [
          { data: dbCourses, error: cErr },
          { data: dbBulletins, error: bErr },
        ] = await Promise.all([
          supabase
            .from("classes_courses")
            .select("id, name, code, grade, category, time, instructor, room, description, credits, is_active")
            .eq("is_active", true)
            .order("grade", { ascending: false }),
          supabase
            .from("bulletin_notices")
            .select("id, title, date, type, content")
            .order("id", { ascending: false }),
        ]);

        if (!cErr && dbCourses) {
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

        if (!bErr && dbBulletins) {
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
        console.warn("Supabase classes query error:", err);
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
            className={`flex-1 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
              activeTab === "courses"
                ? "bg-[#0E3B7D] text-white shadow-sm"
                : "text-slate-600 hover:text-[#0E3B7D]"
            }`}
          >
            Course Schedules ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex-1 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
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

              {filteredCourses.length === 0 && !isLoading && (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs max-w-xl mx-auto">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">menu_book</span>
                  <h3 className="text-base font-bold text-[#09234B]">No course timetables found</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Published class schedules from the database will appear here.
                  </p>
                </div>
              )}

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
              {announcements.length === 0 && !isLoading && (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">campaign</span>
                  <h3 className="text-base font-bold text-[#09234B]">No official notices published</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Official bulletins and announcements from school administration will appear here.
                  </p>
                </div>
              )}

              {announcements.map((ann) => (
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
