"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAllTestimonials,
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
} from "@/lib/actions/testimonials";
import ImageUploadPicker from "@/app/components/admin/ImageUploadPicker";

interface TestimonialRow {
  id: number;
  authorName: string;
  authorRole: string | null;
  quote: string;
  image: string | null;
  rating: number | null;
  sortOrder: number;
  status: string;
}

interface FormState {
  authorName: string;
  authorRole: string;
  quote: string;
  image: string;
  rating: number;
  sortOrder: number;
  status: "published" | "archived";
}

const EMPTY_FORM: FormState = {
  authorName: "",
  authorRole: "",
  quote: "",
  image: "",
  rating: 5,
  sortOrder: 0,
  status: "published",
};

export default function AdminTestimonialsPage() {
  const [rows, setRows] = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows((await getAllTestimonials()) as TestimonialRow[]);
    } catch {
      setMessage({ kind: "err", text: "Failed to load testimonials." });
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

  const openEdit = (row: TestimonialRow) => {
    setForm({
      authorName: row.authorName,
      authorRole: row.authorRole || "",
      quote: row.quote,
      image: row.image || "",
      rating: row.rating ?? 5,
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
      const payload = { ...form, rating: form.rating >= 1 && form.rating <= 5 ? form.rating : null };
      const result = editingId
        ? await updateTestimonialAction(editingId, payload)
        : await createTestimonialAction(payload);
      if (result.success) {
        setMessage({ kind: "ok", text: editingId ? "Testimonial updated." : "Testimonial added." });
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
    if (!window.confirm("Delete this testimonial?")) return;
    const result = await deleteTestimonialAction(id);
    if (result.success) {
      setMessage({ kind: "ok", text: "Testimonial deleted." });
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
          <h1 className="text-xl font-black text-[#09234B] tracking-tight">Parent & Alumni Testimonials</h1>
          <p className="text-xs text-slate-500">Shown in the homepage &ldquo;Voices of the Hinthar Family&rdquo; section.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">add_circle</span>
          Add Testimonial
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
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-4"
          >
            <h2 className="text-lg font-black text-[#09234B]">
              {editingId ? "Edit Testimonial" : "New Testimonial"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelCls}>Author Name</label>
                <input type="text" required value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} className={inputCls} placeholder="e.g. Daw Aye Aye" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Role (optional)</label>
                <input type="text" value={form.authorRole} onChange={(e) => setForm({ ...form, authorRole: e.target.value })} className={inputCls} placeholder="e.g. Parent · Class of 2026" />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Quote</label>
              <textarea rows={4} required value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className={inputCls} placeholder="What they said about Hinthar…" />
            </div>

            <ImageUploadPicker
              label="Author Photo (optional)"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              folder="general"
              aspectRatio="square"
            />

            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <label className={labelCls}>Stars (1–5, optional)</label>
                <input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) || 0 })} className={`${inputCls} w-24`} />
              </div>
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
                {saving ? "Saving..." : "Save Testimonial"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-slate-300 rounded-2xl text-xs text-slate-400">
          No testimonials yet. Add parent and alumni quotes to showcase on the homepage.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rows.map((row) => (
            <div key={row.id} className="p-4 bg-white rounded-2xl border border-slate-200 hover:shadow-md transition-shadow space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-black text-[#09234B]">{row.authorName}</p>
                  {row.authorRole && (
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{row.authorRole}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${row.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {row.status}
                  </span>
                  <button type="button" onClick={() => openEdit(row)} className="p-2 rounded-lg text-slate-400 hover:text-[#0E3B7D] hover:bg-slate-100 transition-colors cursor-pointer" aria-label="Edit">
                    <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button type="button" onClick={() => handleDelete(row.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer" aria-label="Delete">
                    <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-light line-clamp-3">&ldquo;{row.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
