"use client";

import { useState } from "react";

type ApplicationStatus = "Pending" | "Approved" | "Rejected";

interface AdmissionApplication {
  id: string;
  studentName: string;
  grade: string;
  parentEmail: string;
  parentPhone: string;
  submittedDate: string;
  status: ApplicationStatus;
}

const mockApplications: AdmissionApplication[] = [
  { id: "HIS-2026-8421", studentName: "Aung Kaung Myat", grade: "Pearson IAL (Year 12)", parentEmail: "kaung.myat@parent.com", parentPhone: "+95 9 790 123456", submittedDate: "2026-08-14", status: "Pending" },
  { id: "HIS-2026-7912", studentName: "Su Myat Noe", grade: "Pearson IGCSE (Year 10)", parentEmail: "sumyat.n@parent.com", parentPhone: "+95 9 790 234567", submittedDate: "2026-08-13", status: "Approved" },
  { id: "HIS-2026-6401", studentName: "Zaw Lin Htet", grade: "Lower Secondary (Year 8)", parentEmail: "zawlin.h@parent.com", parentPhone: "+95 9 790 345678", submittedDate: "2026-08-12", status: "Pending" },
  { id: "HIS-2026-5120", studentName: "Hnin Wutt Yee", grade: "Pearson IAL (Year 12)", parentEmail: "hnin.wy@parent.com", parentPhone: "+95 9 790 456789", submittedDate: "2026-08-10", status: "Approved" },
  { id: "HIS-2026-4890", studentName: "Min Khant Kyaw", grade: "Lower Secondary (Year 7)", parentEmail: "minkhant.k@parent.com", parentPhone: "+95 9 790 567890", submittedDate: "2026-08-08", status: "Pending" },
  { id: "HIS-2026-3721", studentName: "Thandar Win", grade: "Pearson IGCSE (Year 11)", parentEmail: "thandar.w@parent.com", parentPhone: "+95 9 790 678901", submittedDate: "2026-08-05", status: "Rejected" },
  { id: "HIS-2026-2910", studentName: "Htet Aung Lin", grade: "Lower Secondary (Year 9)", parentEmail: "htetaung.l@parent.com", parentPhone: "+95 9 790 789012", submittedDate: "2026-08-02", status: "Pending" },
];

const statusBadgeClasses: Record<ApplicationStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 border border-amber-200",
  Approved: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  Rejected: "bg-red-100 text-red-800 border border-red-200",
};

export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<AdmissionApplication[]>(mockApplications);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);

  const pendingCount = applications.filter((a) => a.status === "Pending").length;

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.grade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp({ ...selectedApp, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-3 py-1 rounded-full mb-1.5 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-xs font-bold">school</span>
            <span className="text-[10px] font-black text-[#0E3B7D] uppercase tracking-wider">
              Year 7 to Year 13 Intake
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#09234B] tracking-tight">Admissions Review</h1>
          <p className="text-xs text-slate-500 font-normal">
            {pendingCount} candidate application{pendingCount !== 1 ? "s" : ""} pending diagnostic assessment and placement review
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
            Total Records: <strong>{applications.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="w-full sm:w-56">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "All")}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved / Enrolled</option>
              <option value="Rejected">Declined</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Search by Student, Ref ID, or Grade
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Aung Kaung, HIS-2026, IGCSE..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Applicant &amp; Reference ID</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Grade Level</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider hidden sm:table-cell">Parent Contact</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider hidden md:table-cell">Date Submitted</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#0E3B7D] font-black shrink-0 border border-[#0E3B7D]/20">
                          <span className="material-symbols-outlined text-base font-bold">person</span>
                        </div>
                        <div>
                          <p className="font-black text-sm text-[#09234B]">{app.studentName}</p>
                          <span className="font-mono text-[10px] text-slate-400 font-bold">{app.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-semibold">{app.grade}</td>
                    <td className="px-5 py-4 text-slate-600 hidden sm:table-cell font-medium">
                      <p>{app.parentEmail}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{app.parentPhone}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-500 hidden md:table-cell font-medium">{app.submittedDate}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-black rounded-md uppercase tracking-wider ${statusBadgeClasses[app.status]}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-2.5 py-1.5 text-xs font-bold text-[#0E3B7D] hover:bg-[#E8F0FE] rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">visibility</span>
                          <span>Details</span>
                        </button>
                        {app.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(app.id, "Approved")}
                              className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="Approve Admission"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app.id, "Rejected")}
                              className="px-2.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              title="Decline"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">search_off</span>
                    <p className="text-slate-500 font-medium">No admission records match your filter criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
          Showing {filteredApplications.length} of {applications.length} total applicant records
        </div>
      </div>

      {/* Applicant Detail Modal */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedApp(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0E3B7D]">
                Application Dossier
              </span>
              <h3 className="text-xl font-black text-[#09234B] mt-1">{selectedApp.studentName}</h3>
              <p className="text-xs font-mono text-slate-400 font-bold">{selectedApp.id}</p>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Target Academic Grade</span>
                <span className="font-bold text-[#09234B]">{selectedApp.grade}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Parent Email</span>
                <span className="font-semibold text-slate-800">{selectedApp.parentEmail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Contact Phone</span>
                <span className="font-mono font-semibold text-slate-800">{selectedApp.parentPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Submission Date</span>
                <span className="font-medium text-slate-700">{selectedApp.submittedDate}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-500 font-medium">Enrollment Status</span>
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${statusBadgeClasses[selectedApp.status]}`}>
                  {selectedApp.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => handleUpdateStatus(selectedApp.id, "Approved")}
                className="flex-1 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
              >
                Approve &amp; Enroll
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedApp.id, "Rejected")}
                className="py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider transition-all"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
