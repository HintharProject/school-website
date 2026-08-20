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
import { fetchAdmissions, createAdmission, updateAdmission, deleteAdmission, getCurrentUserProfile } from "@/lib/supabase/actions";

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const profile = await getCurrentUserProfile();
      if (profile) setCurrentUser(mapUserProfileRecord(profile));
      const data = await fetchAdmissions();
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
          Student applications and personal contact records are strictly confidential and restricted to School Principal &amp; Staff Administrators.
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
      await updateAdmission(id, { status: newStatus });
      setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a));
      if (selectedApp?.id === id) setSelectedApp((s) => s ? { ...s, status: newStatus } : s);
      showToast(`Application ${id} status updated to: ${newStatus}`);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to update status."}`);
    }
  };

  const handleSaveNotes = async (id: string, notes: string, assessmentDate?: string) => {
    try {
      await updateAdmission(id, { notes, assessment_date: assessmentDate || null });
      setApplications((prev) => prev.map((a) => a.id === id ? { ...a, notes, assessmentDate: assessmentDate ?? a.assessmentDate } : a));
      if (selectedApp?.id === id) setSelectedApp((s) => s ? { ...s, notes, assessmentDate: assessmentDate ?? s.assessmentDate } : s);
      showToast("Assessment details and remarks saved successfully.");
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to save notes."}`);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.studentName || !newForm.parentEmail || !newForm.parentPhone) return;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    try {
      const created = await createAdmission({
        id: `HIS-2026-${randomNum}`,
        student_name: newForm.studentName,
        date_of_birth: newForm.dateOfBirth || null,
        gender: newForm.gender,
        grade: newForm.grade,
        previous_school: newForm.previousSchool || null,
        parent_name: newForm.parentName || null,
        parent_email: newForm.parentEmail,
        parent_phone: newForm.parentPhone,
        submitted_date: new Date().toISOString().split("T")[0],
        status: "Pending",
        notes: newForm.notes || null,
      });
      setApplications((prev) => [mapAdmissionRecord(created), ...prev]);
      setNewForm({ studentName: "", dateOfBirth: "", gender: "Male", grade: "Pearson IGCSE (Year 10)", previousSchool: "", parentName: "", parentEmail: "", parentPhone: "", notes: "" });
      setIsAddModalOpen(false);
      showToast(`Candidate ${newForm.studentName} registered (HIS-2026-${randomNum}).`);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to create application."}`);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    try {
      await updateAdmission(editingApp.id, {
        student_name: editingApp.studentName,
        date_of_birth: editingApp.dateOfBirth || null,
        gender: editingApp.gender || null,
        grade: editingApp.grade,
        previous_school: editingApp.previousSchool || null,
        parent_name: editingApp.parentName || null,
        parent_email: editingApp.parentEmail,
        parent_phone: editingApp.parentPhone,
        status: editingApp.status,
        assessment_date: editingApp.assessmentDate || null,
        notes: editingApp.notes || null,
      });
      setApplications((prev) => prev.map((a) => a.id === editingApp.id ? editingApp : a));
      if (selectedApp?.id === editingApp.id) setSelectedApp(editingApp);
      setEditingApp(null);
      showToast(`Application ${editingApp.id} updated successfully.`);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to update application."}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingApp) return;
    try {
      await deleteAdmission(deletingApp.id);
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
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 whitespace-nowrap"
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
            <span className="text-xl font-black text-amber-700">{pendingCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">event_available</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assessments</span>
            <span className="text-xl font-black text-blue-700">{scheduledCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">verified</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Enrolled / Approved</span>
            <span className="text-xl font-black text-emerald-700">{approvedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-slate-400 mr-1 self-center">Status:</span>
            {(["All", "Pending", "Assessment Scheduled", "Approved", "Declined"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? "bg-[#0E3B7D] text-white shadow-xs font-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search candidate, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-xs text-slate-900"
            />
          </div>
        </div>

        {/* Grade Filter Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-[#0E3B7D]">menu_book</span>
            <span>Academic Stream:</span>
          </span>
          {[
            { id: "All", label: "All Streams" },
            { id: "Lower Secondary", label: "Lower Secondary (Y7–9)" },
            { id: "Pearson IGCSE", label: "IGCSE (Y10–11)" },
            { id: "Pearson IAL", label: "IAL / A-Level (Y12–13)" },
          ].map((gradeOpt) => (
            <button
              key={gradeOpt.id}
              onClick={() => setGradeFilter(gradeOpt.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                gradeFilter === gradeOpt.id
                  ? "bg-[#FFC700] text-[#09234B] font-black shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {gradeOpt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Ref ID / Candidate</th>
                <th className="px-5 py-3.5">Target Grade</th>
                <th className="px-5 py-3.5">Parent / Contact</th>
                <th className="px-5 py-3.5">Submitted Date</th>
                <th className="px-5 py-3.5">Pipeline Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0E3B7D] flex items-center justify-center font-black text-xs shrink-0">
                          {app.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#09234B]">{app.studentName}</p>
                          <span className="text-[10px] font-mono text-slate-400">{app.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-800">{app.grade}</span>
                      {app.previousSchool && (
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">
                          Prev: {app.previousSchool}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{app.parentName || "Parent"}</p>
                      <div className="flex flex-col text-[11px] text-slate-500">
                        <span>{app.parentPhone}</span>
                        <span className="text-[10px] text-slate-400">{app.parentEmail}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">
                      {app.submittedDate}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${statusBadgeClasses[app.status]}`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-2.5 py-1.5 text-xs font-bold text-[#0E3B7D] hover:bg-[#E8F0FE] rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Open Applicant Dossier"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">visibility</span>
                          <span>Dossier</span>
                        </button>
                        <button
                          onClick={() => setEditingApp({ ...app })}
                          className="p-1.5 text-slate-500 hover:text-[#0E3B7D] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Candidate Details"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingApp(app)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove Record"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 block mb-2">how_to_reg</span>
                    <p className="text-sm font-bold text-[#09234B]">No admission applications found</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Candidate records submitted online via the 4-step admission wizard will appear here in real-time.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
          <span>Showing {filteredApplications.length} of {applications.length} candidate records</span>
          <span className="font-semibold text-slate-600">Hinthar School Registry System</span>
        </div>
      </div>

      {/* 1. APPLICANT DOSSIER MODAL */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedApp(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="mb-6 flex items-start justify-between pr-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0E3B7D] bg-[#E8F0FE] px-2.5 py-0.5 rounded-md">
                  Official Admission Dossier
                </span>
                <h3 className="text-2xl font-black text-[#09234B] mt-1.5">{selectedApp.studentName}</h3>
                <p className="text-xs font-mono text-slate-500 font-bold">Reference ID: {selectedApp.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase ${statusBadgeClasses[selectedApp.status]}`}>
                {selectedApp.status}
              </span>
            </div>

            {/* Candidate & Parent Information Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Grade</span>
                <p className="font-black text-[#09234B] text-sm mt-0.5">{selectedApp.grade}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Previous School</span>
                <p className="font-bold text-slate-700 mt-0.5">{selectedApp.previousSchool || "Not Specified"}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date of Birth</span>
                <p className="font-bold text-slate-700 mt-0.5">{selectedApp.dateOfBirth || "Not Specified"}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parent / Guardian</span>
                <p className="font-bold text-slate-700 mt-0.5">{selectedApp.parentName || "Not Specified"}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Email</span>
                <p className="font-bold text-slate-700 mt-0.5">{selectedApp.parentEmail}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</span>
                <p className="font-bold text-slate-700 mt-0.5">{selectedApp.parentPhone}</p>
              </div>
            </div>

            {/* Assessment Scheduling & Faculty Notes */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-black text-[#09234B] uppercase tracking-wider block mb-1">
                  Scheduled Entrance Assessment Date &amp; Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    defaultValue={selectedApp.assessmentDate || ""}
                    id="assessment-date-input"
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById("assessment-date-input") as HTMLInputElement;
                      if (input) {
                        handleSaveNotes(selectedApp.id, selectedApp.notes || "", input.value);
                      }
                    }}
                    className="px-4 py-2 bg-[#0E3B7D] hover:bg-[#164E9A] text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Save Slot
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-[#09234B] uppercase tracking-wider block mb-1">
                  Internal Faculty Notes &amp; Assessment Remarks
                </label>
                <textarea
                  defaultValue={selectedApp.notes || ""}
                  id="internal-notes-input"
                  rows={3}
                  placeholder="Record interview notes, diagnostic score, placement recommendations..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D] resize-none"
                />
                <button
                  onClick={() => {
                    const textarea = document.getElementById("internal-notes-input") as HTMLTextAreaElement;
                    if (textarea) {
                      handleSaveNotes(selectedApp.id, textarea.value);
                    }
                  }}
                  className="mt-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">save</span>
                  <span>Save Remarks</span>
                </button>
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="border-t border-slate-200 pt-4 flex flex-wrap gap-2.5">
              <button
                onClick={() => handleUpdateStatus(selectedApp.id, "Approved")}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                <span>Approve &amp; Enroll</span>
              </button>

              <button
                onClick={() => handleUpdateStatus(selectedApp.id, "Assessment Scheduled")}
                className="py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider transition-all"
              >
                Mark Scheduled
              </button>

              <button
                onClick={() => handleUpdateStatus(selectedApp.id, "Declined")}
                className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider transition-all"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADD MANUAL CANDIDATE MODAL */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0E3B7D]">
                New Candidate Registration
              </span>
              <h3 className="text-xl font-black text-[#09234B] mt-1">Register Admission Candidate</h3>
              <p className="text-xs text-slate-500">Record a walk-in, phone, or transfer applicant into the active registry.</p>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newForm.studentName}
                    onChange={(e) => setNewForm({ ...newForm, studentName: e.target.value })}
                    placeholder="e.g. Myat Thu Kha"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Target Academic Grade *</label>
                  <select
                    value={newForm.grade}
                    onChange={(e) => setNewForm({ ...newForm, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="Lower Secondary (Year 7)">Lower Secondary (Year 7)</option>
                    <option value="Lower Secondary (Year 8)">Lower Secondary (Year 8)</option>
                    <option value="Lower Secondary (Year 9)">Lower Secondary (Year 9)</option>
                    <option value="Pearson IGCSE (Year 10)">Pearson IGCSE (Year 10)</option>
                    <option value="Pearson IGCSE (Year 11)">Pearson IGCSE (Year 11)</option>
                    <option value="Pearson IAL (Year 12)">Pearson IAL (Year 12)</option>
                    <option value="Pearson IAL (Year 13)">Pearson IAL (Year 13)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newForm.dateOfBirth}
                    onChange={(e) => setNewForm({ ...newForm, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Previous School / Institution</label>
                  <input
                    type="text"
                    value={newForm.previousSchool}
                    onChange={(e) => setNewForm({ ...newForm, previousSchool: e.target.value })}
                    placeholder="e.g. Yangon Academy"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={newForm.parentName}
                    onChange={(e) => setNewForm({ ...newForm, parentName: e.target.value })}
                    placeholder="e.g. U Zaw Min"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Parent Email *</label>
                  <input
                    type="email"
                    required
                    value={newForm.parentEmail}
                    onChange={(e) => setNewForm({ ...newForm, parentEmail: e.target.value })}
                    placeholder="parent@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Parent Phone (Tel) *</label>
                  <input
                    type="tel"
                    required
                    value={newForm.parentPhone}
                    onChange={(e) => setNewForm({ ...newForm, parentPhone: e.target.value })}
                    placeholder="+95 9..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Initial Application Remarks</label>
                <textarea
                  rows={2}
                  value={newForm.notes}
                  onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
                  placeholder="Subject interests, scholarship requests, transfer credentials..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all"
                >
                  Register Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. FULL EDIT CANDIDATE MODAL */}
      {editingApp && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingApp(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingApp(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0E3B7D]">
                Comprehensive Application Editor
              </span>
              <h3 className="text-xl font-black text-[#09234B] mt-0.5">Edit Candidate Record</h3>
              <p className="text-xs font-mono text-slate-400">Application Reference ID: {editingApp.id}</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingApp.studentName}
                    onChange={(e) => setEditingApp({ ...editingApp, studentName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Target Grade Level *</label>
                  <select
                    value={editingApp.grade}
                    onChange={(e) => setEditingApp({ ...editingApp, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="Lower Secondary (Year 7)">Lower Secondary (Year 7)</option>
                    <option value="Lower Secondary (Year 8)">Lower Secondary (Year 8)</option>
                    <option value="Lower Secondary (Year 9)">Lower Secondary (Year 9)</option>
                    <option value="Pearson IGCSE (Year 10)">Pearson IGCSE (Year 10)</option>
                    <option value="Pearson IGCSE (Year 11)">Pearson IGCSE (Year 11)</option>
                    <option value="Pearson IAL (Year 12)">Pearson IAL (Year 12)</option>
                    <option value="Pearson IAL (Year 13)">Pearson IAL (Year 13)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editingApp.dateOfBirth || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Gender</label>
                  <select
                    value={editingApp.gender || "Male"}
                    onChange={(e) => setEditingApp({ ...editingApp, gender: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Pipeline Status *</label>
                  <select
                    value={editingApp.status}
                    onChange={(e) => setEditingApp({ ...editingApp, status: e.target.value as ApplicationStatus })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D] font-bold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Assessment Scheduled">Assessment Scheduled</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Parent / Guardian</label>
                  <input
                    type="text"
                    value={editingApp.parentName || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, parentName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Parent Email *</label>
                  <input
                    type="email"
                    required
                    value={editingApp.parentEmail}
                    onChange={(e) => setEditingApp({ ...editingApp, parentEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Parent Phone (Tel) *</label>
                  <input
                    type="tel"
                    required
                    value={editingApp.parentPhone}
                    onChange={(e) => setEditingApp({ ...editingApp, parentPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Previous School</label>
                  <input
                    type="text"
                    value={editingApp.previousSchool || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, previousSchool: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Assessment Date &amp; Time Slot</label>
                  <input
                    type="datetime-local"
                    value={editingApp.assessmentDate || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, assessmentDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Internal Faculty Notes &amp; Stream Remarks</label>
                <textarea
                  rows={3}
                  value={editingApp.notes || ""}
                  onChange={(e) => setEditingApp({ ...editingApp, notes: e.target.value })}
                  placeholder="Record interview notes, diagnostic score, placement recommendations..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all"
                >
                  Save Changes &amp; Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DELETE CONFIRMATION MODAL */}
      {deletingApp && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingApp(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl font-bold">delete_forever</span>
            </div>
            <h3 className="text-lg font-black text-[#09234B]">Remove Candidate Record</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to remove <strong>{deletingApp.studentName}</strong> ({deletingApp.id}) from the admissions database?
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={() => setDeletingApp(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white uppercase tracking-wider rounded-xl shadow-xs transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
