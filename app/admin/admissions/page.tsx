"use client";

import { useState } from "react";

type ApplicationStatus = "Pending" | "Approved" | "Rejected";

interface AdmissionApplication {
  id: number;
  studentName: string;
  grade: string;
  parentEmail: string;
  submittedDate: string;
  status: ApplicationStatus;
}

const mockApplications: AdmissionApplication[] = [
  { id: 1, studentName: "Ethan Chen", grade: "Grade 10", parentEmail: "ethan.chen@email.com", submittedDate: "2026-07-15", status: "Pending" },
  { id: 2, studentName: "Maya Patel", grade: "Grade 8", parentEmail: "maya.patel@email.com", submittedDate: "2026-07-12", status: "Approved" },
  { id: 3, studentName: "Liam O'Brien", grade: "Grade 11", parentEmail: "liam.ob@email.com", submittedDate: "2026-07-10", status: "Pending" },
  { id: 4, studentName: "Sofia Garcia", grade: "Grade 9", parentEmail: "sofia.g@email.com", submittedDate: "2026-07-08", status: "Rejected" },
  { id: 5, studentName: "Noah Kim", grade: "Grade 7", parentEmail: "noah.kim@email.com", submittedDate: "2026-07-05", status: "Pending" },
  { id: 6, studentName: "Aisha Mohammed", grade: "Grade 12", parentEmail: "aisha.m@email.com", submittedDate: "2026-07-03", status: "Approved" },
  { id: 7, studentName: "Oliver Brown", grade: "Grade 6", parentEmail: "oliver.b@email.com", submittedDate: "2026-07-01", status: "Pending" },
  { id: 8, studentName: "Emma Wilson", grade: "Grade 10", parentEmail: "emma.w@email.com", submittedDate: "2026-06-28", status: "Pending" },
];

const statusBadgeClasses: Record<ApplicationStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminAdmissionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");

  const pendingCount = mockApplications.filter((a) => a.status === "Pending").length;

  const filteredApplications = mockApplications.filter((app) => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-oxford-blue dark:text-white">Admissions Review</h1>
          <p className="text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">pending_actions</span>
              {pendingCount} pending application{pendingCount !== 1 ? "s" : ""}
            </span>
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-sm text-sm font-bold">
          <span className="material-symbols-outlined text-lg">sync</span>
          Sync / Approve to SMS
        </button>
      </div>

      {/* Filter / Sort Bar */}
      <div className="bg-surface dark:bg-surface-variant p-6 rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status filter */}
          <div className="flex-1">
            <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Status</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">filter_list</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "All")}
                className="w-full appearance-none pl-10 pr-10 py-2.5 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl text-oxford-blue dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Search input */}
          <div className="flex-1">
            <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Search by name</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a student name..."
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl text-oxford-blue dark:text-white text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface dark:bg-surface-variant rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-neutral-surface dark:bg-black/20">
                <th className="text-left px-6 py-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider">Student Name</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider">Grade</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Parent Email</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Submitted Date</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-neutral-surface dark:hover:bg-black/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-primary-fixed shrink-0">
                          <span className="material-symbols-outlined text-lg">person</span>
                        </div>
                        <span className="font-bold text-oxford-blue dark:text-white">{app.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{app.grade}</td>
                    <td className="px-6 py-4 text-on-surface-variant hidden sm:table-cell">{app.parentEmail}</td>
                    <td className="px-6 py-4 text-on-surface-variant hidden md:table-cell">{app.submittedDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${statusBadgeClasses[app.status]}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary dark:text-primary-fixed bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 block mb-3">search_off</span>
                    <p className="text-on-surface-variant font-medium">No applications match your filters.</p>
                    <button
                      onClick={() => { setSearchQuery(""); setStatusFilter("All"); }}
                      className="mt-2 text-sm text-primary dark:text-primary-fixed hover:underline"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div className="px-6 py-3 border-t border-outline-variant/20 bg-neutral-surface dark:bg-black/10 text-xs text-on-surface-variant">
          Showing {filteredApplications.length} of {mockApplications.length} applications
        </div>
      </div>
    </div>
  );
}
