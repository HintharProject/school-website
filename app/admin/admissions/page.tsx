"use client";

import { useState, useEffect, useTransition } from "react";
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
  updateAdmissionDetailsAction,
  deleteAdmissionAction,
} from "@/lib/actions/admissions";
import {
  getAdmissionsConfig,
  upsertSiteContentAction,
} from "@/lib/actions/siteContent";
import type { AdmissionsConfigContent } from "@/lib/content/defaults";
import { DEFAULT_ADMISSIONS_CONFIG } from "@/lib/content/defaults";
import {
  CheckCircle,
  GraduationCap,
  DownloadSimple,
  Users,
  Sliders,
  FolderSimple,
  ClockCountdown,
  CalendarCheck,
  SealCheck,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  FloppyDisk,
  X,
  Plus,
  FileText,
  User,
  AddressBook,
  Paperclip,
  Lock,
  ArrowSquareOut,
  WarningCircle,
} from "@phosphor-icons/react";

const statusBadgeClasses: Record<ApplicationStatus, string> = {
  Pending: "bg-amber-50 text-amber-800 border border-amber-200",
  "Assessment Scheduled": "bg-blue-50 text-blue-800 border border-blue-200",
  Approved: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  Declined: "bg-rose-50 text-rose-800 border border-rose-200",
};

export default function AdminAdmissionsPage() {
  const { data: session } = authClient.useSession();
  const currentUser: UserProfile = session?.user
    ? mapUserProfileRecord(session.user)
    : FALLBACK_GUEST_USER;

  const [activeTab, setActiveTab] = useState<"pipeline" | "settings">("pipeline");
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [config, setConfig] = useState<AdmissionsConfigContent>(DEFAULT_ADMISSIONS_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");

  // Modals
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [editingApp, setEditingApp] = useState<AdmissionApplication | null>(null);
  const [deletingApp, setDeletingApp] = useState<AdmissionApplication | null>(null);

  // New option input values for settings lists
  const [newTermInput, setNewTermInput] = useState("");
  const [newModeInput, setNewModeInput] = useState("");
  const [newStreamInput, setNewStreamInput] = useState("");
  const [newRelInput, setNewRelInput] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const [appsData, configData] = await Promise.all([
        getAdmissions(),
        getAdmissionsConfig(),
      ]);
      setApplications(appsData.map(mapAdmissionRecord));
      if (configData) setConfig(configData);
    } catch (err) {
      console.warn("Failed to load admissions data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    if (statusFilter !== "All" && app.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.studentName.toLowerCase().includes(q);
      const matchEmail = app.parentEmail.toLowerCase().includes(q);
      const matchPhone = app.parentPhone.toLowerCase().includes(q);
      const matchGrade = app.grade.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchGrade;
    }
    return true;
  });

  // Stats
  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === "Pending").length;
  const scheduledCount = applications.filter(
    (a) => a.status === "Assessment Scheduled"
  ).length;
  const approvedCount = applications.filter((a) => a.status === "Approved").length;
  const declinedCount = applications.filter((a) => a.status === "Declined").length;

  // Status updater
  const handleUpdateStatus = (appId: string, nextStatus: ApplicationStatus) => {
    startTransition(async () => {
      const res = await updateAdmissionStatusAction(appId, nextStatus);
      if (res?.success) {
        showToast(`Status updated to "${nextStatus}"`);
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: nextStatus } : a))
        );
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp({ ...selectedApp, status: nextStatus });
        }
      } else {
        showToast("Failed to update status");
      }
    });
  };

  // Edit save
  const handleSaveAppDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    startTransition(async () => {
      const res = await updateAdmissionDetailsAction(editingApp.id, {
        status: editingApp.status,
        assessmentDate: editingApp.assessmentDate || null,
        notes: editingApp.notes || null,
        grade: editingApp.grade,
        academicStream: editingApp.academicStream || null,
        preferredRegion: editingApp.preferredRegion || "Yangon",
      });
      if (res?.success) {
        showToast("Application updated successfully");
        setApplications((prev) =>
          prev.map((a) => (a.id === editingApp.id ? editingApp : a))
        );
        setEditingApp(null);
      } else {
        showToast("Failed to update application");
      }
    });
  };

  // Delete
  const handleDeleteApp = () => {
    if (!deletingApp) return;
    startTransition(async () => {
      const res = await deleteAdmissionAction(deletingApp.id);
      if (res?.success) {
        showToast("Application removed");
        setApplications((prev) => prev.filter((a) => a.id !== deletingApp.id));
        setDeletingApp(null);
      } else {
        showToast("Failed to delete application");
      }
    });
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Application ID",
      "Student Name",
      "Date of Birth",
      "Gender",
      "Nationality",
      "Previous School",
      "Preferred Region",
      "Pearson Pathway",
      "Academic Stream",
      "Guardian Name",
      "Relationship",
      "Guardian Email",
      "Guardian Phone",
      "Intended Start Term",
      "Study Mode",
      "Status",
      "Assessment Date",
      "Submitted Date",
      "Notes",
    ];

    const rows = filteredApps.map((a) => [
      `"${a.id}"`,
      `"${a.studentName.replace(/"/g, '""')}"`,
      `"${a.dateOfBirth || ""}"`,
      `"${a.gender || ""}"`,
      `"${a.nationality || ""}"`,
      `"${(a.previousSchool || "").replace(/"/g, '""')}"`,
      `"${a.preferredRegion || "Yangon"}"`,
      `"${(a.grade || "").replace(/"/g, '""')}"`,
      `"${(a.academicStream || "").replace(/"/g, '""')}"`,
      `"${(a.parentName || "").replace(/"/g, '""')}"`,
      `"${(a.relationship || "").replace(/"/g, '""')}"`,
      `"${a.parentEmail}"`,
      `"${a.parentPhone}"`,
      `"${(a.intendedStartTerm || "").replace(/"/g, '""')}"`,
      `"${(a.studyMode || "").replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${a.assessmentDate || ""}"`,
      `"${a.submittedDate || ""}"`,
      `"${(a.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Hinthar_Admissions_Export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredApps.length} applications to CSV!`);
  };

  // Save Config Settings
  const handleSaveConfig = () => {
    startTransition(async () => {
      const res = await upsertSiteContentAction("admissionsConfig", config);
      if (res?.success) {
        showToast("Admissions form settings saved successfully!");
      } else {
        showToast(res?.message || "Failed to save settings");
      }
    });
  };

  if (currentUser?.role === "student") {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" weight="bold" />
        </div>
        <h2 className="text-xl font-black text-slate-800">Admissions Pipeline Restricted</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Access to student admissions records and applicant data is strictly restricted to School Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F2759] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FFD600] animate-fade-in">
          <CheckCircle className="w-5 h-5 text-[#FFD600]" weight="fill" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0F2759]">Admissions &amp; Pipeline</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#193E8A] font-extrabold text-xs">
              {totalCount} Total Submissions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage student online applications, review uploaded documents, schedule assessments, and configure intake options.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <DownloadSimple className="w-4 h-4" weight="bold" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "pipeline"
              ? "border-[#193E8A] text-[#193E8A]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" weight="bold" />
          <span>Applications Pipeline ({filteredApps.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "settings"
              ? "border-[#193E8A] text-[#193E8A]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sliders className="w-4 h-4" weight="bold" />
          <span>Form &amp; Upload Rules</span>
        </button>
      </div>

      {/* TAB 1: PIPELINE */}
      {activeTab === "pipeline" && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <ClockCountdown className="w-5 h-5" weight="bold" />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900">{pendingCount}</span>
                <p className="text-[11px] font-bold text-slate-400">Under Review</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5" weight="bold" />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900">{scheduledCount}</span>
                <p className="text-[11px] font-bold text-slate-400">Assessment Scheduled</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <SealCheck className="w-5 h-5" weight="bold" />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900">{approvedCount}</span>
                <p className="text-[11px] font-bold text-slate-400">Approved</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <WarningCircle className="w-5 h-5" weight="bold" />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900">{declinedCount}</span>
                <p className="text-[11px] font-bold text-slate-400">Declined / Closed</p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {(["All", "Pending", "Assessment Scheduled", "Approved", "Declined"] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === status
                        ? "bg-[#193E8A] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>

            <div className="relative w-full sm:w-72">
              <MagnifyingGlass
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                weight="bold"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, guardian, phone..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#193E8A]"
              />
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="p-4 pl-6">Student &amp; Ref</th>
                    <th className="p-4">Pearson Pathway &amp; Stream</th>
                    <th className="p-4">Campus &amp; Term</th>
                    <th className="p-4">Guardian Contact</th>
                    <th className="p-4">Docs</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="font-extrabold text-[#0F2759] hover:underline block text-left"
                        >
                          {app.studentName}
                        </button>
                        <span className="font-mono text-[10px] text-slate-400">{app.id}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 block">{app.grade}</span>
                        <span className="text-[11px] text-slate-400">{app.academicStream || "General"}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-700 block">{app.preferredRegion || "Yangon"}</span>
                        <span className="text-[11px] text-slate-400">{app.intendedStartTerm || "Term 1"}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-700 block">{app.parentName || "Guardian"}</span>
                        <span className="text-[11px] text-slate-400 block">{app.parentPhone}</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                          <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                          <span>{(app.documentUrls || []).length}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            statusBadgeClasses[app.status]
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="View Full Details"
                          >
                            <FileText className="w-3.5 h-3.5" weight="bold" />
                          </button>
                          <button
                            onClick={() => setEditingApp(app)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#193E8A]"
                            title="Edit Status & Notes"
                          >
                            <PencilSimple className="w-3.5 h-3.5" weight="bold" />
                          </button>
                          <button
                            onClick={() => setDeletingApp(app)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                            title="Delete Application"
                          >
                            <Trash className="w-3.5 h-3.5" weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredApps.length === 0 && (
                <div className="text-center py-12 text-xs text-slate-400">
                  No applications found matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SETTINGS (Admissions Form & Upload Rules) */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Document Upload Limits */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <h2 className="text-sm font-black text-[#0F2759] uppercase tracking-wider">
              Document Upload Rules for Online Applicants
            </h2>
            <p className="text-xs text-slate-500">
              Toggle whether documents are strictly required to submit the online form or optional.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.documentRules?.identityRequired ?? false}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      documentRules: {
                        ...config.documentRules,
                        identityRequired: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-[#193E8A]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Student ID / NRC / Birth Cert
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {config.documentRules?.identityRequired ? "Mandatory for submit" : "Optional"}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.documentRules?.reportRequired ?? false}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      documentRules: {
                        ...config.documentRules,
                        reportRequired: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-[#193E8A]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Prior Academic Transcript
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {config.documentRules?.reportRequired ? "Mandatory for submit" : "Optional"}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.documentRules?.photoRequired ?? false}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      documentRules: {
                        ...config.documentRules,
                        photoRequired: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-[#193E8A]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Passport-Size Portrait Photo
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {config.documentRules?.photoRequired ? "Mandatory for submit" : "Optional"}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* List Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Intended Start Terms */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
              <h3 className="text-xs font-black text-[#0F2759] uppercase tracking-wider">
                Intended Starting Terms
              </h3>
              <div className="space-y-2">
                {(config.intendedStartTerms || []).map((term, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  >
                    <span>{term}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          intendedStartTerms: config.intendedStartTerms.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTermInput}
                  onChange={(e) => setNewTermInput(e.target.value)}
                  placeholder="e.g. Term 4 (Summer 2027)"
                  className="flex-1 text-xs p-2 rounded-xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTermInput.trim()) {
                      setConfig({
                        ...config,
                        intendedStartTerms: [...(config.intendedStartTerms || []), newTermInput.trim()],
                      });
                      setNewTermInput("");
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-[#193E8A] text-white text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Academic Streams */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
              <h3 className="text-xs font-black text-[#0F2759] uppercase tracking-wider">
                Academic Streams
              </h3>
              <div className="space-y-2">
                {(config.academicStreams || []).map((stream, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  >
                    <span>{stream}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          academicStreams: config.academicStreams.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStreamInput}
                  onChange={(e) => setNewStreamInput(e.target.value)}
                  placeholder="e.g. Creative Arts & Media"
                  className="flex-1 text-xs p-2 rounded-xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newStreamInput.trim()) {
                      setConfig({
                        ...config,
                        academicStreams: [...(config.academicStreams || []), newStreamInput.trim()],
                      });
                      setNewStreamInput("");
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-[#193E8A] text-white text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Study Modes */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
              <h3 className="text-xs font-black text-[#0F2759] uppercase tracking-wider">
                Study Modes
              </h3>
              <div className="space-y-2">
                {(config.studyModes || []).map((mode, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  >
                    <span>{mode}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          studyModes: config.studyModes.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newModeInput}
                  onChange={(e) => setNewModeInput(e.target.value)}
                  placeholder="e.g. Weekend Intensive"
                  className="flex-1 text-xs p-2 rounded-xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newModeInput.trim()) {
                      setConfig({
                        ...config,
                        studyModes: [...(config.studyModes || []), newModeInput.trim()],
                      });
                      setNewModeInput("");
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-[#193E8A] text-white text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Relationships */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
              <h3 className="text-xs font-black text-[#0F2759] uppercase tracking-wider">
                Guardian Relationships
              </h3>
              <div className="space-y-2">
                {(config.relationships || []).map((rel, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  >
                    <span>{rel}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          relationships: config.relationships.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRelInput}
                  onChange={(e) => setNewRelInput(e.target.value)}
                  placeholder="e.g. Grandparent"
                  className="flex-1 text-xs p-2 rounded-xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newRelInput.trim()) {
                      setConfig({
                        ...config,
                        relationships: [...(config.relationships || []), newRelInput.trim()],
                      });
                      setNewRelInput("");
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-[#193E8A] text-white text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveConfig}
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFD600] hover:bg-[#ECC300] text-[#162033] font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <FloppyDisk className="w-4 h-4" weight="bold" />
              <span>{isPending ? "Saving Settings..." : "Save Admissions Form Settings"}</span>
            </button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-[#0F2759]">
                  {selectedApp.studentName}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Ref Code: {selectedApp.id} · Submitted: {selectedApp.submittedDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" weight="bold" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Student details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-extrabold text-[#0F2759] uppercase tracking-wider text-[11px]">
                  Student &amp; Academic Pathway
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">DOB</span>
                    <span className="font-semibold text-slate-800">{selectedApp.dateOfBirth || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gender</span>
                    <span className="font-semibold text-slate-800">{selectedApp.gender || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nationality</span>
                    <span className="font-semibold text-slate-800">{selectedApp.nationality || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pathway / Level</span>
                    <span className="font-semibold text-slate-800">{selectedApp.grade}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Stream</span>
                    <span className="font-semibold text-slate-800">{selectedApp.academicStream || "General"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Preferred Region</span>
                    <span className="font-semibold text-slate-800">{selectedApp.preferredRegion || "Yangon"}</span>
                  </div>
                </div>
              </div>

              {/* Guardian details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-extrabold text-[#0F2759] uppercase tracking-wider text-[11px]">
                  Guardian &amp; Contact Details
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Guardian Name</span>
                    <span className="font-semibold text-slate-800">{selectedApp.parentName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Relationship</span>
                    <span className="font-semibold text-slate-800">{selectedApp.relationship || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone</span>
                    <span className="font-semibold text-slate-800">{selectedApp.parentPhone}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[10px]">Email</span>
                    <span className="font-semibold text-slate-800">{selectedApp.parentEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Address</span>
                    <span className="font-semibold text-slate-800">{selectedApp.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-extrabold text-[#0F2759] uppercase tracking-wider text-[11px]">
                  Uploaded Supporting Documents ({(selectedApp.documentUrls || []).length})
                </h3>
                <div className="space-y-2 pt-1">
                  {(selectedApp.documentUrls || []).map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-[#193E8A]" />
                        <span className="font-bold text-slate-800 uppercase text-[10px]">
                          [{doc.type}]
                        </span>
                        <span className="text-slate-600 truncate max-w-xs">{doc.filename}</span>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        <ArrowSquareOut className="w-3.5 h-3.5" />
                        <span>View / Download</span>
                      </a>
                    </div>
                  ))}
                  {(!selectedApp.documentUrls || selectedApp.documentUrls.length === 0) && (
                    <p className="text-slate-400 text-xs italic">No documents uploaded.</p>
                  )}
                </div>
              </div>

              {/* Status & Assessment */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="font-extrabold text-[#0F2759] uppercase tracking-wider text-[11px]">
                  Status &amp; Schedule
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {(["Pending", "Assessment Scheduled", "Approved", "Declined"] as const).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(selectedApp.id, st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedApp.status === st
                            ? "bg-[#193E8A] text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
                {selectedApp.notes && (
                  <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold block text-[10px] text-slate-400 uppercase">
                      Internal Notes:
                    </span>
                    {selectedApp.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-[#0F2759]">Update Application</h2>
              <button
                onClick={() => setEditingApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSaveAppDetails} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={editingApp.status}
                  onChange={(e) =>
                    setEditingApp({
                      ...editingApp,
                      status: e.target.value as ApplicationStatus,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="Pending">Pending</option>
                  <option value="Assessment Scheduled">Assessment Scheduled</option>
                  <option value="Approved">Approved</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assessment Date &amp; Time</label>
                <input
                  type="text"
                  value={editingApp.assessmentDate || ""}
                  onChange={(e) =>
                    setEditingApp({ ...editingApp, assessmentDate: e.target.value })
                  }
                  placeholder="e.g. 2026-08-15 10:00 AM (Ywarma Campus)"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Admin Notes</label>
                <textarea
                  rows={3}
                  value={editingApp.notes || ""}
                  onChange={(e) =>
                    setEditingApp({ ...editingApp, notes: e.target.value })
                  }
                  placeholder="Add counseling or interview notes..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl text-[#162033] bg-[#FFD600] hover:bg-[#ECC300] font-black"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <WarningCircle className="w-6 h-6" weight="bold" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Delete Application?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to remove the application for <span className="font-bold text-slate-800">{deletingApp.studentName}</span> ({deletingApp.id})?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingApp(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteApp}
                className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700"
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
