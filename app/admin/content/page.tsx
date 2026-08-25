"use client";

import { useState, useEffect } from "react";
import {
  FALLBACK_GUEST_USER,
  UserProfile,
  mapUserProfileRecord,
} from "../adminStore";
import { authClient } from "@/lib/auth/auth-client";
import {
  getEffectiveSiteContent,
  upsertSiteContentAction,
} from "@/lib/actions/siteContent";
import type { SiteContentKey } from "@/lib/content/defaults";

type TabId = Extract<
  SiteContentKey,
  "announcements" | "heroHighlights" | "programs" | "faqs" | "contactInfo"
>;

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "announcements", label: "Announcements", icon: "campaign" },
  { id: "heroHighlights", label: "Hero Stats", icon: "star" },
  { id: "programs", label: "Programs", icon: "menu_book" },
  { id: "faqs", label: "FAQs", icon: "help" },
  { id: "contactInfo", label: "Contact Info", icon: "call" },
];

interface HighlightRow {
  value: string;
  label: string;
  sub: string;
}
interface FaqRow {
  id?: string;
  question: string;
  answer: string;
}
interface ProgramRow {
  id: string;
  badge: string;
  age: string;
  title: string;
  icon: string;
  description: string;
  highlights: string[];
  image: string;
}
interface ContactRow {
  icon: string;
  text: string;
  href: string;
}

const inputCls =
  "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D] bg-white";
const labelCls = "text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1";

export default function AdminSiteContentPage() {
  const [activeTab, setActiveTab] = useState<TabId>("announcements");
  const [isLoading, setIsLoading] = useState(true);

  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<HighlightRow[]>([]);
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savingTab, setSavingTab] = useState<TabId | null>(null);

  const { data: session } = authClient.useSession();
  const currentUser: UserProfile = session?.user
    ? mapUserProfileRecord(session.user)
    : FALLBACK_GUEST_USER;

  useEffect(() => {
    getEffectiveSiteContent()
      .then((content) => {
        setAnnouncements(content.announcements ?? []);
        setHighlights(content.heroHighlights ?? []);
        setFaqs((content.faqs ?? []).map(({ id, question, answer }) => ({ id, question, answer })));
        setPrograms(content.programs ?? []);
        setContacts(content.contactInfo ?? []);
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const save = async (key: TabId, payload: unknown) => {
    setSavingTab(key);
    try {
      const res = await upsertSiteContentAction(key, payload);
      showToast(res.message);
    } catch (err) {
      showToast(`Error: ${(err as Error)?.message || "Failed to save."}`);
    } finally {
      setSavingTab(null);
    }
  };

  const resetSection = async (key: TabId) => {
    setSavingTab(key);
    try {
      const res = await upsertSiteContentAction(key, null);
      showToast(res.message);
      const content = await getEffectiveSiteContent();
      setAnnouncements(content.announcements ?? []);
      setHighlights(content.heroHighlights ?? []);
      setFaqs((content.faqs ?? []).map(({ id, question, answer }) => ({ id, question, answer })));
      setPrograms(content.programs ?? []);
      setContacts(content.contactInfo ?? []);
    } catch (err) {
      showToast(`Error: ${(err as Error)?.message || "Failed to reset."}`);
    } finally {
      setSavingTab(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#09234B] tracking-tight">Site Content</h1>
          <p className="text-xs text-slate-500 mt-1">
            Edit the homepage announcements, hero statistics, program showcase, FAQs and footer
            contact details. Changes publish to the live website immediately.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F0FE] text-[#0E3B7D] text-[11px] font-black uppercase tracking-wider border border-[#0E3B7D]/20 self-start">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">verified_user</span>
          Signed in as {currentUser.email}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#0E3B7D] text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:border-[#0E3B7D]/40 hover:text-[#0E3B7D]"
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-sm text-slate-500 animate-pulse">
          Loading content…
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
          {/* ── Announcements ── */}
          {activeTab === "announcements" && (
            <>
              <FieldLabel text="Scrolling announcement bar messages (one per line)" />
              <textarea
                className={inputCls + " min-h-[140px] font-mono text-xs"}
                value={announcements.join("\n")}
                onChange={(e) => setAnnouncements(e.target.value.split("\n"))}
              />
              <Actions
                onSave={() =>
                  save(
                    "announcements",
                    announcements.filter((a) => a.trim().length > 0)
                  )
                }
                onReset={() => resetSection("announcements")}
                saving={savingTab === "announcements"}
              />
            </>
          )}

          {/* ── Hero Highlights ── */}
          {activeTab === "heroHighlights" && (
            <>
              <FieldLabel text="Quick stats row under the hero headline" />
              <div className="space-y-3">
                {highlights.map((h, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_1.4fr_auto] gap-2 items-end bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <label className={labelCls}>Value</label>
                      <input className={inputCls} value={h.value} onChange={(e) => setHighlights(highlights.map((x, xi) => xi === i ? { ...x, value: e.target.value } : x))} />
                    </div>
                    <div>
                      <label className={labelCls}>Label</label>
                      <input className={inputCls} value={h.label} onChange={(e) => setHighlights(highlights.map((x, xi) => xi === i ? { ...x, label: e.target.value } : x))} />
                    </div>
                    <div>
                      <label className={labelCls}>Sub-label</label>
                      <input className={inputCls} value={h.sub} onChange={(e) => setHighlights(highlights.map((x, xi) => xi === i ? { ...x, sub: e.target.value } : x))} />
                    </div>
                    <button onClick={() => setHighlights(highlights.filter((_, xi) => xi !== i))} className="p-2 rounded-xl text-red-500 hover:bg-red-50 cursor-pointer" aria-label="Remove stat">
                      <span aria-hidden="true" className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
                <button onClick={() => setHighlights([...highlights, { value: "", label: "", sub: "" }])} className="text-xs font-black text-[#0E3B7D] hover:underline cursor-pointer">
                  + Add stat
                </button>
              </div>
              <Actions onSave={() => save("heroHighlights", highlights)} onReset={() => resetSection("heroHighlights")} saving={savingTab === "heroHighlights"} />
            </>
          )}

          {/* ── Programs ── */}
          {activeTab === "programs" && (
            <>
              <FieldLabel text="Academic program showcase cards" />
              <div className="space-y-4">
                {programs.map((p, i) => (
                  <div key={i} className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-slate-50/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <LabeledInput label="Title" value={p.title} onChange={(v) => setPrograms(programs.map((x, xi) => xi === i ? { ...x, title: v } : x))} />
                      <LabeledInput label="Badge (year group)" value={p.badge} onChange={(v) => setPrograms(programs.map((x, xi) => xi === i ? { ...x, badge: v } : x))} />
                      <LabeledInput label="Age range" value={p.age} onChange={(v) => setPrograms(programs.map((x, xi) => xi === i ? { ...x, age: v } : x))} />
                      <LabeledInput label="Material icon name" value={p.icon} onChange={(v) => setPrograms(programs.map((x, xi) => xi === i ? { ...x, icon: v } : x))} />
                      <LabeledInput label="Card ID (stable)" value={p.id} onChange={(v) => setPrograms(programs.map((x, xi) => xi === i ? { ...x, id: v } : x))} />
                      <LabeledInput label="Image path / URL" value={p.image} onChange={(v) => setPrograms(programs.map((x, xi) => xi === i ? { ...x, image: v } : x))} />
                    </div>
                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea className={inputCls} rows={2} value={p.description} onChange={(e) => setPrograms(programs.map((x, xi) => xi === i ? { ...x, description: e.target.value } : x))} />
                    </div>
                    <div>
                      <label className={labelCls}>Highlights (one per line)</label>
                      <textarea className={inputCls + " font-mono text-xs"} rows={3} value={p.highlights.join("\n")} onChange={(e) => setPrograms(programs.map((x, xi) => xi === i ? { ...x, highlights: e.target.value.split("\n") } : x))} />
                    </div>
                    <button onClick={() => setPrograms(programs.filter((_, xi) => xi !== i))} className="text-xs font-black text-red-500 hover:underline cursor-pointer">
                      Remove program
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    setPrograms([
                      ...programs,
                      { id: `program-${Date.now()}`, badge: "", age: "", title: "New Program", icon: "school", description: "", highlights: [], image: "/images/g4.jpg" },
                    ])
                  }
                  className="text-xs font-black text-[#0E3B7D] hover:underline cursor-pointer"
                >
                  + Add program
                </button>
              </div>
              <Actions onSave={() => save("programs", programs)} onReset={() => resetSection("programs")} saving={savingTab === "programs"} />
            </>
          )}

          {/* ── FAQs ── */}
          {activeTab === "faqs" && (
            <>
              <FieldLabel text="Homepage Frequently Asked Questions" />
              <div className="space-y-4">
                {faqs.map((f, i) => (
                  <div key={i} className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-slate-50/60">
                    <LabeledInput label="Question" value={f.question} onChange={(v) => setFaqs(faqs.map((x, xi) => xi === i ? { ...x, question: v } : x))} />
                    <div>
                      <label className={labelCls}>Answer</label>
                      <textarea className={inputCls} rows={3} value={f.answer} onChange={(e) => setFaqs(faqs.map((x, xi) => xi === i ? { ...x, answer: e.target.value } : x))} />
                    </div>
                    <button onClick={() => setFaqs(faqs.filter((_, xi) => xi !== i))} className="text-xs font-black text-red-500 hover:underline cursor-pointer">
                      Remove FAQ
                    </button>
                  </div>
                ))}
                <button onClick={() => setFaqs([...faqs, { question: "", answer: "" }])} className="text-xs font-black text-[#0E3B7D] hover:underline cursor-pointer">
                  + Add FAQ
                </button>
              </div>
              <Actions onSave={() => save("faqs", faqs)} onReset={() => resetSection("faqs")} saving={savingTab === "faqs"} />
            </>
          )}

          {/* ── Contact Info ── */}
          {activeTab === "contactInfo" && (
            <>
              <FieldLabel text="Footer contact details" />
              <div className="space-y-3">
                {contacts.map((c, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-[auto_1.6fr_1.4fr_auto] gap-2 items-end bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <label className={labelCls}>Icon</label>
                      <input className={inputCls + " w-24"} value={c.icon} onChange={(e) => setContacts(contacts.map((x, xi) => xi === i ? { ...x, icon: e.target.value } : x))} />
                    </div>
                    <div>
                      <label className={labelCls}>Text</label>
                      <input className={inputCls} value={c.text} onChange={(e) => setContacts(contacts.map((x, xi) => xi === i ? { ...x, text: e.target.value } : x))} />
                    </div>
                    <div>
                      <label className={labelCls}>Link (href)</label>
                      <input className={inputCls} value={c.href} onChange={(e) => setContacts(contacts.map((x, xi) => xi === i ? { ...x, href: e.target.value } : x))} />
                    </div>
                    <button onClick={() => setContacts(contacts.filter((_, xi) => xi !== i))} className="p-2 rounded-xl text-red-500 hover:bg-red-50 cursor-pointer" aria-label="Remove contact">
                      <span aria-hidden="true" className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
                <button onClick={() => setContacts([...contacts, { icon: "info", text: "", href: "" }])} className="text-xs font-black text-[#0E3B7D] hover:underline cursor-pointer">
                  + Add contact line
                </button>
              </div>
              <Actions onSave={() => save("contactInfo", contacts)} onReset={() => resetSection("contactInfo")} saving={savingTab === "contactInfo"} />
            </>
          )}
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div role="status" className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-[#09234B] text-white text-xs font-bold shadow-2xl animate-fade-in max-w-xs">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

function FieldLabel({ text }: { text: string }) {
  return <p className="text-sm font-black text-[#09234B]">{text}</p>;
}

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Actions({ onSave, onReset, saving }: { onSave: () => void; onReset: () => void; saving: boolean }) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <button
        onClick={onReset}
        disabled={saving}
        className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider hover:bg-slate-200 disabled:opacity-50 cursor-pointer"
      >
        Reset to defaults
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-50 cursor-pointer"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-base">publish</span>
        {saving ? "Publishing…" : "Publish changes"}
      </button>
    </div>
  );
}
