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
import { authClient } from "@/lib/auth/auth-client";
import { getAdmissions } from "@/lib/actions/admissions";
import { getClubs } from "@/lib/actions/clubs";
import { getYearbook } from "@/lib/actions/yearbook";
import { getCourses } from "@/lib/actions/classes";
import { getCampuses } from "@/lib/actions/campuses";
import { getUsers } from "@/lib/actions/users";
import { getActivities } from "@/lib/actions/activities";

export default function AdminDashboardPage() {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [clubCount, setClubCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [campusCount, setCampusCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [yearbookCount, setYearbookCount] = useState(0);
  const [activityCount, setActivityCount] = useState(0);
  const [mySubmissionsCount, setMySubmissionsCount] = useState(0);
  const [activeRole, setActiveRole] = useState<UserProfile>(FALLBACK_GUEST_USER);
  const [isLoaded, setIsLoaded] = useState(false);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      setActiveRole(mapUserProfileRecord(session.user));
    }
  }, [session]);

  const loadLiveStats = async () => {
    try {
      const [
        appsData,
        clubsData,
        yearbookData,
        campusesData,
        coursesData,
        activitiesData,
      ] = await Promise.all([
        getAdmissions().catch(() => []),
        getClubs().catch(() => []),
        getYearbook().catch(() => []),
        getCampuses().catch(() => []),
        getCourses().catch(() => []),
        getActivities().catch(() => []),
      ]);

      if (appsData && Array.isArray(appsData)) {
        setApplications(appsData.slice(0, 5).map(mapAdmissionRecord));
      }

      setClubCount(clubsData?.length || 0);
      setYearbookCount(yearbookData?.length || 0);
      setCampusCount(campusesData?.length || 0);
      setCourseCount(coursesData?.length || 0);
      setActivityCount(activitiesData?.length || 0);

      // If admin, fetch users count
      try {
        const usersData = await getUsers();
        setUserCount(usersData?.length || 0);
      } catch {
        setUserCount(0);
      }

      // Count my submissions if student
      if (session?.user?.id && Array.isArray(yearbookData)) {
        const myCnt = yearbookData.filter((y: any) => y.submittedBy === session.user.id).length;
        setMySubmissionsCount(myCnt);
      }
    } catch (err) {
      console.warn("Dashboard stats query note:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadLiveStats();
  }, [session]);

  const isAdmin = (activeRole?.role ?? "admin") === "admin";
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
                isAdmin ? "bg-[#FFC700]" : "bg-emerald-600"
              }`}
            />
            <span className="text-[11px] font-black text-[#0E3B7D] uppercase tracking-wider">
              {isAdmin ? "Administrator Authority" : "Student Contributor"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#09234B] tracking-tight">
            Welcome back, {activeRole?.fullName || "Administrator"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAdmin
              ? "Oversee 4 campuses across Yangon & Mawlamyine, admissions pipeline, curriculum, and user directory."
              : "Submit extracurricular club proposals, class timetable entries, and alumni yearbook honors."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-[#0E3B7D]">open_in_new</span>
            <span>Public Site</span>
          </Link>
          {isAdmin ? (
            <Link
              href="/admin/users"
              className="px-4 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              <span>Invite Account</span>
            </Link>
          ) : (
            <Link
              href="/admin/yearbook"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Submit Yearbook Entry</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {isAdmin ? (
          <>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0E3B7D] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Admissions</p>
                <h3 className="text-2xl font-black text-[#09234B] mt-0.5">{applications.length}</h3>
                <p className="text-[10px] text-amber-600 font-semibold">{pendingCount} pending review</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">location_city</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Campuses</p>
                <h3 className="text-2xl font-black text-[#09234B] mt-0.5">{campusCount || 4}</h3>
                <p className="text-[10px] text-slate-400">Yangon &amp; Mawlamyine</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Classes &amp; Syllabi</p>
                <h3 className="text-2xl font-black text-[#09234B] mt-0.5">{courseCount}</h3>
                <p className="text-[10px] text-slate-400">IAL, IGCSE, Secondary</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">manage_accounts</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">User Directory</p>
                <h3 className="text-2xl font-black text-[#09234B] mt-0.5">{userCount}</h3>
                <p className="text-[10px] text-emerald-600 font-semibold">Active accounts</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">auto_stories</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">My Submissions</p>
                <h3 className="text-2xl font-black text-[#09234B] mt-0.5">{mySubmissionsCount}</h3>
                <p className="text-[10px] text-slate-400">Yearbook records</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0E3B7D] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">groups</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Student Societies</p>
                <h3 className="text-2xl font-black text-[#09234B] mt-0.5">{clubCount}</h3>
                <p className="text-[10px] text-slate-400">Active clubs</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">event</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Events &amp; Activities</p>
                <h3 className="text-2xl font-black text-[#09234B] mt-0.5">{activityCount}</h3>
                <p className="text-[10px] text-slate-400">School calendar</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course Schedules</p>
                <h3 className="text-2xl font-black text-[#09234B] mt-0.5">{courseCount}</h3>
                <p className="text-[10px] text-slate-400">Timetable directory</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Admin Recent Applications Table */}
      {isAdmin && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-[#09234B] uppercase tracking-wider">
                Recent Admissions Applications
              </h2>
              <p className="text-xs text-slate-400">Live incoming enrollment requests</p>
            </div>
            <Link
              href="/admin/admissions"
              className="text-xs font-bold text-[#0E3B7D] hover:underline flex items-center gap-1"
            >
              <span>View All Pipeline</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Reference ID</th>
                  <th className="p-4">Applicant</th>
                  <th className="p-4">Target Grade</th>
                  <th className="p-4">Parent / Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No applications recorded yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-[#0E3B7D]">{app.id}</td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{app.studentName}</p>
                        <p className="text-[10px] text-slate-400">{app.gender || "Student"}</p>
                      </td>
                      <td className="p-4">{app.grade}</td>
                      <td className="p-4">
                        <p className="text-slate-900">{app.parentName || "Parent"}</p>
                        <p className="text-[10px] text-slate-400">{app.parentEmail}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            statusBadgeClasses[app.status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <Link
                          href="/admin/admissions"
                          className="px-3 py-1.5 rounded-lg bg-[#E8F0FE] text-[#0E3B7D] font-bold text-[11px] hover:bg-[#0E3B7D] hover:text-white transition-all"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
