"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AdmissionApplication,
  mapAdmissionRecord,
  UserProfile,
  FALLBACK_GUEST_USER,
  mapUserProfileRecord,
} from "./adminStore";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase/actions";

export default function AdminDashboardPage() {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [clubCount, setClubCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [campusCount, setCampusCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [yearbookCount, setYearbookCount] = useState(0);
  const [mySubmissionsCount, setMySubmissionsCount] = useState(0);
  const [activeRole, setActiveRole] = useState<UserProfile>(FALLBACK_GUEST_USER);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadLiveStats = async () => {
    try {
      const profile = await getCurrentUserProfile();
      if (profile) {
        setActiveRole(mapUserProfileRecord(profile));
        // If student, count their submitted yearbook entries
        if (profile.role === "student") {
          const { count: myCnt } = await supabase
            .from("yearbook_alumni")
            .select("*", { count: "exact", head: true })
            .eq("submitted_by", profile.id);
          setMySubmissionsCount(myCnt || 0);
        }
      }

      const [
        { data: appsData },
        { count: clubsCnt },
        { count: yearbookCnt },
        { count: usersCnt },
        { count: campusCnt },
        { count: coursesCnt },
      ] = await Promise.all([
        supabase.from("admissions").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("clubs").select("*", { count: "exact", head: true }),
        supabase.from("yearbook_alumni").select("*", { count: "exact", head: true }),
        supabase.from("user_profiles").select("*", { count: "exact", head: true }),
        supabase.from("campuses").select("*", { count: "exact", head: true }),
        supabase.from("classes_courses").select("*", { count: "exact", head: true }),
      ]);

      if (appsData) {
        setApplications(appsData.map(mapAdmissionRecord));
      } else {
        setApplications([]);
      }

      setClubCount(clubsCnt || 0);
      setYearbookCount(yearbookCnt || 0);
      setUserCount(usersCnt || 0);
      setCampusCount(campusCnt || 0);
      setCourseCount(coursesCnt || 0);
    } catch (err) {
      console.warn("Supabase dashboard stats query error:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadLiveStats();
  }, []);

  const isPrincipal = (activeRole?.role ?? "principal") === "principal";
  const isStaff = (activeRole?.role ?? "") === "staff_admin";
  const isStudent = (activeRole?.role ?? "") === "student";

  const pendingCount = applications.filter((a) => a.status === "Pending").length;

  const statusBadgeClasses: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-800 border border-amber-200",
    "Assessment Scheduled": "bg-blue-100 text-blue-800 border border-blue-200",
    Approved: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    Declined: "bg-rose-100 text-rose-800 border border-rose-200",
  };

  return (
    <div className="space-y-8">
      {/* Header Greeting with Role Persona */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-3.5 py-1 rounded-full mb-2 border border-[#0E3B7D]/20">
            <span
              className={`w-2 h-2 rounded-full ${
                isPrincipal ? "bg-[#FFC700]" : isStaff ? "bg-[#0E3B7D]" : "bg-emerald-600"
              } animate-pulse`}
            />
            <span className="text-[11px] font-black text-[#0E3B7D] uppercase tracking-wider">
              {activeRole?.roleLabel || "Principal Authority"} · {activeRole?.fullName || "Dr. Kaung Myat Htut"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#09234B] tracking-tight">
            {isPrincipal
              ? "Principal Executive Console"
              : isStaff
              ? "Academic Operations Center"
              : "Student Contributor Workspace"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            {isPrincipal
              ? "Overseeing 4 Campuses (3 in Yangon & 1 in Mawlamyine) · Pearson Edexcel Approved Centre 11051"
              : isStaff
              ? "Admissions pipeline, timetable scheduling, student clubs and yearbook moderation"
              : "Direct data entry for Yearbook Gallery and Student Societies"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {isPrincipal && (
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-sm font-bold">person_add</span>
              <span>Manage Accounts</span>
            </Link>
          )}

          {!isStudent ? (
            <Link
              href="/admin/admissions"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-sm font-bold">how_to_reg</span>
              <span>Review Admissions ({pendingCount})</span>
            </Link>
          ) : (
            <Link
              href="/admin/yearbook"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-sm font-bold">add_circle</span>
              <span>Submit for Yearbook</span>
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Row tailored by Role */}
      {isStudent ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">auto_stories</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">My Submissions</p>
              <p className="text-2xl font-black text-[#09234B]">{mySubmissionsCount} Profiles</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0E3B7D] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">groups</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Societies</p>
              <p className="text-2xl font-black text-[#09234B]">{clubCount} Active Clubs</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">location_city</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Campus Access</p>
              <p className="text-2xl font-black text-[#09234B]">{campusCount} Campuses</p>
            </div>
          </div>
        </div>
      ) : (
        /* Principal & Staff Admin Metrics */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Admissions Pipeline</span>
              <span className="material-symbols-outlined text-amber-500 text-lg">how_to_reg</span>
            </div>
            <div>
              <p className="text-3xl font-black text-[#09234B] mb-0.5 tracking-tight">
                {applications.length} Candidates
              </p>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                {pendingCount} Pending Review
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Direct sync with admissions table</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Campus Network</span>
              <span className="material-symbols-outlined text-[#0E3B7D] text-lg">domain</span>
            </div>
            <div>
              <p className="text-3xl font-black text-[#09234B] mb-0.5 tracking-tight">
                {campusCount} Branches
              </p>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Yangon (3) · Mawlamyine (1)</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Ywarma, Shwe Padauk, Shwe Pone Nyet</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Authorized Accounts</span>
              <span className="material-symbols-outlined text-purple-600 text-lg">manage_accounts</span>
            </div>
            <div>
              <p className="text-3xl font-black text-[#09234B] mb-0.5 tracking-tight">
                {userCount} User Profiles
              </p>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">3-Tier RBAC Access</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Principal · Faculty · Students</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Yearbook &amp; Honors</span>
              <span className="material-symbols-outlined text-emerald-600 text-lg">auto_stories</span>
            </div>
            <div>
              <p className="text-3xl font-black text-[#09234B] mb-0.5 tracking-tight">
                {yearbookCount} Scholars
              </p>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Yearbook &amp; Placements</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Class of 2026, 2025, 2024</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Role-tailored views */}
      {!isStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left (2 Cols): Recent Admissions */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#09234B] tracking-tight">
                    Recent Admission Applications
                  </h3>
                  <p className="text-xs text-slate-500 font-normal">
                    Real-time enrollment submissions requiring assessment scheduling
                  </p>
                </div>
                <Link
                  href="/admin/admissions"
                  className="text-xs font-bold text-[#0E3B7D] hover:underline flex items-center gap-1"
                >
                  <span>View All ({applications.length})</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-600">
                      <th className="p-3.5 font-bold uppercase tracking-wider">Ref ID &amp; Student</th>
                      <th className="p-3.5 font-bold uppercase tracking-wider">Grade Level</th>
                      <th className="p-3.5 font-bold uppercase tracking-wider">Status</th>
                      <th className="p-3.5 font-bold uppercase tracking-wider text-right">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoaded && applications.length > 0 ? (
                      applications.slice(0, 5).map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <p className="font-bold text-[#09234B]">{app.studentName}</p>
                            <span className="font-mono text-[10px] text-slate-400">{app.id}</span>
                          </td>
                          <td className="p-3.5 text-slate-600 font-medium">{app.grade}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                statusBadgeClasses[app.status] || "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right text-slate-400 font-medium">
                            {app.submittedDate}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-slate-400">
                          <span className="material-symbols-outlined text-3xl mb-1 block">how_to_reg</span>
                          <p className="font-bold text-xs text-slate-600">No recent admission applications</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Online applications submitted by candidates will appear here in real-time.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <Link
                href="/admin/admissions"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0E3B7D] hover:text-[#164E9A]"
              >
                <span>Process Applications &amp; Book Assessments</span>
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Right (1 Col): Quick Shortcuts */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-black text-[#09234B] uppercase tracking-wider mb-4">
                Operational Shortcuts
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Account Hub", href: "/admin/users", icon: "manage_accounts" },
                  { label: "4 Campuses", href: "/admin/campuses", icon: "location_city" },
                  { label: "Yearbook Review", href: "/admin/yearbook", icon: "auto_stories" },
                  { label: "Clubs & Events", href: "/admin/clubs", icon: "groups" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 hover:bg-[#E8F0FE] border border-slate-200 hover:border-[#0E3B7D]/40 transition-all text-center group"
                  >
                    <span className="material-symbols-outlined text-2xl mb-1 text-[#0E3B7D] group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#0E3B7D]">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Pearson Academic Centre Badge */}
            <div className="bg-gradient-to-br from-[#09234B] to-[#0E3B7D] text-white p-5 rounded-3xl shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FFC700] text-xl font-bold">verified</span>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#FFC700]">
                  Pearson Edexcel Centre 11051
                </h4>
              </div>
              <p className="text-xs text-slate-200 font-light leading-relaxed">
                Exam sessions and syllabi are synchronized across Ywarma, Shwe Padauk, Shwe Pone Nyet, and Mawlamyine campuses.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Student Contributor Guide & Shortcuts */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">auto_stories</span>
              </div>
              <div>
                <h3 className="font-black text-sm text-[#09234B]">Yearbook Data Entry</h3>
                <p className="text-xs text-slate-500">Submit profiles and photos for approval</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              As a Student Contributor, you can enter achievements, honours badges, and upload portraits for the Class of 2026/2025/2024. Your submissions will be reviewed by faculty staff before going live.
            </p>
            <Link
              href="/admin/yearbook"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFC700] text-[#09234B] font-bold text-xs rounded-xl hover:bg-[#E6B300] transition-colors"
            >
              <span>Submit Profile</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0E3B7D] flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">groups</span>
              </div>
              <div>
                <h3 className="font-black text-sm text-[#09234B]">Student Societies &amp; Clubs</h3>
                <p className="text-xs text-slate-500">Propose activities and manage events</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Coordinate extracurricular initiatives, publish meeting times, and register new societies for your peers across Yangon and Mawlamyine campus branches.
            </p>
            <Link
              href="/admin/clubs"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0E3B7D] text-white font-bold text-xs rounded-xl hover:bg-[#164E9A] transition-colors"
            >
              <span>Explore Societies</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
