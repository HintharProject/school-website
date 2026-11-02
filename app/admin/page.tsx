"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  House,
  Buildings,
  GraduationCap,
  UsersThree,
  IdentificationBadge,
  CheckCircle,
  ClockCountdown,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CalendarBlank,
  BookOpenText,
  UserPlus,
} from "@phosphor-icons/react";
import {
  AdmissionApplication,
  mapAdmissionRecord,
  UserProfile,
  FALLBACK_GUEST_USER,
  mapUserProfileRecord,
} from "./adminStore";
import { authClient } from "@/lib/auth/auth-client";
import { getAdmissions } from "@/lib/actions/admissions";
import { getPortalClubs, setClubStatusAction } from "@/lib/actions/clubs";
import {
  getPortalYearbook,
  setYearbookStatusAction,
} from "@/lib/actions/yearbook";
import { getCampusesForAdmin } from "@/lib/actions/campuses";
import { getProgramsForAdmin } from "@/lib/actions/academicCatalog";
import {
  getPortalActivities,
  setActivityReviewStatusAction,
} from "@/lib/actions/activities";

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] =
    useState<UserProfile>(FALLBACK_GUEST_USER);
  const [isLoaded, setIsLoaded] = useState(false);

  // Live Stats
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [campusesCount, setCampusesCount] = useState(0);
  const [programsCount, setProgramsCount] = useState(0);
  const [clubsCount, setClubsCount] = useState(0);
  const [yearbookCount, setYearbookCount] = useState(0);

  // Unified Pending Review Queue (Yearbook, Clubs, Activities)
  const [pendingYearbook, setPendingYearbook] = useState<any[]>([]);
  const [pendingClubs, setPendingClubs] = useState<any[]>([]);
  const [pendingActivities, setPendingActivities] = useState<any[]>([]);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      setCurrentUser(mapUserProfileRecord(session.user));
    }
  }, [session]);

  const loadData = async () => {
    try {
      const [
        appsData,
        campusesData,
        programsData,
        clubsData,
        yearbookData,
        activitiesData,
      ] = await Promise.all([
        getAdmissions().catch(() => []),
        getCampusesForAdmin().catch(() => []),
        getProgramsForAdmin().catch(() => []),
        getPortalClubs().catch(() => []),
        getPortalYearbook().catch(() => []),
        getPortalActivities().catch(() => []),
      ]);

      if (Array.isArray(appsData)) {
        setApplications(appsData.map(mapAdmissionRecord));
      }
      setCampusesCount(campusesData?.length || 0);
      setProgramsCount(programsData?.length || 0);
      setClubsCount(clubsData?.length || 0);
      setYearbookCount(yearbookData?.length || 0);

      // Filter pending items
      if (Array.isArray(yearbookData)) {
        setPendingYearbook(
          yearbookData.filter((y: any) => y.status === "pending_review")
        );
      }
      if (Array.isArray(clubsData)) {
        setPendingClubs(
          clubsData.filter((c: any) => c.status === "pending_review")
        );
      }
      if (Array.isArray(activitiesData)) {
        setPendingActivities(
          activitiesData.filter((a: any) => a.reviewStatus === "pending_review")
        );
      }
    } catch (err) {
      console.warn("Dashboard data query note:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadData();
  }, [session]);

  const isAdmin = currentUser.role === "admin";
  const pendingAdmissionsCount = applications.filter(
    (a) => a.status === "Pending"
  ).length;
  const totalPendingReview =
    pendingYearbook.length + pendingClubs.length + pendingActivities.length;

  const handleApproveYearbook = async (id: number) => {
    setActionInProgress(`yb-${id}`);
    try {
      await setYearbookStatusAction(id, "published");
      await loadData();
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApproveClub = async (id: number) => {
    setActionInProgress(`club-${id}`);
    try {
      await setClubStatusAction(id, "published");
      await loadData();
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApproveActivity = async (id: number) => {
    setActionInProgress(`act-${id}`);
    try {
      await setActivityReviewStatusAction(id, "published");
      await loadData();
    } finally {
      setActionInProgress(null);
    }
  };

  // Student Contributor Focused Hub
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-extrabold mb-2">
              <UserCheck className="w-4 h-4" weight="bold" />
              Student Contributor
            </span>
            <h1 className="text-2xl font-extrabold text-[#1E232B]">
              Welcome, {currentUser.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Submit and update your Student Yearbook entry, propose club
              activities, and collaborate on school life chronicles.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/yearbook"
            className="rounded-3xl bg-white border border-slate-200/90 hover:border-[#193E8A]/40 p-6 shadow-xs hover:shadow-hinthar transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF3FC] text-[#193E8A] flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6" weight="duotone" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1E232B] group-hover:text-[#193E8A] transition-colors">
                  Student Yearbook Entry
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Submit or edit your senior profile, Pearson subjects, quote,
                  and university placement.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#193E8A]">
              <span>Manage My Entry</span>
              <ArrowRight className="w-4 h-4" weight="bold" />
            </div>
          </Link>

          <Link
            href="/admin/clubs"
            className="rounded-3xl bg-white border border-slate-200/90 hover:border-[#193E8A]/40 p-6 shadow-xs hover:shadow-hinthar transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFFBE6] text-[#162033] flex items-center justify-center shrink-0">
                <UsersThree className="w-6 h-6" weight="duotone" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1E232B] group-hover:text-[#193E8A] transition-colors">
                  Clubs & Activity Drafts
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Propose student club meetings, rosters, and activity draft
                  events for administrative review.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#193E8A]">
              <span>Manage Club Drafts</span>
              <ArrowRight className="w-4 h-4" weight="bold" />
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // School Administrator Master Dashboard & Unified Approvals Queue
  return (
    <div className="space-y-8">
      {/* Top Welcome & Master Admin Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD600] text-[#162033] px-3.5 py-1 text-xs font-extrabold mb-2">
            <ShieldCheck className="w-4 h-4" weight="bold" />
            School Administrator Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E232B] tracking-tight">
            Institutional CMS & Moderation Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Every section on the public website is 100% editable from this
            portal. Changes publish instantly to the Cloudflare network.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/admin/home"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#193E8A] hover:bg-[#2352B0] text-white text-xs font-extrabold transition-colors shadow-2xs"
          >
            <House className="w-4 h-4" weight="fill" />
            <span>Edit Home & Classes</span>
          </Link>
          <Link
            href="/admin/admissions"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFD600] hover:bg-[#ECC300] text-[#162033] text-xs font-extrabold transition-colors shadow-2xs"
          >
            <IdentificationBadge className="w-4 h-4" weight="bold" />
            <span>Admissions ({pendingAdmissionsCount} Pending)</span>
          </Link>
        </div>
      </div>

      {/* 5-Page Key Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        <Link
          href="/admin/home"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 hover:border-[#193E8A]/40 shadow-2xs hover:shadow-sm transition-all"
        >
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pearson Pathways
          </p>
          <p className="text-2xl font-extrabold text-[#193E8A] mt-1">
            {programsCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Year 7–9 · IGCSE · IAL
          </p>
        </Link>

        <Link
          href="/admin/campuses"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 hover:border-[#193E8A]/40 shadow-2xs hover:shadow-sm transition-all"
        >
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Campuses
          </p>
          <p className="text-2xl font-extrabold text-[#193E8A] mt-1">
            {campusesCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            3 Yangon + 1 Mawlamyine
          </p>
        </Link>

        <Link
          href="/admin/yearbook"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 hover:border-[#193E8A]/40 shadow-2xs hover:shadow-sm transition-all"
        >
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Yearbook Scholars
          </p>
          <p className="text-2xl font-extrabold text-[#193E8A] mt-1">
            {yearbookCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Students & Alumni
          </p>
        </Link>

        <Link
          href="/admin/clubs"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 hover:border-[#193E8A]/40 shadow-2xs hover:shadow-sm transition-all"
        >
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Clubs & Societies
          </p>
          <p className="text-2xl font-extrabold text-[#193E8A] mt-1">
            {clubsCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Student-led</p>
        </Link>

        <Link
          href="/admin/admissions"
          className="col-span-2 lg:col-span-1 rounded-2xl bg-[#FFFBE6] border border-[#FFD600] p-4 sm:p-5 hover:shadow-sm transition-all"
        >
          <p className="text-xs font-extrabold text-[#162033] uppercase tracking-wider">
            Total Admissions
          </p>
          <p className="text-2xl font-extrabold text-[#162033] mt-1">
            {applications.length}
          </p>
          <p className="text-[11px] font-bold text-amber-900 mt-0.5">
            {pendingAdmissionsCount} Awaiting Review
          </p>
        </Link>
      </div>

      {/* UNIFIED PENDING REVIEW QUEUE (Contributor Drafts) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#1E232B] flex items-center gap-2">
              <ClockCountdown className="w-5 h-5 text-[#193E8A]" weight="bold" />
              <span>Contributor Pending Review Queue</span>
              {totalPendingReview > 0 && (
                <span className="rounded-full bg-[#FFD600] px-2.5 py-0.5 text-xs font-extrabold text-[#162033]">
                  {totalPendingReview}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and approve Student Contributor draft submissions before they
              appear on the public website.
            </p>
          </div>
        </div>

        {totalPendingReview === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-200/90 p-8 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" weight="fill" />
            <p className="text-sm font-bold text-[#1E232B]">
              No pending contributor drafts
            </p>
            <p className="text-xs text-slate-500">
              All student yearbook entries, club updates, and activity proposals
              are up to date.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Pending Yearbook Entries */}
            {pendingYearbook.map((item) => (
              <div
                key={`yb-${item.id}`}
                className="rounded-2xl bg-white border border-amber-300 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#EEF3FC] text-[#193E8A] px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                      Yearbook Entry
                    </span>
                    <span className="text-[11px] font-bold text-amber-800">
                      Pending
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#1E232B]">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {item.role}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 italic">
                    “{item.quote}”
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href="/admin/yearbook"
                    className="text-xs font-bold text-[#193E8A] hover:underline"
                  >
                    View in Yearbook
                  </Link>
                  <button
                    type="button"
                    disabled={actionInProgress === `yb-${item.id}`}
                    onClick={() => handleApproveYearbook(item.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {actionInProgress === `yb-${item.id}`
                      ? "Publishing..."
                      : "Publish"}
                  </button>
                </div>
              </div>
            ))}

            {/* Pending Club Drafts */}
            {pendingClubs.map((club) => (
              <div
                key={`club-${club.id}`}
                className="rounded-2xl bg-white border border-amber-300 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#FFFBE6] text-[#162033] px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                      Club Proposal
                    </span>
                    <span className="text-[11px] font-bold text-amber-800">
                      Pending
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#1E232B]">
                    {club.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {club.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href="/admin/clubs"
                    className="text-xs font-bold text-[#193E8A] hover:underline"
                  >
                    View in Clubs
                  </Link>
                  <button
                    type="button"
                    disabled={actionInProgress === `club-${club.id}`}
                    onClick={() => handleApproveClub(club.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {actionInProgress === `club-${club.id}`
                      ? "Publishing..."
                      : "Publish"}
                  </button>
                </div>
              </div>
            ))}

            {/* Pending Activity Drafts */}
            {pendingActivities.map((act) => (
              <div
                key={`act-${act.id}`}
                className="rounded-2xl bg-white border border-amber-300 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-purple-50 text-purple-800 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                      Activity Draft
                    </span>
                    <span className="text-[11px] font-bold text-amber-800">
                      Pending
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#1E232B]">
                    {act.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {act.date} · {act.location}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href="/admin/clubs"
                    className="text-xs font-bold text-[#193E8A] hover:underline"
                  >
                    View in Activities
                  </Link>
                  <button
                    type="button"
                    disabled={actionInProgress === `act-${act.id}`}
                    onClick={() => handleApproveActivity(act.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {actionInProgress === `act-${act.id}`
                      ? "Publishing..."
                      : "Publish"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Admissions Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#1E232B]">
              Latest Admission Applications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live admissions pipeline with guardian contacts & Pearson pathway.
            </p>
          </div>
          <Link
            href="/admin/admissions"
            className="text-xs font-extrabold text-[#193E8A] hover:underline inline-flex items-center gap-1"
          >
            <span>View All ({applications.length})</span>
            <ArrowRight className="w-3.5 h-3.5" weight="bold" />
          </Link>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Ref / Student</th>
                  <th className="py-3.5 px-4">Pathway</th>
                  <th className="py-3.5 px-4">Region</th>
                  <th className="py-3.5 px-4">Guardian Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-extrabold text-[#1E232B]">
                        {app.studentName}
                      </p>
                      <p className="font-mono text-[11px] text-[#193E8A]">
                        {app.id}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {app.grade}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {app.preferredRegion || "Yangon"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="font-medium text-[#1E232B]">
                        {app.parentName || "Guardian"}
                      </p>
                      <p className="text-[11px] text-slate-500">{app.parentPhone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          app.status === "Approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : app.status === "Assessment Scheduled"
                              ? "bg-[#FFD600] text-[#162033]"
                              : app.status === "Declined"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-[#EEF3FC] text-[#193E8A]"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/admin/admissions`}
                        className="font-extrabold text-[#193E8A] hover:underline"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
