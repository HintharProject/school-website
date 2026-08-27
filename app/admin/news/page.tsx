"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  getAllNews,
  createNewsAction,
  updateNewsAction,
  deleteNewsAction,
} from "@/lib/actions/news";
import { isR2AssetUrl } from "@/lib/utils/r2Image";
import ImageUploadPicker from "@/app/components/admin/ImageUploadPicker";

interface PostRow {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  category: string;
  image: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

interface FormState {
  title: string;
  excerpt: string;
  body: string;
  category: string;
  image: string;
  status: "published" | "draft" | "archived";
}

const EMPTY_FORM: FormState = {
  title: "",
  excerpt: "",
  body: "",
  category: "Announcement",
  image: "",
  status: "published",
};

const CATEGORIES = ["Announcement", "Academic", "Event", "Achievement", "Examination"];

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = (await getAllNews()) as PostRow[];
      setPosts(rows);
    } catch {
      setMessage({ kind: "err", text: "Failed to load news posts." });
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

  const openEdit = (post: PostRow) => {
    setForm({
      title: post.title,
      excerpt: post.excerpt || "",
      body: post.body,
      category: post.category,
      image: post.image || "",
      status: (post.status as FormState["status"]) || "published",
    });
    setEditingId(post.id);
    setShowForm(true);
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        title: form.title,
        excerpt: form.excerpt || null,
        body: form.body,
        category: form.category,
        image: form.image || null,
        status: form.status,
      };
      const result = editingId
        ? await updateNewsAction(editingId, payload)
        : await createNewsAction(payload);
      if (result.success) {
        setMessage({ kind: "ok", text: editingId ? "Post updated." : "Post published." });
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
    if (!window.confirm("Delete this news post permanently?")) return;
    const result = await deleteNewsAction(id);
    if (result.success) {
      setMessage({ kind: "ok", text: "Post deleted." });
      await load();
    } else {
      setMessage({ kind: "err", text: result.error || "Delete failed." });
    }
  };

  const statusBadge = (status: string) =>
    status === "published"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "draft"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-500 border-slate-200";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-[#09234B] tracking-tight">News & Announcements</h1>
          <p className="text-xs text-slate-500">Publish updates to the public news feed at /news.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">add_circle</span>
          New Post
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

      {/* Editor Modal */}
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
              {editingId ? "Edit News Post" : "New News Post"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  placeholder="Post title"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Excerpt (optional — auto-generated from body if blank)
              </label>
              <input
                type="text"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                placeholder="One-line summary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Body</label>
              <textarea
                required
                rows={8}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                placeholder="Write the announcement. Separate paragraphs with a blank line."
              />
            </div>

            <ImageUploadPicker
              label="Cover Image (optional)"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              folder="news"
            />

            <div className="flex items-center gap-3">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as FormState["status"] })}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E3B7D]"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
              >
                {saving ? "Saving..." : editingId ? "Save Changes" : "Publish"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      {loading ? (
        <div className="p-10 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-slate-300 rounded-2xl text-xs text-slate-400">
          No news posts yet. Click &ldquo;New Post&rdquo; to publish the first announcement.
        </div>
      ) : (
        <div className="space-y-2.5">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                {post.image ? (
                  <Image src={post.image} alt="" fill unoptimized={isR2AssetUrl(post.image)} className="object-cover" sizes="64px" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0E3B7D] to-[#164E9A]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[#09234B] truncate">{post.title}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {post.category} · {post.slug}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusBadge(post.status)}`}>
                {post.status}
              </span>
              <button
                type="button"
                onClick={() => openEdit(post)}
                className="p-2 rounded-lg text-slate-400 hover:text-[#0E3B7D] hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Edit post"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(post.id)}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                aria-label="Delete post"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
