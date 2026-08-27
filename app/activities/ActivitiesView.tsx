"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import ChatbotWidget from "../components/ChatbotWidget";
import { getActivities } from "@/lib/actions/activities";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

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

const galleryMoments = [
  { image: "/images/g1.jpg", caption: "Primary Science Discovery Day", tag: "Primary" },
  { image: "/images/g2.jpg", caption: "Physics Optics & Mechanics Workshop", tag: "IGCSE Lab" },
  { image: "/images/g3.jpg", caption: "Coding & Python Project Showcase", tag: "Computing" },
  { image: "/images/g5.jpg", caption: "Student Council Election & Leadership Camp", tag: "Student Life" },
  { image: "/images/g8.jpg", caption: "Art, Design & Global Culture Exhibition", tag: "Arts" },
  { image: "/images/g9.jpg", caption: "Alumni & Parent Engagement Night", tag: "Community" },
];

interface RawActivityRecord {
  id: number | string;
  title: string;
  category: string;
  date: string;
  month?: string;
  day?: string;
  time: string;
  location: string;
  description: string;
  image?: string;
  status: string;
  featured?: number | boolean | null;
  reviewStatus?: string;
}

function mapActivity(a: RawActivityRecord): SchoolEvent {
  return {
    id: Number(a.id),
    title: a.title,
    category: a.category as SchoolEvent["category"],
    date: a.date,
    month: (a.month || a.date || "").slice(0, 3).toUpperCase(),
    day: a.day || a.date,
    time: a.time,
    location: a.location,
    description: a.description,
    image: a.image || "/images/engineering.avif",
    status: a.status as SchoolEvent["status"],
    featured: Boolean(a.featured),
  };
}

export default function ActivitiesView({ initialData }: { initialData?: RawActivityRecord[] }) {
  const [events, setEvents] = useState<SchoolEvent[]>(() => (initialData ?? []).map(mapActivity));
  const [isLoading, setIsLoading] = useState(!initialData);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [rsvpModalEvent, setRsvpModalEvent] = useState<SchoolEvent | null>(null);

  useEffect(() => {
    if (initialData) return;

    async function loadEvents() {
      try {
        setIsLoading(true);
        const data = await getActivities();
        setEvents(
          ((data ?? []) as RawActivityRecord[])
            .filter((a) => a.reviewStatus === "published" || !a.reviewStatus)
            .map(mapActivity)
        );
      } catch (err) {
        console.warn("Activities load note:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
  }, [initialData]);

  const filteredEvents =
    activeCategory === "all"
      ? events
      : events.filter((e) => e.category === activeCategory);

  const featuredEvents = events.filter((e) => e.featured);

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-8 py-10">
        {/* Page Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-4 py-1.5 rounded-full mb-4 border border-[#0E3B7D]/20">
            <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">campaign</span>
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
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeCategory === tab.id
                  ? "bg-[#0E3B7D] text-white shadow-md scale-105"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Featured Showcase */}
        {featuredEvents.length > 0 && activeCategory === "all" && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span aria-hidden="true" className="material-symbols-outlined text-[#FFC700] text-xl font-bold">stars</span>
              <h2 className="text-lg font-black text-[#09234B] uppercase tracking-wider">
                Featured Highlights
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredEvents.slice(0, 2).map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="relative h-56 w-full bg-slate-900 overflow-hidden">
                    <Image
                      src={ev.image}
                      alt={ev.title}
                      fill
                      unoptimized={isR2AssetUrl(ev.image)}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FFC700] text-[#09234B]">
                        {ev.status}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-xs text-[#FFC700] font-bold">{ev.date} • {ev.time}</p>
                      <h3 className="text-xl font-black">{ev.title}</h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {ev.description}
                    </p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">location_on</span>
                        <span>{ev.location}</span>
                      </span>
                      <button
                        onClick={() => setRsvpModalEvent(ev)}
                        aria-haspopup="dialog"
                        className="px-4 py-1.5 bg-[#0E3B7D] hover:bg-[#164E9A] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Register / RSVP
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={ev.image}
                    alt={ev.title}
                    fill
                    unoptimized={isR2AssetUrl(ev.image)}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover opacity-90"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#09234B]/80 text-[#FFC700] backdrop-blur-sm">
                      {ev.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0E3B7D]">
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">event</span>
                    <span>{ev.date}</span>
                  </div>
                  <h3 className="text-base font-black text-[#09234B]">{ev.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {ev.description}
                  </p>
                </div>
              </div>

              <div className="p-4 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
                  {ev.location}
                </span>
                <button
                  onClick={() => setRsvpModalEvent(ev)}
                  className="px-3 py-1.5 rounded-lg bg-[#E8F0FE] hover:bg-[#0E3B7D] text-[#0E3B7D] hover:text-white font-bold text-xs transition-all cursor-pointer"
                >
                  RSVP
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Photo Gallery Moments */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-black text-[#09234B]">Campus Life Gallery</h2>
            <p className="text-xs text-slate-500 mt-1">
              Snapshots of student inquiry, laboratory experiments, debates, and community milestones across Hinthar campuses.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {galleryMoments.map((mom, idx) => (
              <div
                key={idx}
                className="group relative h-48 rounded-2xl overflow-hidden bg-slate-900"
              >
                <Image
                  src={mom.image}
                  alt={mom.caption}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-black uppercase text-[#FFC700]">{mom.tag}</span>
                  <p className="text-xs text-white font-bold">{mom.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Event Details Modal */}
        {rsvpModalEvent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="event-details-title"
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0E3B7D]">
                    Event Registration
                  </span>
                  <h3 id="event-details-title" className="text-xl font-black text-[#09234B]">{rsvpModalEvent.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRsvpModalEvent(null)}
                  aria-label="Close event details"
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <span aria-hidden="true" className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-slate-600 space-y-1">
                <p><strong>Date &amp; Time:</strong> {rsvpModalEvent.date} ({rsvpModalEvent.time})</p>
                <p><strong>Venue:</strong> {rsvpModalEvent.location}</p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                <p>
                  Registration for school events is handled by the Student Affairs office and homeroom teachers.
                  Students can sign up at the campus office, or parents can reserve a place by calling us.
                </p>
                <p className="flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">call</span>
                  <span>Inquiries: +95 9 894 332200</span>
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setRsvpModalEvent(null)}
                  className="px-4 py-2 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <FooterSection />
      <ChatbotWidget />
    </div>
  );
}
