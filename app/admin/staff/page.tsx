"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAllStaff,
  createStaffAction,
  updateStaffAction,
  deleteStaffAction,
} from "@/lib/actions/staff";
import ImageUploadPicker from "@/app/components/admin/ImageUploadPicker";

interface StaffRow {
  id: number;
  name: string;
  role: string;
  department: string;
  qualifications: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  campusId: string;
  sortOrder: number;
  status: string;
}

interface FormState {
  name: string;
  role: string;
  department: string;
  qualifications: string;
  bio: string;
  email: string;
  phone: string;
  image: string;
  campusId: string;
  sortOrder: number;
  status: "published" | "archived";
}

const EMPTY_FORM: FormState = {
  name: "",
  role: "",
  department: "General",
  qualifications: "",
  bio: "",
  email: "",
  phone: "",
  image: "",
  campusId: "both-campuses",
  sortOrder: 0,
  status: "published",
};

const DEPARTMENTS = ["Leadership", "STEM", "Languages", "Arts", "Sports", "Administration", "General"];
const CAMPUSES = [
  { id: "both-campuses", label: "All Campuses" },
  { id: "ywarma-campus", label: "Ywarma" },
  { id: "shwe-padauk-campus", label: "Shwe Padauk" },
  { id: "shwe-pone-nyet-campus", label: "Shwe Pone Nyet" },
  { id: "mawlamyine-campus", label: "Mawlamyine" },
];

export default function AdminStaffPage() {
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows((await getAllStaff()) as StaffRow[]);
    } catch {
      setMessage({ kind: "err", text: "Failed to load staff profiles." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setMessage(null);
  };

  const openEdit = (row: StaffRow) => {
    setForm({
      name: row.name,
      role: row.role,
      department: row.department,
      qualifications: row.qualifications || "",
      bio: row.bio || "",
      email: row.email || "",
      phone: row.phone || "",
      image: row.image || "",
      campusId: row.campusId,
      sortOrder: row.sortOrder,
      status: (row.status as FormState["status"]) || "published",
    });
    setEditingId(row.id);
    setShowForm(true);
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const result = editingId
        ? await updateStaffAction(editingId, form)
        : await createStaffAction(form);
      if (result.success) {
        setMessage({ kind: "ok", text: editingId ? "Profile updated." : "Profile added." });
        setShowForm(false);
        await load();
      } else {
        setMessage({ kind: "err", text: result.error || "Save failed." });
      }
    } catch {
      setMessage({ kind: "err", text: "Save failed. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Remove this staff profile from the public directory?")) return;
    const result = await deleteStaffAction(id);
    if (result.success) {
      setMessage({ kind: "ok", text: "Profile removed." });
      await load();
    } else {
      setMessage({ kind: "err", text: result.error || "Delete failed." });
    }
  };

  const inputCls =
    "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E3B7D]";
  const labelCls = "text-[11px] font-bold text-slate-700 uppercase tracking-wider";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-[#09234B] tracking-tight">Teachers & Staff Directory</h1>
          <p className="text-xs text-slate-500">Profiles shown publicly at /staff.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">person_add</span>
          Add Staff Profile
        </button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold border ${
            message.kind === "ok"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#09234B]/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-4"
          >
            <h2 className="text-lg font-black text-[#09234B]">
              {editingId ? "Edit Staff Profile" : "New Staff Profile"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelCls}>Full Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Dr. Kaung Myat Htut" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Role / Title</label>
                <input type="text" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls} placeholder="e.g. Principal, Physics Teacher" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Department</label>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputCls}>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Campus</label>
                <select value={form.campusId} onChange={(e) => setForm({ ...form, campusId: e.target.value })} className={inputCls}>
                  {CAMPUSES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Email (optional)</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Phone (optional)</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Qualifications</label>
              <input type="text" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} className={inputCls} placeholder="e.g. PhD Physics, University of Yangon" />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Short Bio (optional)</label>
              <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={inputCls} />
            </div>

            <ImageUploadPicker
              label="Portrait Photo (optional)"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              folder="avatars"
              aspectRatio="portrait"
            />

            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <label className={labelCls}>Sort Order</label>
                <input type="number" min={0} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })} className={`${inputCls} w-24`} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FormState["status"] })} className={inputCls}>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all disabled:opacity-60 cursor-pointer">
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-slate-300 rounded-2xl text-xs text-slate-400">
          No staff profiles yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-full bg-[#0E3B7D] text-white flex items-center justify-center text-xs font-black shrink-0 overflow-hidden">
                {row.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  row.name.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[#09234B] truncate">{row.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                  {row.role} · {row.department}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${row.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                {row.status}
              </span>
              <button type="button" onClick={() => openEdit(row)} className="p-2 rounded-lg text-slate-400 hover:text-[#0E3B7D] hover:bg-slate-100 transition-colors cursor-pointer" aria-label="Edit profile">
                <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
              </button>
              <button type="button" onClick={() => handleDelete(row.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer" aria-label="Delete profile">
                <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
