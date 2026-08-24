"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNoticesForUser,
  createNoticeAction,
  deleteNoticeAction,
  toggleNoticeCompleteAction,
  type NoticeFeedItem,
} from "@/lib/actions/notices";
import { authClient } from "@/lib/auth/auth-client";
import { mapUserProfileRecord, type UserProfile } from "../adminStore";

export default function NoticesPage() {
  const [items, setItems] = useState<NoticeFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | "tasks" | "done">("all");

  const [form, setForm] = useState({
    title: "",
    body: "",
    priority: "normal" as "normal" | "urgent",
    targetType: "all" as "all" | "admins" | "contributors",
    isTask: false,
    dueDate: "",
  });

  const { data: session } = authClient.useSession();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (session?.user) setCurrentUser(mapUserProfileRecord(session.user));
  }, [session]);

  const isAdmin = currentUser?.role === "admin";

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getNoticesForUser();
      if (res.success && res.notices) {
        setItems(res.notices);
      } else {
        showToast(res.error || "Failed to load notices.");
      }
    } catch {
      showToast("Failed to load notices.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await createNoticeAction(form);
      if (res.success) {
        showToast("Notice published to the board.");
        setIsComposerOpen(false);
        setForm({ title: "", body: "", priority: "normal", targetType: "all", isTask: false, dueDate: "" });
        await load();
      } else {
        showToast(res.error || "Failed to publish notice.");
      }
    } catch {
      showToast("Failed to publish notice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (n: NoticeFeedItem) => {
    const res = await deleteNoticeAction(n.id);
    if (res.success) {
      setItems((prev) => prev.filter((x) => x.id !== n.id));
      showToast("Notice removed.");
    } else {
      showToast(res.error || "Failed to remove notice.");
    }
  };

  const handleToggleComplete = async (n: NoticeFeedItem) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((x) =>
        x.id === n.id
          ? { ...x, completedByMe: !x.completedByMe, completionCount: x.completionCount + (x.completedByMe ? -1 : 1) }
          : x
      )
    );
    const res = await toggleNoticeCompleteAction(n.id, !n.completedByMe);
    if (!res.success) {
      showToast(res.error || "Could not update status.");
      load();
    }
  };

  const visible =
    filter === "tasks"
      ? items.filter((n) => n.isTask)
      : filter === "done"
        ? items.filter((n) => n.completedByMe)
        : items;

  return (
    <div className="space-y-6">
      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 bg-[#0E3B7D] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FFC700] animate-fade-in">
          <span aria-hidden="true" className="material-symbols-outlined text-[#FFC700]">check_circle</span>
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0E3B7D] dark:text-sky-300">Noticeboard</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-sky-950 text-[#0E3B7D] dark:text-sky-300 font-extrabold text-xs">
              Messages &amp; Tasks
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official communications and assigned tasks from the Principal&apos;s office and school administration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(
              [
                { id: "all", label: "All" },
                { id: "tasks", label: "My Tasks" },
                { id: "done", label: "Completed" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === f.id
                    ? "bg-[#0E3B7D] text-white"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsComposerOpen((v) => !v)}
              className="px-4 py-2 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">
                {isComposerOpen ? "close" : "add_circle"}
              </span>
              <span>{isComposerOpen ? "Close" : "New Notice"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Composer (admins only) */}
      {isAdmin && isComposerOpen && (
        <form
          onSubmit={handleCreate}
          role="form"
          aria-label="Create new notice"
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4"
        >
          <h2 className="text-base font-black text-[#09234B] dark:text-slate-100">Publish a New Notice</h2>
          <div>
            <label htmlFor="notice-title" className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block mb-1">
              Title *
            </label>
            <input
              id="notice-title"
              type="text"
              required
              minLength={3}
              maxLength={300}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Staff Meeting — Friday 3 PM"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
            />
          </div>

          <div>
            <label htmlFor="notice-body" className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block mb-1">
              Message *
            </label>
            <textarea
              id="notice-body"
              required
              minLength={3}
              maxLength={5000}
              rows={4}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Write the announcement or task details..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="notice-priority" className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block mb-1">
                Priority
              </label>
              <select
                id="notice-priority"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as "normal" | "urgent" })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label htmlFor="notice-target" className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block mb-1">
                Audience
              </label>
              <select
                id="notice-target"
                value={form.targetType}
                onChange={(e) => setForm({ ...form, targetType: e.target.value as typeof form.targetType })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                <option value="all">Everyone</option>
                <option value="admins">Administrators only</option>
                <option value="contributors">Student contributors only</option>
              </select>
            </div>
            <div>
              <label htmlFor="notice-due" className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block mb-1">
                Due Date (optional)
              </label>
              <input
                id="notice-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label htmlFor="notice-task" className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                id="notice-task"
                type="checkbox"
                checked={form.isTask}
                onChange={(e) => setForm({ ...form, isTask: e.target.checked })}
                className="rounded text-[#0E3B7D] w-4 h-4 cursor-pointer"
              />
              This is an actionable task (recipients can mark it done)
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-bold text-xs disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>
      )}

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading notices">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full mb-2" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl max-w-md mx-auto">
          <span aria-hidden="true" className="material-symbols-outlined text-4xl text-slate-300">campaign</span>
          <h2 className="text-base font-black text-[#09234B] dark:text-slate-100 mt-3">Nothing Here Yet</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {filter === "done"
              ? "You have not completed any tasks yet."
              : filter === "tasks"
                ? "No open tasks assigned to you right now."
                : "No notices have been published yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((n) => {
            const overdue =
              n.isTask && n.dueDate && !n.completedByMe &&
              new Date(n.dueDate).setHours(23, 59, 59) < Date.now();

            return (
              <article
                key={n.id}
                className={`rounded-2xl border p-5 shadow-xs transition-colors ${
                  n.priority === "urgent"
                    ? "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {n.priority === "urgent" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                          Urgent
                        </span>
                      )}
                      {n.isTask && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          overdue
                            ? "bg-red-600 text-white"
                            : n.completedByMe
                              ? "bg-emerald-600 text-white"
                              : "bg-amber-400 text-[#09234B]"
                        }`}>
                          {overdue ? "Overdue" : n.completedByMe ? "Done" : "Task"}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {n.targetType === "admins" ? "Administrators" : n.targetType === "contributors" ? "Contributors" : "Everyone"}
                      </span>
                      {n.dueDate && (
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                          <span aria-hidden="true" className="material-symbols-outlined text-xs">event</span>
                          Due {n.dueDate}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-black text-[#09234B] dark:text-slate-100">{n.title}</h3>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(n)}
                      aria-label={`Delete notice: ${n.title}`}
                      title="Delete notice"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 shrink-0 cursor-pointer"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 whitespace-pre-line">
                  {n.body}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {n.authorName ? `Posted by ${n.authorName}` : "Administration"} · {new Date(n.createdAt).toLocaleDateString()}
                    {isAdmin && n.completionCount > 0 ? ` · ${n.completionCount} completed` : ""}
                  </p>

                  {n.isTask && (
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(n)}
                      aria-pressed={n.completedByMe}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        n.completedByMe
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          : "bg-[#0E3B7D] hover:bg-[#164E9A] text-white"
                      }`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-sm">
                        {n.completedByMe ? "check_box" : "check_box_outline_blank"}
                      </span>
                      {n.completedByMe ? "Completed" : "Mark as Done"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
