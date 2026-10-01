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
  roleMy: string | null;
  department: string;
  departmentMy: string | null;
  qualifications: string | null;
  qualificationsMy: string | null;
  bio: string | null;
  bioMy: string | null;
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
  roleMy: string;
  department: string;
  departmentMy: string;
  qualifications: string;
  qualificationsMy: string;
  bio: string;
  bioMy: string;
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
  roleMy: "",
  department: "General",
  departmentMy: "",
  qualifications: "",
  qualificationsMy: "",
  bio: "",
  bioMy: "",
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

export default function StaffTab() {
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
      roleMy: row.roleMy || "",
      department: row.department,
      departmentMy: row.departmentMy || "",
      qualifications: row.qualifications || "",
      qualificationsMy: row.qualificationsMy || "",
      bio: row.bio || "",
      bioMy: row.bioMy || "",
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
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-black text-[#09234B] tracking-tight">Faculty &amp; Staff Directory</h2>
          <p className="text-xs text-slate-500">Profiles displayed publicly on the school website.</p>
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
                <label className={labelCls}>Role / Title (Myanmar, optional)</label>
                <input type="text" value={form.roleMy} onChange={(e) => setForm({ ...form, roleMy: e.target.value })} className={inputCls} />
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
              <label className={labelCls}>Department (Myanmar, optional)</label>
              <input type="text" value={form.departmentMy} onChange={(e) => setForm({ ...form, departmentMy: e.target.value })} className={inputCls} />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Qualifications / Degrees</label>
              <input type="text" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} className={inputCls} placeholder="e.g. PhD in Education (UK), MSc Physics" />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Qualifications (Myanmar, optional)</label>
              <input type="text" value={form.qualificationsMy} onChange={(e) => setForm({ ...form, qualificationsMy: e.target.value })} className={inputCls} />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Short Bio</label>
              <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={inputCls} placeholder="Brief introduction and teaching philosophy..." />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Bio (Myanmar, optional)</label>
              <textarea rows={3} value={form.bioMy} onChange={(e) => setForm({ ...form, bioMy: e.target.value })} className={inputCls} />
            </div>

            <ImageUploadPicker
              label="Portrait Photo"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              folder="staff"
              defaultPresetsCategory="scholar"
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className={labelCls}>Display Order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FormState["status"] })} className={inputCls}>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#0E3B7D] hover:bg-[#164E9A] text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Profile"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading staff directory...</div>
      ) : rows.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <span aria-hidden="true" className="material-symbols-outlined text-4xl text-slate-300">badge</span>
          <p className="text-xs text-slate-500 font-bold mt-2">No staff profiles yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Campus</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {row.image ? (
                          <img src={row.image} alt={row.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-xs">
                            {row.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span>{row.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{row.role}</td>
                    <td className="py-3 px-4 text-slate-600">{row.department}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {CAMPUSES.find((c) => c.id === row.campusId)?.label || row.campusId}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          row.status === "published"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0E3B7D] hover:text-white text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
