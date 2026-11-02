"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { authClient } from "@/lib/auth/auth-client";
import { isR2AssetUrl } from "@/lib/utils/r2Image";
import {
  getPortalYearbookBatches,
  getPortalYearbook,
  createYearbookBatchAction,
  updateYearbookBatchAction,
  deleteYearbookBatchAction,
  createYearbookAction,
  updateYearbookAction,
  setYearbookStatusAction,
  deleteYearbookAction,
} from "@/lib/actions/yearbook";
import ImageUploadPicker from "@/app/components/admin/ImageUploadPicker";
import BilingualField from "@/app/components/admin/BilingualField";
import {
  Student,
  GraduationCap,
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  X,
  CheckCircle,
  WarningCircle,
  Clock,
  Archive,
  Funnel,
  Buildings,
  Check,
} from "@phosphor-icons/react";

interface BatchItem {
  id: string;
  name: string;
  region: "Yangon" | "Mawlamyine";
  sortOrder: number;
  isActive: boolean;
}

interface ScholarItem {
  id: number;
  name: string;
  category: string;
  batchId: string | null;
  role: string;
  roleMy?: string | null;
  destination?: string | null;
  subjects?: string | null;
  quote: string;
  quoteMy?: string | null;
  image: string;
  badge?: string | null;
  badgeMy?: string | null;
  campus?: string | null;
  status: "published" | "pending_review" | "archived";
  submittedBy?: string | null;
  reviewerNotes?: string | null;
  batchName?: string | null;
  batchRegion?: "Yangon" | "Mawlamyine" | null;
}

export default function AdminYearbookPage() {
  const { data: session } = authClient.useSession();
  const isStudent = (session?.user as any)?.role === "student";

  const [activeTab, setActiveTab] = useState<"scholars" | "batches">("scholars");
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [scholars, setScholars] = useState<ScholarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Scholar Modal
  const [isScholarModalOpen, setIsScholarModalOpen] = useState(false);
  const [editingScholar, setEditingScholar] = useState<ScholarItem | null>(null);
  const [scholarForm, setScholarForm] = useState<Partial<ScholarItem>>({
    name: "",
    category: "Student",
    batchId: "",
    role: "Pearson IAL Scholar",
    roleMy: "",
    destination: "University of Cambridge · Natural Sciences",
    subjects: "Mathematics, Physics, Chemistry",
    quote: "Hinthar gave me the critical thinking skills to aim high.",
    quoteMy: "",
    image: "/images/g5.jpg",
    badge: "Valedictorian",
    badgeMy: "",
    campus: "both-campuses",
    status: "published",
  });

  // Batch Modal
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchItem | null>(null);
  const [batchForm, setBatchForm] = useState<Partial<BatchItem>>({
    id: "",
    name: "",
    region: "Yangon",
    sortOrder: 0,
    isActive: true,
  });

  // Delete Modals
  const [deletingScholar, setDeletingScholar] = useState<ScholarItem | null>(null);
  const [deletingBatch, setDeletingBatch] = useState<BatchItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const [batchRes, scholarRes] = await Promise.all([
        getPortalYearbookBatches(true),
        getPortalYearbook(),
      ]);
      setBatches(batchRes as BatchItem[]);
      setScholars(scholarRes as unknown as ScholarItem[]);
    } catch (err) {
      console.error("Failed to load yearbook data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter scholars
  const filteredScholars = scholars.filter((s) => {
    if (selectedBatch !== "All" && s.batchId !== selectedBatch) return false;
    if (selectedStatus !== "All" && s.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchRole = s.role?.toLowerCase().includes(q);
      const matchDest = s.destination?.toLowerCase().includes(q);
      return matchName || matchRole || matchDest;
    }
    return true;
  });

  // Save Scholar (Create or Update)
  const handleSaveScholar = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (editingScholar) {
          const res = await updateYearbookAction(editingScholar.id, scholarForm);
          if (res.success) {
            showToast("Scholar profile updated successfully!");
            setIsScholarModalOpen(false);
            setEditingScholar(null);
            loadData();
          } else {
            showToast(res.error || "Failed to update scholar");
          }
        } else {
          await createYearbookAction({
            ...scholarForm,
            status: isStudent ? "pending_review" : (scholarForm.status || "published"),
          });
          showToast(
            isStudent
              ? "Your yearbook entry was submitted for admin review!"
              : "Scholar profile created successfully!"
          );
          setIsScholarModalOpen(false);
          loadData();
        }
      } catch (err: any) {
        showToast(err.message || "An error occurred");
      }
    });
  };

  // Quick Status change (Admin only)
  const handleStatusChange = async (scholarId: number, nextStatus: "published" | "pending_review" | "archived") => {
    startTransition(async () => {
      try {
        const res = await setYearbookStatusAction(scholarId, nextStatus);
        if (res.success) {
          showToast(`Status updated to ${nextStatus}`);
          loadData();
        } else {
          showToast(res.error || "Failed to update status");
        }
      } catch (err: any) {
        showToast(err.message || "Error updating status");
      }
    });
  };

  // Delete Scholar
  const handleDeleteScholar = async () => {
    if (!deletingScholar) return;
    startTransition(async () => {
      try {
        await deleteYearbookAction(deletingScholar.id);
        showToast("Scholar entry deleted");
        setDeletingScholar(null);
        loadData();
      } catch (err: any) {
        showToast(err.message || "Error deleting scholar");
      }
    });
  };

  // Save Batch (Create or Update)
  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (editingBatch) {
          const res = await updateYearbookBatchAction(editingBatch.id, batchForm);
          if (res.success) {
            showToast("Batch updated successfully!");
            setIsBatchModalOpen(false);
            setEditingBatch(null);
            loadData();
          } else {
            showToast(res.error || "Failed to update batch");
          }
        } else {
          await createYearbookBatchAction({
            id: batchForm.id || `batch-${Date.now()}`,
            name: batchForm.name || "New Batch",
            region: batchForm.region || "Yangon",
            sortOrder: Number(batchForm.sortOrder) || 0,
            isActive: batchForm.isActive ?? true,
          });
          showToast("Yearbook batch created successfully!");
          setIsBatchModalOpen(false);
          loadData();
        }
      } catch (err: any) {
        showToast(err.message || "An error occurred");
      }
    });
  };

  // Delete Batch
  const handleDeleteBatch = async () => {
    if (!deletingBatch) return;
    startTransition(async () => {
      try {
        const res = await deleteYearbookBatchAction(deletingBatch.id);
        if (res.success) {
          showToast("Batch deleted");
          setDeletingBatch(null);
          loadData();
        } else {
          showToast(res.error || "Failed to delete batch");
        }
      } catch (err: any) {
        showToast(err.message || "Error deleting batch");
      }
    });
  };

  const openAddScholar = () => {
    setEditingScholar(null);
    setScholarForm({
      name: "",
      category: "Student",
      batchId: batches[0]?.id || "",
      role: "Pearson IAL Scholar",
      roleMy: "",
      destination: "",
      subjects: "",
      quote: "",
      quoteMy: "",
      image: "/images/g5.jpg",
      badge: "",
      badgeMy: "",
      campus: "both-campuses",
      status: isStudent ? "pending_review" : "published",
    });
    setIsScholarModalOpen(true);
  };

  const openEditScholar = (scholar: ScholarItem) => {
    setEditingScholar(scholar);
    setScholarForm({
      name: scholar.name,
      category: scholar.category,
      batchId: scholar.batchId || "",
      role: scholar.role,
      roleMy: scholar.roleMy || "",
      destination: scholar.destination || "",
      subjects: scholar.subjects || "",
      quote: scholar.quote,
      quoteMy: scholar.quoteMy || "",
      image: scholar.image,
      badge: scholar.badge || "",
      badgeMy: scholar.badgeMy || "",
      campus: scholar.campus || "both-campuses",
      status: scholar.status,
    });
    setIsScholarModalOpen(true);
  };

  const openAddBatch = () => {
    setEditingBatch(null);
    setBatchForm({
      id: "",
      name: "",
      region: "Yangon",
      sortOrder: 0,
      isActive: true,
    });
    setIsBatchModalOpen(true);
  };

  const openEditBatch = (b: BatchItem) => {
    setEditingBatch(b);
    setBatchForm({
      id: b.id,
      name: b.name,
      region: b.region,
      sortOrder: b.sortOrder,
      isActive: b.isActive,
    });
    setIsBatchModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F2759] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FFD600] animate-fade-in">
          <CheckCircle className="w-5 h-5 text-[#FFD600]" weight="fill" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0F2759]">
              Student Yearbook & Batches
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#193E8A] font-extrabold text-xs">
              {scholars.length} Scholars · {batches.length} Batches
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isStudent
              ? "Submit or update your student yearbook profile. All submissions are reviewed by the school administrator."
              : "Manage graduating cohorts, regional batches (Yangon & Mawlamyine), and scholar graduation profiles."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isStudent && activeTab === "batches" ? (
            <button
              onClick={openAddBatch}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFD600] hover:bg-[#ECC300] text-[#162033] font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" weight="bold" />
              <span>Create Batch</span>
            </button>
          ) : (
            <button
              onClick={openAddScholar}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFD600] hover:bg-[#ECC300] text-[#162033] font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" weight="bold" />
              <span>{isStudent ? "Submit Yearbook Profile" : "Add Scholar"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Tab Switcher */}
      {!isStudent && (
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("scholars")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "scholars"
                ? "border-[#193E8A] text-[#193E8A]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Student className="w-4 h-4" weight="bold" />
            <span>Scholars Directory ({scholars.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("batches")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "batches"
                ? "border-[#193E8A] text-[#193E8A]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <GraduationCap className="w-4 h-4" weight="bold" />
            <span>Regional Batches ({batches.length})</span>
          </button>
        </div>
      )}

      {/* TAB 1: SCHOLARS DIRECTORY */}
      {(isStudent || activeTab === "scholars") && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="All">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.region})
                  </option>
                ))}
              </select>

              {!isStudent && (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="archived">Archived</option>
                </select>
              )}
            </div>

            <div className="relative w-full sm:w-72">
              <MagnifyingGlass
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                weight="bold"
              />
              <input
                type="text"
                placeholder="Search scholars by name, role, destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#193E8A]"
              />
            </div>
          </div>

          {/* Scholars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredScholars.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                      <Image
                        src={s.image || "/images/g5.jpg"}
                        alt={s.name}
                        fill
                        unoptimized={isR2AssetUrl(s.image)}
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900 truncate">
                          {s.name}
                        </h3>
                        {s.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px] shrink-0">
                            {s.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#193E8A] truncate">
                        {s.role}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {s.batchName || "Unassigned Cohort"}
                      </p>
                    </div>
                  </div>

                  {s.destination && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                      <span className="font-bold block text-slate-400 text-[10px] uppercase">
                        University / Destination
                      </span>
                      <span>{s.destination}</span>
                    </div>
                  )}

                  <blockquote className="text-xs text-slate-600 italic line-clamp-3">
                    &ldquo;{s.quote}&rdquo;
                  </blockquote>

                  {/* Status badge */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        s.status === "published"
                          ? "bg-emerald-50 text-emerald-700"
                          : s.status === "pending_review"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {s.status === "published" && <Check className="w-3 h-3" weight="bold" />}
                      {s.status === "pending_review" && <Clock className="w-3 h-3" weight="bold" />}
                      {s.status === "archived" && <Archive className="w-3 h-3" weight="bold" />}
                      <span className="capitalize">{s.status.replace("_", " ")}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {!isStudent && s.status === "pending_review" && (
                        <button
                          onClick={() => handleStatusChange(s.id, "published")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => openEditScholar(s)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Edit Scholar"
                      >
                        <PencilSimple className="w-3.5 h-3.5" weight="bold" />
                      </button>
                      {!isStudent && (
                        <button
                          onClick={() => setDeletingScholar(s)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                          title="Delete Scholar"
                        >
                          <Trash className="w-3.5 h-3.5" weight="bold" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredScholars.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <p className="text-xs text-slate-500">No yearbook scholars found matching your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REGIONAL BATCHES (Admin Only) */}
      {!isStudent && activeTab === "batches" && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#0F2759]">
              Regional Graduation Cohorts
            </h2>
            <button
              onClick={openAddBatch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFD600] text-[#162033] text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" weight="bold" />
              <span>New Batch</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {batches.map((b) => (
              <div
                key={b.id}
                className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">{b.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#193E8A] font-bold text-[10px]">
                      {b.region}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        b.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {b.isActive ? "Active" : "Archived"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ID: <code className="font-mono">{b.id}</code> · Sort Order: {b.sortOrder}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditBatch(b)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    <PencilSimple className="w-4 h-4" weight="bold" />
                  </button>
                  <button
                    onClick={() => setDeletingBatch(b)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600"
                  >
                    <Trash className="w-4 h-4" weight="bold" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCHOLAR ADD/EDIT MODAL */}
      {isScholarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-[#0F2759]">
                {editingScholar ? "Edit Scholar Profile" : "Add Scholar to Yearbook"}
              </h2>
              <button
                onClick={() => setIsScholarModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSaveScholar} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={scholarForm.name || ""}
                    onChange={(e) =>
                      setScholarForm({ ...scholarForm, name: e.target.value })
                    }
                    placeholder="e.g. Aung Myat Min"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batch / Cohort *
                  </label>
                  <select
                    required
                    value={scholarForm.batchId || ""}
                    onChange={(e) =>
                      setScholarForm({ ...scholarForm, batchId: e.target.value })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="">Select a batch...</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.region})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <BilingualField
                label="Role / Pearson Programme"
                enValue={scholarForm.role || ""}
                myValue={scholarForm.roleMy || ""}
                onEnChange={(v) => setScholarForm({ ...scholarForm, role: v })}
                onMyChange={(v) => setScholarForm({ ...scholarForm, roleMy: v })}
                requiredEn
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    University Destination / Career
                  </label>
                  <input
                    type="text"
                    value={scholarForm.destination || ""}
                    onChange={(e) =>
                      setScholarForm({ ...scholarForm, destination: e.target.value })
                    }
                    placeholder="e.g. University of Cambridge · Medicine"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Key Pearson Subjects
                  </label>
                  <input
                    type="text"
                    value={scholarForm.subjects || ""}
                    onChange={(e) =>
                      setScholarForm({ ...scholarForm, subjects: e.target.value })
                    }
                    placeholder="e.g. Mathematics, Physics, Chemistry"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <BilingualField
                label="Honors Badge (Optional)"
                enValue={scholarForm.badge || ""}
                myValue={scholarForm.badgeMy || ""}
                onEnChange={(v) => setScholarForm({ ...scholarForm, badge: v })}
                onMyChange={(v) => setScholarForm({ ...scholarForm, badgeMy: v })}
              />

              <BilingualField
                label="Yearbook Quote / Advice"
                enValue={scholarForm.quote || ""}
                myValue={scholarForm.quoteMy || ""}
                onEnChange={(v) => setScholarForm({ ...scholarForm, quote: v })}
                onMyChange={(v) => setScholarForm({ ...scholarForm, quoteMy: v })}
                multiline
                rows={3}
                requiredEn
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Scholar Portrait Photo
                </label>
                <ImageUploadPicker
                  value={scholarForm.image || "/images/g5.jpg"}
                  onChange={(url) => setScholarForm({ ...scholarForm, image: url })}
                />
              </div>

              {!isStudent && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={scholarForm.status || "published"}
                    onChange={(e) =>
                      setScholarForm({
                        ...scholarForm,
                        status: e.target.value as "published" | "pending_review" | "archived",
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="published">Published</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScholarModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold text-[#162033] bg-[#FFD600] hover:bg-[#ECC300] disabled:opacity-50"
                >
                  {isPending ? "Saving..." : isStudent ? "Submit for Review" : "Save Scholar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH ADD/EDIT MODAL */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-[#0F2759]">
                {editingBatch ? "Edit Batch" : "New Graduation Batch"}
              </h2>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="space-y-4">
              {!editingBatch && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batch Slug ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchForm.id || ""}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                    }
                    placeholder="e.g. yangon-2027"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Batch Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={batchForm.name || ""}
                  onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                  placeholder="e.g. Class of 2027 (Yangon)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Region *
                  </label>
                  <select
                    value={batchForm.region || "Yangon"}
                    onChange={(e) =>
                      setBatchForm({
                        ...batchForm,
                        region: e.target.value as "Yangon" | "Mawlamyine",
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="Yangon">Yangon</option>
                    <option value="Mawlamyine">Mawlamyine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={batchForm.sortOrder ?? 0}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, sortOrder: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Active Status
                </label>
                <select
                  value={batchForm.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setBatchForm({ ...batchForm, isActive: e.target.value === "true" })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="true">Active (Visible)</option>
                  <option value="false">Archived / Hidden</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold text-[#162033] bg-[#FFD600] hover:bg-[#ECC300]"
                >
                  {isPending ? "Saving..." : "Save Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Scholar Modal */}
      {deletingScholar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <WarningCircle className="w-6 h-6" weight="bold" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Delete Scholar?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-slate-800">{deletingScholar.name}</span> from the yearbook?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingScholar(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteScholar}
                className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Batch Modal */}
      {deletingBatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <WarningCircle className="w-6 h-6" weight="bold" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Delete Batch?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-800">{deletingBatch.name}</span>? Scholars in this batch will need to be reassigned.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingBatch(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBatch}
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
