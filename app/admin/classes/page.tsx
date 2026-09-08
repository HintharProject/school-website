"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { FALLBACK_GUEST_USER, mapUserProfileRecord, type UserProfile } from "../adminStore";
import {
  getProgramsForAdmin,
  getSubjectsForAdmin,
  createProgramAction,
  updateProgramAction,
  deleteProgramAction,
  createSubjectAction,
  updateSubjectAction,
  deleteSubjectAction,
} from "@/lib/actions/academicCatalog";
import {
  PROGRAM_CATEGORIES,
  PROGRAM_CAMPUSES,
  SUBJECT_TRACKS,
  type CatalogProgram,
  type CatalogSubject,
} from "@/lib/academic/catalog";
import { getAdmissionOptions, type AdmissionOptions } from "@/lib/actions/siteContent";
import { DEFAULT_ADMISSION_OPTIONS } from "@/lib/content/defaults";

type Tab = "programs" | "subjects";

const emptyProgramForm = {
  nameEn: "",
  nameMy: "",
  summaryEn: "",
  summaryMy: "",
  descriptionEn: "",
  descriptionMy: "",
  curriculum: "Pearson Edexcel",
  category: "pearson" as CatalogProgram["category"],
  duration: "",
  campus: "both" as CatalogProgram["campus"],
  studyMode: "",
  programLevel: "" as "" | "lower_secondary" | "igcse" | "ial",
  sortOrder: 0,
  isActive: true,
  subjectIds: [] as string[],
};

const emptySubjectForm = {
  nameEn: "",
  nameMy: "",
  code: "",
  track: "STEM" as CatalogSubject["track"],
  isActive: true,
};

export default function AdminClassesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("programs");
  const [programs, setPrograms] = useState<CatalogProgram[]>([]);
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [admissionOptions, setAdmissionOptions] = useState<AdmissionOptions>(DEFAULT_ADMISSION_OPTIONS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(FALLBACK_GUEST_USER);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [programModal, setProgramModal] = useState<"add" | "edit" | null>(null);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [programForm, setProgramForm] = useState(emptyProgramForm);
  const [deletingProgram, setDeletingProgram] = useState<CatalogProgram | null>(null);

  const [subjectModal, setSubjectModal] = useState<"add" | "edit" | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState(emptySubjectForm);
  const [deletingSubject, setDeletingSubject] = useState<CatalogSubject | null>(null);

  const { data: session } = authClient.useSession();
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    if (session?.user) setCurrentUser(mapUserProfileRecord(session.user));
  }, [session]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const [programsData, subjectsData, options] = await Promise.all([
        getProgramsForAdmin(),
        getSubjectsForAdmin(),
        getAdmissionOptions().catch(() => DEFAULT_ADMISSION_OPTIONS),
      ]);
      setPrograms(programsData);
      setSubjects(subjectsData);
      setAdmissionOptions(options);
    } catch (err) {
      console.warn("Failed to load academic catalog:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredPrograms = programs.filter(
    (p) =>
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameMy ?? "").includes(searchQuery) ||
      p.category.includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = subjects.filter(
    (s) =>
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nameMy ?? "").includes(searchQuery) ||
      (s.code ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddProgram = () => {
    setProgramForm(emptyProgramForm);
    setEditingProgramId(null);
    setProgramModal("add");
  };

  const openEditProgram = (p: CatalogProgram) => {
    setEditingProgramId(p.id);
    setProgramForm({
      nameEn: p.nameEn,
      nameMy: p.nameMy ?? "",
      summaryEn: p.summaryEn ?? "",
      summaryMy: p.summaryMy ?? "",
      descriptionEn: p.descriptionEn ?? "",
      descriptionMy: p.descriptionMy ?? "",
      curriculum: p.curriculum,
      category: p.category as CatalogProgram["category"],
      duration: p.duration ?? "",
      campus: p.campus as CatalogProgram["campus"],
      studyMode: p.studyMode ?? "",
      programLevel: (p.programLevel as typeof emptyProgramForm.programLevel) ?? "",
      sortOrder: p.sortOrder,
      isActive: p.isActive,
      subjectIds: p.subjects.map((s) => s.id),
    });
    setProgramModal("edit");
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.nameEn.trim()) return;
    const id = editingProgramId ?? `program-${Date.now()}`;
    const payload = {
      id,
      ...programForm,
      programLevel: programForm.programLevel || null,
      studyMode: programForm.studyMode || null,
      duration: programForm.duration || null,
      nameMy: programForm.nameMy || null,
      summaryEn: programForm.summaryEn || null,
      summaryMy: programForm.summaryMy || null,
      descriptionEn: programForm.descriptionEn || null,
      descriptionMy: programForm.descriptionMy || null,
    };
    try {
      if (programModal === "add") {
        await createProgramAction(payload);
        showToast(`Program "${programForm.nameEn}" created.`);
      } else {
        await updateProgramAction(id, payload);
        showToast(`Program "${programForm.nameEn}" updated.`);
      }
      setProgramModal(null);
      await loadData();
    } catch (err: unknown) {
      showToast(`Error: ${err instanceof Error ? err.message : "Save failed."}`);
    }
  };

  const handleDeleteProgram = async () => {
    if (!deletingProgram) return;
    try {
      await deleteProgramAction(deletingProgram.id);
      showToast(`Program "${deletingProgram.nameEn}" removed.`);
      setDeletingProgram(null);
      await loadData();
    } catch (err: unknown) {
      showToast(`Error: ${err instanceof Error ? err.message : "Delete failed."}`);
    }
  };

  const openAddSubject = () => {
    setSubjectForm(emptySubjectForm);
    setEditingSubjectId(null);
    setSubjectModal("add");
  };

  const openEditSubject = (s: CatalogSubject) => {
    setEditingSubjectId(s.id);
    setSubjectForm({
      nameEn: s.nameEn,
      nameMy: s.nameMy ?? "",
      code: s.code ?? "",
      track: s.track as CatalogSubject["track"],
      isActive: s.isActive,
    });
    setSubjectModal("edit");
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.nameEn.trim()) return;
    const id = editingSubjectId ?? `subject-${Date.now()}`;
    const payload = {
      id,
      ...subjectForm,
      nameMy: subjectForm.nameMy || null,
      code: subjectForm.code || null,
    };
    try {
      if (subjectModal === "add") {
        await createSubjectAction(payload);
        showToast(`Subject "${subjectForm.nameEn}" created.`);
      } else {
        await updateSubjectAction(id, payload);
        showToast(`Subject "${subjectForm.nameEn}" updated.`);
      }
      setSubjectModal(null);
      await loadData();
    } catch (err: unknown) {
      showToast(`Error: ${err instanceof Error ? err.message : "Save failed."}`);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deletingSubject) return;
    try {
      await deleteSubjectAction(deletingSubject.id);
      showToast(`Subject "${deletingSubject.nameEn}" removed.`);
      setDeletingSubject(null);
      await loadData();
    } catch (err: unknown) {
      showToast(`Error: ${err instanceof Error ? err.message : "Delete failed."}`);
    }
  };

  const toggleSubjectLink = (subjectId: string) => {
    setProgramForm((prev) => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter((id) => id !== subjectId)
        : [...prev.subjectIds, subjectId],
    }));
  };

  if (!isLoaded) {
    return <div className="text-sm text-slate-500 p-6">Loading academic catalog…</div>;
  }

  return (
    <div className="space-y-6">
      {toastMessage ? (
        <div role="status" className="fixed bottom-6 right-6 z-50 bg-[#09234B] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#FFC700]/30 flex items-center gap-3 text-sm font-medium">
          <span aria-hidden="true" className="material-symbols-outlined text-[#FFC700]">verified</span>
          <span>{toastMessage}</span>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0E3B7D]">Academic Catalog</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage programs for <code className="text-[11px]">/classes</code> and admission. Link subjects to each program manually.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("programs")}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === "programs" ? "bg-[#0E3B7D] text-white shadow-xs" : "text-slate-600"
            }`}
          >
            Programs ({programs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("subjects")}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === "subjects" ? "bg-[#0E3B7D] text-white shadow-xs" : "text-slate-600"
            }`}
          >
            Subjects ({subjects.length})
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <span aria-hidden="true" className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "programs" ? "Search programs…" : "Search subjects…"}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
        </div>
        <button
          type="button"
          onClick={activeTab === "programs" ? openAddProgram : openAddSubject}
          className="w-full sm:w-auto px-4 py-2 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">add_circle</span>
          <span>{activeTab === "programs" ? "Add Program" : "Add Subject"}</span>
        </button>
      </div>

      {activeTab === "programs" ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Program</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Campus</th>
                  <th className="p-4">Subjects</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No programs yet. Add your first program to populate /classes and admission.
                    </td>
                  </tr>
                ) : (
                  filteredPrograms.map((p) => (
                    <tr key={p.id} className={`hover:bg-slate-50/60 ${!p.isActive ? "opacity-50" : ""}`}>
                      <td className="p-4 pl-6">
                        <p className="font-bold text-slate-900">{p.nameEn}</p>
                        {p.nameMy ? <p className="text-[11px] text-slate-500 mt-0.5">{p.nameMy}</p> : null}
                        {p.duration ? <p className="text-[10px] text-slate-400 mt-1">{p.duration}</p> : null}
                      </td>
                      <td className="p-4 capitalize">{p.category}</td>
                      <td className="p-4 capitalize">{p.campus}</td>
                      <td className="p-4">{p.subjects.length} linked</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                          {p.isActive ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="inline-flex gap-1">
                          <button type="button" onClick={() => openEditProgram(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-[#0E3B7D] cursor-pointer" aria-label="Edit">
                            <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
                          </button>
                          {isAdmin ? (
                            <button type="button" onClick={() => setDeletingProgram(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 cursor-pointer" aria-label="Delete">
                              <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Subject</th>
                  <th className="p-4">Code</th>
                  <th className="p-4">Track</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No subjects yet. Add electives, then link them to programs.
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map((s) => (
                    <tr key={s.id} className={`hover:bg-slate-50/60 ${!s.isActive ? "opacity-50" : ""}`}>
                      <td className="p-4 pl-6">
                        <p className="font-bold text-slate-900">{s.nameEn}</p>
                        {s.nameMy ? <p className="text-[11px] text-slate-500">{s.nameMy}</p> : null}
                      </td>
                      <td className="p-4 font-mono">{s.code || "—"}</td>
                      <td className="p-4">{s.track}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                          {s.isActive ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {isAdmin ? (
                          <div className="inline-flex gap-1">
                            <button type="button" onClick={() => openEditSubject(s)} className="p-1.5 rounded-lg hover:bg-blue-50 cursor-pointer" aria-label="Edit">
                              <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button type="button" onClick={() => setDeletingSubject(s)} className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer" aria-label="Delete">
                              <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">Admin only</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {programModal ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-[#09234B]">
              {programModal === "add" ? "Add Program" : "Edit Program"}
            </h2>
            <form onSubmit={handleSaveProgram} className="space-y-3 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Name (English) *</label>
                  <input required value={programForm.nameEn} onChange={(e) => setProgramForm({ ...programForm, nameEn: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Name (Myanmar)</label>
                  <input value={programForm.nameMy} onChange={(e) => setProgramForm({ ...programForm, nameMy: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Summary (English)</label>
                  <textarea rows={2} value={programForm.summaryEn} onChange={(e) => setProgramForm({ ...programForm, summaryEn: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Summary (Myanmar)</label>
                  <textarea rows={2} value={programForm.summaryMy} onChange={(e) => setProgramForm({ ...programForm, summaryMy: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Description (English)</label>
                <textarea rows={4} value={programForm.descriptionEn} onChange={(e) => setProgramForm({ ...programForm, descriptionEn: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Description (Myanmar)</label>
                <textarea rows={4} value={programForm.descriptionMy} onChange={(e) => setProgramForm({ ...programForm, descriptionMy: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select value={programForm.category} onChange={(e) => setProgramForm({ ...programForm, category: e.target.value as CatalogProgram["category"] })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    {PROGRAM_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus</label>
                  <select value={programForm.campus} onChange={(e) => setProgramForm({ ...programForm, campus: e.target.value as CatalogProgram["campus"] })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    {PROGRAM_CAMPUSES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration</label>
                  <input value={programForm.duration} onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })} placeholder="e.g. 18 months" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Curriculum</label>
                  <input value={programForm.curriculum} onChange={(e) => setProgramForm({ ...programForm, curriculum: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Study mode</label>
                  <select value={programForm.studyMode} onChange={(e) => setProgramForm({ ...programForm, studyMode: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="">— Select —</option>
                    {admissionOptions.studyModes.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Legacy grade mapping (optional)</label>
                  <select value={programForm.programLevel} onChange={(e) => setProgramForm({ ...programForm, programLevel: e.target.value as typeof programForm.programLevel })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="">None</option>
                    <option value="lower_secondary">Lower Secondary</option>
                    <option value="igcse">IGCSE</option>
                    <option value="ial">IAL</option>
                  </select>
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={programForm.isActive} onChange={(e) => setProgramForm({ ...programForm, isActive: e.target.checked })} />
                    Active (visible on /classes &amp; admission)
                  </label>
                </div>
              </div>
              <div>
                <p className="font-bold text-slate-700 mb-2">Link subjects (manual)</p>
                {subjects.length === 0 ? (
                  <p className="text-slate-400">Add subjects first, then link them here.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                    {subjects.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={programForm.subjectIds.includes(s.id)} onChange={() => toggleSubjectLink(s.id)} />
                        <span>{s.nameEn}{s.code ? ` (${s.code})` : ""}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setProgramModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#0E3B7D] text-white font-bold">Save Program</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {subjectModal && isAdmin ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-[#09234B]">{subjectModal === "add" ? "Add Subject" : "Edit Subject"}</h2>
            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Name (English) *</label>
                <input required value={subjectForm.nameEn} onChange={(e) => setSubjectForm({ ...subjectForm, nameEn: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="font-bold block mb-1">Name (Myanmar)</label>
                <input value={subjectForm.nameMy} onChange={(e) => setSubjectForm({ ...subjectForm, nameMy: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Pearson code</label>
                  <input value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Track</label>
                  <select value={subjectForm.track} onChange={(e) => setSubjectForm({ ...subjectForm, track: e.target.value as CatalogSubject["track"] })} className="w-full p-2.5 bg-slate-50 border rounded-xl">
                    {SUBJECT_TRACKS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input type="checkbox" checked={subjectForm.isActive} onChange={(e) => setSubjectForm({ ...subjectForm, isActive: e.target.checked })} />
                Active
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSubjectModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#0E3B7D] text-white font-bold">Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deletingProgram ? (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-black text-[#09234B]">Delete program?</h3>
            <p className="text-xs text-slate-600">Remove <strong>{deletingProgram.nameEn}</strong> from /classes and admission?</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeletingProgram(null)} className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold">Cancel</button>
              <button type="button" onClick={handleDeleteProgram} className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold">Delete</button>
            </div>
          </div>
        </div>
      ) : null}

      {deletingSubject ? (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-black text-[#09234B]">Delete subject?</h3>
            <p className="text-xs text-slate-600">Remove <strong>{deletingSubject.nameEn}</strong>? Program links will be removed.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeletingSubject(null)} className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold">Cancel</button>
              <button type="button" onClick={handleDeleteSubject} className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold">Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
