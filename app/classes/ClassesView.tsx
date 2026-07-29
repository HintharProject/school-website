"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InnerNavbar from "../components/InnerNavbar";
import FooterSection from "../components/sections/FooterSection";

const courses = [
  { id: 1, name: "Advanced Mathematics", grade: "A-Level", time: "Mon, Wed, Fri - 9:00 AM", instructor: "Mr. Davis", desc: "Complex numbers, calculus, and advanced algebra." },
  { id: 2, name: "Physics", grade: "O-Level", time: "Tue, Thu - 10:30 AM", instructor: "Dr. Chen", desc: "Mechanics, waves, and introductory quantum physics." },
  { id: 3, name: "Computer Science", grade: "BCS Prep", time: "Mon, Wed - 1:00 PM", instructor: "Ms. Rahman", desc: "Algorithms, data structures, and Python programming." },
  { id: 4, name: "World Literature", grade: "A-Level", time: "Tue, Fri - 2:00 PM", instructor: "Mrs. Smith", desc: "Analysis of global literary masterpieces." }
];

const announcements = [
  { id: 1, title: "Mid-term Examinations Schedule", date: "Oct 15, 2026", type: "Important", content: "The mid-term examinations will commence on November 1st. Detailed schedules will be emailed to parents." },
  { id: 2, title: "Science Fair Registration Open", date: "Oct 10, 2026", type: "Event", content: "Students interested in participating in the annual science fair must register by October 25th." },
  { id: 3, title: "New Library Hours", date: "Oct 5, 2026", type: "Notice", content: "The school library will now remain open until 6:00 PM on weekdays to support study groups." }
];

export default function ClassesView() {
  const [activeTab, setActiveTab] = useState<"courses" | "announcements">("courses");

  return (
    <div className="min-h-screen flex flex-col pt-24 bg-background">
      <InnerNavbar />
      
      <main className="flex-1 max-w-[1000px] mx-auto w-full px-6 md:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-oxford-blue dark:text-white mb-4 tracking-tight">
            Academics & <span className="text-primary dark:text-primary-fixed">Updates</span>
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant font-light">
            Stay up to date with class schedules and the latest school news.
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex p-1 bg-surface-variant/30 dark:bg-surface-variant/50 rounded-full max-w-sm mx-auto mb-12">
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex-1 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === "courses" ? "bg-white dark:bg-surface shadow-sm text-primary dark:text-primary-fixed" : "text-on-surface-variant hover:text-oxford-blue dark:hover:text-white"}`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex-1 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === "announcements" ? "bg-white dark:bg-surface shadow-sm text-primary dark:text-primary-fixed" : "text-on-surface-variant hover:text-oxford-blue dark:hover:text-white"}`}
          >
            News
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "courses" ? (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6"
            >
              {courses.map(course => (
                <div key={course.id} className="bg-surface dark:bg-surface-variant p-6 rounded-2xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed text-3xl group-hover:text-white">menu_book</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-oxford-blue dark:text-white">{course.name}</h3>
                      <span className="px-3 py-1 bg-academic-gold/10 text-academic-gold text-xs font-bold rounded-full">{course.grade}</span>
                    </div>
                    <p className="text-on-surface-variant text-sm mb-3">{course.desc}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-on-surface-variant">
                      <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">schedule</span> {course.time}</div>
                      <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">person</span> {course.instructor}</div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="announcements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {announcements.map(ann => (
                <div key={ann.id} className="bg-surface dark:bg-surface-variant p-6 md:p-8 rounded-2xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
                    <div>
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-3 uppercase tracking-wider ${ann.type === 'Important' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-fixed'}`}>
                        {ann.type}
                      </span>
                      <h3 className="text-xl font-bold text-oxford-blue dark:text-white">{ann.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-sm font-medium">
                      <span className="material-symbols-outlined text-sm">calendar_month</span> {ann.date}
                    </div>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <FooterSection />
    </div>
  );
}
