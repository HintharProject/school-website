"use client";

import { useState, useEffect } from "react";
import {
  AdmissionApplication,
  ApplicationStatus,
  mapAdmissionRecord,
  UserProfile,
  FALLBACK_GUEST_USER,
  mapUserProfileRecord,
} from "../adminStore";
import { authClient } from "@/lib/auth/auth-client";
import {
  getAdmissions,
  updateAdmissionStatusAction,
  deleteAdmissionAction,
  submitPublicAdmissionAction,
} from "@/lib/actions/admissions";

const statusBadgeClasses: Record<ApplicationStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 border border-amber-200",
  "Assessment Scheduled": "bg-blue-100 text-blue-800 border border-blue-200",
  Approved: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  Declined: "bg-rose-100 text-rose-800 border border-rose-200",
};

export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(FALLBACK_GUEST_USER);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");
  const [gradeFilter, setGradeFilter] = useState<string>("All");

  // Modals state
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AdmissionApplication | null>(null);
  const [deletingApp, setDeletingApp] = useState<AdmissionApplication | null>(null);

  // New Application Form State
  const [newForm, setNewForm] = useState({
    studentName: "",
    dateOfBirth: "",
    gender: "Male" as "Male" | "Female" | "Other",
    grade: "Pearson IGCSE (Year 10)",
    previousSchool: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    notes: "",
  });

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      setCurrentUser(mapUserProfileRecord(session.user));
    }
  }, [session]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const data = await getAdmissions();
      setApplications(data.map(mapAdmissionRecord));
    } catch (err) {
      console.warn("Failed to load admissions:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (currentUser?.role === "student") {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <h2 className="text-xl font-black text-slate-800">Confidential Admissions Data</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Student applications and personal contact records are strictly confidential and restricted to School Administrators.
        </p>
      </div>
    );
  }

  // Summary Metrics
  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === "Pending").length;
  const scheduledCount = applications.filter((a) => a.status === "Assessment Scheduled").length;
  const approvedCount = applications.filter((a) => a.status === "Approved").length;

  // Filtered List
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.parentEmail && app.parentEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.parentPhone && app.parentPhone.includes(searchQuery)) ||
      (app.previousSchool && app.previousSchool.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    const matchesGrade = gradeFilter === "All" || app.grade === gradeFilter;

    return matchesSearch && matchesStatus && matchesGrade;
  });

  // Action Handlers
  const handleUpdateStatus = async (id: string, newStatus: ApplicationStatus) => {
    try {
      await updateAdmissionStatusAction(id, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      if (selectedApp?.id === id) setSelectedApp((s) => (s ? { ...s, status: newStatus } : s));
      showToast(`Application ${id} status updated to: ${newStatus}`);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to update status."}`);
    }
  };

  const handleSaveNotes = async (id: string, notes: string, assessmentDate?: string) => {
    try {
      const curApp = applications.find((a) => a.id === id);
      await updateAdmissionStatusAction(
        id,
        curApp?.status || "Pending",
        notes,
        assessmentDate
      );
      setApplications((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, notes, assessmentDate: assessmentDate ?? a.assessmentDate }
            : a
        )
      );
      if (selectedApp?.id === id)
        setSelectedApp((s) =>
          s ? { ...s, notes, assessmentDate: assessmentDate ?? s.assessmentDate } : s
        );
      showToast("Assessment details and remarks saved successfully.");
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to save notes."}`);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.studentName || !newForm.parentEmail || !newForm.parentPhone) return;
    try {
      const res = await submitPublicAdmissionAction({
        studentName: newForm.studentName,
        dateOfBirth: newForm.dateOfBirth || null,
        gender: newForm.gender,
        grade: newForm.grade,
        previousSchool: newForm.previousSchool || null,
        parentName: newForm.parentName || null,
        parentEmail: newForm.parentEmail,
        parentPhone: newForm.parentPhone,
        academicStream: "General",
        studyMode: "Full-Time On-Campus",
      });

      const newRecord: AdmissionApplication = {
        id: res.applicationId,
        studentName: newForm.studentName,
        dateOfBirth: newForm.dateOfBirth || undefined,
        gender: newForm.gender,
        grade: newForm.grade,
        previousSchool: newForm.previousSchool || undefined,
        parentName: newForm.parentName || undefined,
        parentEmail: newForm.parentEmail,
        parentPhone: newForm.parentPhone,
        submittedDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        notes: newForm.notes || undefined,
      };

      setApplications((prev) => [newRecord, ...prev]);
      setNewForm({
        studentName: "",
        dateOfBirth: "",
        gender: "Male",
        grade: "Pearson IGCSE (Year 10)",
        previousSchool: "",
        parentName: "",
        parentEmail: "",
        parentPhone: "",
        notes: "",
      });
      setIsAddModalOpen(false);
      showToast(`Candidate ${newForm.studentName} registered (${res.applicationId}).`);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to create application."}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingApp) return;
    try {
      await deleteAdmissionAction(deletingApp.id);
      setApplications((prev) => prev.filter((a) => a.id !== deletingApp.id));
      if (selectedApp?.id === deletingApp.id) setSelectedApp(null);
      const removedId = deletingApp.id;
      setDeletingApp(null);
      showToast(`Application ${removedId} removed from registry.`);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to delete application."}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0E3B7D] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FFC700] animate-bounce">
          <span className="material-symbols-outlined text-[#FFC700]">check_circle</span>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-3.5 py-1 rounded-full mb-2 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-xs font-bold">school</span>
            <span className="text-[11px] font-black text-[#0E3B7D] uppercase tracking-wider">
              Admissions Workflow &amp; Candidate Pipeline
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#09234B] tracking-tight">
            Admissions Pipeline (2026–2027)
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Review online applications, schedule placement diagnostics, and confirm student enrollment across all 4 campuses.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <span className="material-symbols-outlined text-base font-bold">person_add</span>
          <span>Register Candidate</span>
        </button>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0E3B7D] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">folder_shared</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Applications</span>
            <span className="text-xl font-black text-[#09234B]">{totalCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">pending_actions</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Review</span>
            <span className="text-xl font-black text-[#09234B]">{pendingCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">event_available</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assessments</span>
            <span className="text-xl font-black text-[#09234B]">{scheduledCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">verified</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Approved / Enrolled</span>
            <span className="text-xl font-black text-[#09234B]">{approvedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, ID, phone, email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assessment Scheduled">Assessment Scheduled</option>
            <option value="Approved">Approved</option>
            <option value="Declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">Reference ID</th>
                <th className="p-4">Candidate Student</th>
                <th className="p-4">Grade Continuum</th>
                <th className="p-4">Parent &amp; Contacts</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No admission applications found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-[#0E3B7D]">{app.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{app.studentName}</p>
                      <p className="text-[10px] text-slate-400">{app.gender || "Student"}</p>
                    </td>
                    <td className="p-4">{app.grade}</td>
                    <td className="p-4">
                      <p className="text-slate-900">{app.parentName || "Parent"}</p>
                      <p className="text-[10px] text-slate-400">{app.parentEmail} • {app.parentPhone}</p>
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
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-3 py-1.5 rounded-lg bg-[#E8F0FE] text-[#0E3B7D] hover:bg-[#0E3B7D] hover:text-white font-bold text-[11px] transition-all cursor-pointer"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => setDeletingApp(app)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLICATION REVIEW MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-[#0E3B7D]">{selectedApp.id}</span>
                <h2 className="text-xl font-black text-[#09234B]">{selectedApp.studentName}</h2>
                <p className="text-xs text-slate-500">{selectedApp.grade}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Parent / Contact</span>
                <p className="font-bold text-slate-900">{selectedApp.parentName || "Parent / Guardian"}</p>
                <p className="text-slate-600">{selectedApp.parentEmail}</p>
                <p className="text-slate-600">{selectedApp.parentPhone}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Status &amp; Submission</span>
                <p className="font-bold text-slate-900">Submitted: {selectedApp.submittedDate}</p>
                <p className="text-slate-600">Current Status: <strong>{selectedApp.status}</strong></p>
                {selectedApp.assessmentDate && (
                  <p className="text-blue-700 font-semibold">Assessment: {selectedApp.assessmentDate}</p>
                )}
              </div>
            </div>

            {/* Assessment Date & Remarks */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Scheduled Entrance Assessment
                </label>
                <input
                  type="datetime-local"
                  defaultValue={selectedApp.assessmentDate || ""}
                  id="assessment-date-input"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Admissions Officer Notes
                </label>
                <textarea
                  defaultValue={selectedApp.notes || ""}
                  id="internal-notes-input"
                  rows={3}
                  placeholder="Record diagnostic marks, recommendations, interviewer remarks..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const dateVal = (document.getElementById("assessment-date-input") as HTMLInputElement)?.value;
                  const notesVal = (document.getElementById("internal-notes-input") as HTMLTextAreaElement)?.value;
                  handleSaveNotes(selectedApp.id, notesVal, dateVal);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">save</span>
                <span>Save Notes &amp; Date</span>
              </button>
            </div>

            {/* Workflow Action Buttons */}
            <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-2.5">
              <button
                onClick={() => handleUpdateStatus(selectedApp.id, "Approved")}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                <span>Approve &amp; Enroll</span>
              </button>

              <button
                onClick={() => handleUpdateStatus(selectedApp.id, "Assessment Scheduled")}
                className="py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0E3B7D] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Schedule Assessment
              </button>

              <button
                onClick={() => handleUpdateStatus(selectedApp.id, "Declined")}
                className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CANDIDATE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-[#09234B]">Manual Candidate Registration</h2>
            <form onSubmit={handleCreateApplication} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aung Kaung Myat"
                  value={newForm.studentName}
                  onChange={(e) => setNewForm({ ...newForm, studentName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Grade</label>
                  <select
                    value={newForm.grade}
                    onChange={(e) => setNewForm({ ...newForm, grade: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Lower Secondary (Year 7–9)">Lower Secondary (Year 7–9)</option>
                    <option value="Pearson IGCSE (Year 10)">Pearson IGCSE (Year 10)</option>
                    <option value="Pearson IGCSE (Year 11)">Pearson IGCSE (Year 11)</option>
                    <option value="Pearson IAL (Year 12)">Pearson IAL (Year 12)</option>
                    <option value="Pearson IAL (Year 13)">Pearson IAL (Year 13)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={newForm.gender}
                    onChange={(e) => setNewForm({ ...newForm, gender: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Parent Email</label>
                  <input
                    type="email"
                    required
                    placeholder="parent@gmail.com"
                    value={newForm.parentEmail}
                    onChange={(e) => setNewForm({ ...newForm, parentEmail: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Parent Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+95 9..."
                    value={newForm.parentPhone}
                    onChange={(e) => setNewForm({ ...newForm, parentPhone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0E3B7D] text-white font-bold"
                >
                  Register Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-[#09234B]">Delete Application?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete application <strong>{deletingApp.id}</strong> ({deletingApp.studentName})?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingApp(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
