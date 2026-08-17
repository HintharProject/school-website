"use client";

import { useState, useEffect } from "react";
import {
  AdmissionApplication,
  ApplicationStatus,
  getStoredApplications,
  saveStoredApplications,
  getActiveAdminRole,
  UserProfile,
  INITIAL_USER_ACCOUNTS,
} from "../adminStore";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

const statusBadgeClasses: Record<ApplicationStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 border border-amber-200",
  "Assessment Scheduled": "bg-blue-100 text-blue-800 border border-blue-200",
  Approved: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  Declined: "bg-rose-100 text-rose-800 border border-rose-200",
};

export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER_ACCOUNTS[0]);
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
    setCurrentUser(getActiveAdminRole());

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("admissions")
          .select("*")
          .order("id", { ascending: false });

        if (!error && data) {
          const mapped: AdmissionApplication[] = data.map((d: any) => ({
            id: d.id,
            studentName: d.student_name,
            dateOfBirth: d.date_of_birth,
            gender: d.gender,
            grade: d.grade,
            previousSchool: d.previous_school,
            parentName: d.parent_name,
            parentEmail: d.parent_email,
            parentPhone: d.parent_phone,
            submittedDate: d.submitted_date || d.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
            status: d.status as ApplicationStatus,
            assessmentDate: d.assessment_date,
            notes: d.notes,
          }));
          setApplications(mapped);
          saveStoredApplications(mapped);
          setIsLoaded(true);
          return;
        }
      } catch (err) {
        console.warn("Supabase admissions fetch error, using local fallback:", err);
      }
    }

    setApplications(getStoredApplications());
    setIsLoaded(true);
  };

  // Load applications from live database on mount & listen for updates
  useEffect(() => {
    loadData();

    const handleStorageUpdate = () => {
      setApplications(getStoredApplications());
    };
    const handleRoleUpdate = () => {
      setCurrentUser(getActiveAdminRole());
    };

    window.addEventListener("his_applications_updated", handleStorageUpdate);
    window.addEventListener("his_role_updated", handleRoleUpdate);
    return () => {
      window.removeEventListener("his_applications_updated", handleStorageUpdate);
      window.removeEventListener("his_role_updated", handleRoleUpdate);
    };
  }, []);

  if (currentUser.role === "student") {
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
    const updated = applications.map((a) =>
      a.id === id ? { ...a, status: newStatus } : a
    );
    setApplications(updated);
    saveStoredApplications(updated);

    if (selectedApp && selectedApp.id === id) {
      setSelectedApp({ ...selectedApp, status: newStatus });
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from("admissions")
          .update({ status: newStatus })
          .eq("id", id);
      } catch (err) {
        console.warn("Supabase status update error:", err);
      }
    }

    showToast(`Application ${id} marked as ${newStatus}`);
  };

  const handleSaveNotes = async (id: string, notes: string, assessmentDate?: string) => {
    const updated = applications.map((a) =>
      a.id === id ? { ...a, notes, assessmentDate: assessmentDate || a.assessmentDate } : a
    );
    setApplications(updated);
    saveStoredApplications(updated);

    if (selectedApp && selectedApp.id === id) {
      setSelectedApp({ ...selectedApp, notes, assessmentDate: assessmentDate || selectedApp.assessmentDate });
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from("admissions")
          .update({
            notes,
            assessment_date: assessmentDate || undefined,
          })
          .eq("id", id);
      } catch (err) {
        console.warn("Supabase notes update error:", err);
      }
    }

    showToast("Applicant remarks saved.");
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.studentName || !newForm.parentEmail || !newForm.parentPhone) return;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newRecord: AdmissionApplication = {
      id: `HIS-2026-${randomNum}`,
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

    const updated = [newRecord, ...applications];
    setApplications(updated);
    saveStoredApplications(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from("admissions").insert([
          {
            id: newRecord.id,
            student_name: newRecord.studentName,
            date_of_birth: newRecord.dateOfBirth || null,
            gender: newRecord.gender,
            grade: newRecord.grade,
            previous_school: newRecord.previousSchool || null,
            parent_name: newRecord.parentName || null,
            parent_email: newRecord.parentEmail,
            parent_phone: newRecord.parentPhone,
            submitted_date: newRecord.submittedDate,
            status: newRecord.status,
            notes: newRecord.notes || null,
          },
        ]);
      } catch (err) {
        console.warn("Supabase admission insert error:", err);
      }
    }

    setIsAddModalOpen(false);
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

    showToast(`Candidate ${newRecord.studentName} registered.`);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    const updated = applications.map((a) =>
      a.id === editingApp.id ? editingApp : a
    );
    setApplications(updated);
    saveStoredApplications(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from("admissions")
          .update({
            student_name: editingApp.studentName,
            grade: editingApp.grade,
            status: editingApp.status,
            parent_email: editingApp.parentEmail,
            parent_phone: editingApp.parentPhone,
          })
          .eq("id", editingApp.id);
      } catch (err) {
        console.warn("Supabase candidate update error:", err);
      }
    }

    setEditingApp(null);
    showToast("Candidate record updated.");
  };

  const handleConfirmDelete = async () => {
    if (!deletingApp) return;
    const updated = applications.filter((a) => a.id !== deletingApp.id);
    setApplications(updated);
    saveStoredApplications(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from("admissions").delete().eq("id", deletingApp.id);
      } catch (err) {
        console.warn("Supabase admission delete error:", err);
      }
    }

    if (selectedApp?.id === deletingApp.id) setSelectedApp(null);
    setDeletingApp(null);
    showToast("Candidate record removed.");
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-3.5 py-1 rounded-full mb-2 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-xs font-bold">how_to_reg</span>
            <span className="text-[11px] font-black text-[#0E3B7D] uppercase tracking-wider">
              Admissions &amp; Candidate Enrollment Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#09234B] tracking-tight">
            Admissions Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Assess, schedule entrance interviews, and enroll candidates for Academic Year 2026–2027
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-sm font-bold">person_add</span>
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-[#09234B]">{totalCount}</p>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Total Records</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">folder_shared</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between bg-amber-50/40">
          <div>
            <p className="text-2xl font-black text-amber-900">{pendingCount}</p>
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Review</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">pending_actions</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs flex items-center justify-between bg-blue-50/40">
          <div>
            <p className="text-2xl font-black text-blue-900">{scheduledCount}</p>
            <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Scheduled Exam</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">event_available</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between bg-emerald-50/40">
          <div>
            <p className="text-2xl font-black text-emerald-900">{approvedCount}</p>
            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Approved / Enrolled</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">verified</span>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "All")}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
            >
              <option value="All">All Statuses ({totalCount})</option>
              <option value="Pending">Pending Review ({pendingCount})</option>
              <option value="Assessment Scheduled">Assessment Scheduled ({scheduledCount})</option>
              <option value="Approved">Approved / Enrolled ({approvedCount})</option>
              <option value="Declined">Declined</option>
            </select>
          </div>

          {/* Grade Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Academic Stream
            </label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
            >
              <option value="All">All Academic Streams</option>
              <option value="Lower Secondary (Year 7)">Lower Secondary (Year 7)</option>
              <option value="Lower Secondary (Year 8)">Lower Secondary (Year 8)</option>
              <option value="Lower Secondary (Year 9)">Lower Secondary (Year 9)</option>
              <option value="Pearson IGCSE (Year 10)">Pearson IGCSE (Year 10)</option>
              <option value="Pearson IGCSE (Year 11)">Pearson IGCSE (Year 11)</option>
              <option value="Pearson IAL (Year 12)">Pearson IAL (Year 12)</option>
              <option value="Pearson IAL (Year 13)">Pearson IAL (Year 13)</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="md:col-span-2">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Search Candidates
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, Ref ID, parent contact, or school..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Candidate &amp; ID</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Grade Level</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider hidden sm:table-cell">Parent Contact</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider hidden md:table-cell">Date Submitted</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoaded && filteredApplications.length > 0 ? (
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
                    <p className="text-sm font-bold text-[#09234B]">No admission applications submitted yet</p>
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
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Parent Phone *</label>
                  <input
                    type="text"
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

      {/* 3. EDIT CANDIDATE MODAL */}
      {editingApp && (
        <div
          className="fixed inset-0 z-50 bg-[#09234B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingApp(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setEditingApp(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="mb-5">
              <h3 className="text-xl font-black text-[#09234B]">Edit Candidate Record</h3>
              <p className="text-xs text-slate-500">{editingApp.id}</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={editingApp.studentName}
                  onChange={(e) => setEditingApp({ ...editingApp, studentName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Grade Level</label>
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
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Status</label>
                  <select
                    value={editingApp.status}
                    onChange={(e) => setEditingApp({ ...editingApp, status: e.target.value as ApplicationStatus })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Assessment Scheduled">Assessment Scheduled</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Parent Email</label>
                  <input
                    type="email"
                    required
                    value={editingApp.parentEmail}
                    onChange={(e) => setEditingApp({ ...editingApp, parentEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Parent Phone</label>
                  <input
                    type="text"
                    required
                    value={editingApp.parentPhone}
                    onChange={(e) => setEditingApp({ ...editingApp, parentPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
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
                  Save Changes
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
