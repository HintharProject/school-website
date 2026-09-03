"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  FALLBACK_GUEST_USER,
  type YearbookScholar,
  mapUserProfileRecord,
  mapYearbookRecord,
} from "../adminStore";
import { authClient } from "@/lib/auth/auth-client";
import { isR2AssetUrl } from "@/lib/utils/r2Image";
import ImageUploadPicker from "@/app/components/admin/ImageUploadPicker";
import {
  createYearbookAction,
  createYearbookBatchAction,
  deleteYearbookAction,
  getYearbook,
  getYearbookBatches,
  setYearbookStatusAction,
  updateYearbookAction,
  updateYearbookBatchAction,
} from "@/lib/actions/yearbook";

type Region = "Yangon" | "Mawlamyine";
type Batch = {
  id: string;
  name: string;
  region: Region;
  sortOrder: number;
  isActive: boolean;
};

const emptyEntry = {
  name: "",
  region: "Yangon" as Region,
  batchId: "",
  role: "",
  destination: "",
  subjects: "",
  quote: "",
  image: "/images/g5.jpg",
  badge: "",
};

function EntryFields({
  value,
  batches,
  onChange,
}: {
  value: typeof emptyEntry;
  batches: Batch[];
  onChange: (value: typeof emptyEntry) => void;
}) {
  const available = batches.filter((batch) => batch.region === value.region && batch.isActive);
  return (
    <div className="space-y-3 text-xs">
      <label className="block font-bold text-slate-700">
        Scholar Full Name
        <input required value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="font-bold text-slate-700">
          Region
          <select
            value={value.region}
            onChange={(event) => onChange({ ...value, region: event.target.value as Region, batchId: "" })}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5"
          >
            <option value="Yangon">Yangon</option>
            <option value="Mawlamyine">Mawlamyine</option>
          </select>
        </label>
        <label className="font-bold text-slate-700">
          Batch
          <select required value={value.batchId} onChange={(event) => onChange({ ...value, batchId: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <option value="">Select batch</option>
            {available.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
          </select>
        </label>
      </div>
      <label className="block font-bold text-slate-700">
        Academic Role &amp; Honors
        <input required value={value.role} onChange={(event) => onChange({ ...value, role: event.target.value })} placeholder="e.g. Valedictorian and Student Council President" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5" />
      </label>
      <label className="block font-bold text-slate-700">
        University Destination &amp; Major
        <input value={value.destination} onChange={(event) => onChange({ ...value, destination: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5" />
      </label>
      <label className="block font-bold text-slate-700">
        Subjects, Grades &amp; Distinctions
        <input value={value.subjects} onChange={(event) => onChange({ ...value, subjects: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5" />
      </label>
      <label className="block font-bold text-slate-700">
        Honors Badge
        <input value={value.badge} onChange={(event) => onChange({ ...value, badge: event.target.value })} placeholder="Type an optional badge" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5" />
      </label>
      <label className="block font-bold text-slate-700">
        Alumni Quote
        <textarea required rows={3} value={value.quote} onChange={(event) => onChange({ ...value, quote: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5" />
      </label>
      <ImageUploadPicker label="Portrait Photo" value={value.image} onChange={(image) => onChange({ ...value, image })} folder="yearbook" defaultPresetsCategory="scholar" />
    </div>
  );
}

export default function YearbookManagementPage() {
  const { data: session, isPending } = authClient.useSession();
  const currentUser = session?.user ? mapUserProfileRecord(session.user) : FALLBACK_GUEST_USER;
  const isAdmin = currentUser.role === "admin";
  const [entries, setEntries] = useState<YearbookScholar[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [activeTab, setActiveTab] = useState<"published" | "pending_review" | "my_submissions">("published");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [showBatchManager, setShowBatchManager] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState(emptyEntry);
  const [editing, setEditing] = useState<(typeof emptyEntry & { id: number }) | null>(null);
  const [newBatch, setNewBatch] = useState({ name: "", region: "Yangon" as Region, sortOrder: new Date().getFullYear() });

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    const [entryRows, batchRows] = await Promise.all([
      getYearbook(),
      getYearbookBatches({ includeInactive: isAdmin }),
    ]);
    setEntries(entryRows.map(mapYearbookRecord));
    setBatches(batchRows as Batch[]);
  }, [isAdmin]);

  useEffect(() => {
    if (isPending || !session?.user) return;
    const timer = window.setTimeout(() => {
      void loadData().catch((error) => console.warn("Failed to load Yearbook management:", error));
      if (!isAdmin) setActiveTab("my_submissions");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isAdmin, isPending, loadData, session?.user]);

  const visibleEntries = useMemo(() => entries.filter((entry) => {
    const matchesSearch = [entry.name, entry.role, entry.destination, entry.subjects, entry.batchName]
      .some((value) => value?.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;
    if (!isAdmin || activeTab === "my_submissions") return entry.submittedBy === currentUser.id;
    return activeTab === "pending_review"
      ? entry.status === "pending_review"
      : entry.status === "published";
  }), [activeTab, currentUser.id, entries, isAdmin, search]);

  const groups = useMemo(() => (["Yangon", "Mawlamyine"] as Region[]).map((region) => ({
    region,
    batches: batches
      .filter((batch) => batch.region === region)
      .map((batch) => ({
        ...batch,
        entries: visibleEntries.filter((entry) => entry.batchId === batch.id),
      }))
      .filter((batch) => batch.entries.length > 0),
  })).filter((group) => group.batches.length > 0), [batches, visibleEntries]);

  const submitNewEntry = async (event: React.FormEvent) => {
    event.preventDefault();
    await createYearbookAction(newEntry);
    setNewEntry(emptyEntry);
    setShowAdd(false);
    notify(isAdmin ? "Yearbook entry published." : "Yearbook entry submitted for review.");
    await loadData();
  };

  const submitEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    await updateYearbookAction(editing.id, editing);
    setEditing(null);
    notify("Yearbook entry updated.");
    await loadData();
  };

  const createBatch = async (event: React.FormEvent) => {
    event.preventDefault();
    await createYearbookBatchAction(newBatch);
    setNewBatch({ name: "", region: newBatch.region, sortOrder: newBatch.sortOrder });
    notify("Yearbook batch created.");
    await loadData();
  };

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-[#FFC700] bg-[#0E3B7D] px-5 py-3 text-sm font-bold text-white shadow-xl">{toast}</div>}

      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-[#0E3B7D]">Yearbook Management</h1>
          <p className="mt-1 text-xs text-slate-500">Profiles are organized by region and administrator-managed batch.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && <button onClick={() => setShowBatchManager(true)} className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-[#0E3B7D]">Manage Batches</button>}
          <button onClick={() => setShowAdd(true)} className="rounded-xl bg-[#FFC700] px-4 py-2 text-xs font-black text-[#09234B]">{isAdmin ? "Add Entry" : "Submit My Profile"}</button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search profiles or batches" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs sm:max-w-sm" />
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {(isAdmin ? ["published", "pending_review"] as const : ["my_submissions"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-lg px-3 py-2 text-xs font-bold ${activeTab === tab ? "bg-[#0E3B7D] text-white" : "text-slate-600"}`}>
              {tab === "pending_review" ? "Review Queue" : tab === "my_submissions" ? "My Submissions" : "Published"}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">No matching Yearbook entries.</div>
      ) : groups.map((group) => (
        <section key={group.region} className="space-y-5">
          <h2 className="border-b border-slate-200 pb-2 text-xl font-black text-[#09234B]">{group.region}</h2>
          {group.batches.map((batch) => (
            <div key={batch.id} className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#0E3B7D]">{batch.name}</h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {batch.entries.map((entry) => (
                  <article key={entry.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="relative h-48 bg-slate-900">
                      <Image src={entry.image} alt={entry.name} fill unoptimized={isR2AssetUrl(entry.image)} className="object-cover opacity-90" />
                      <div className="absolute left-3 top-3 flex gap-2">
                        <span className="rounded-full bg-[#09234B]/85 px-3 py-1 text-[10px] font-black text-[#FFC700]">{batch.name}</span>
                        {entry.status === "pending_review" && <span className="rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black text-white">Pending</span>}
                      </div>
                    </div>
                    <div className="space-y-2 p-5">
                      <h4 className="text-lg font-black text-[#09234B]">{entry.name}</h4>
                      <p className="text-xs font-semibold text-[#0E3B7D]">{entry.role}</p>
                      {entry.destination && <p className="text-xs text-slate-600">{entry.destination}</p>}
                      <p className="line-clamp-3 text-xs italic text-slate-500">&ldquo;{entry.quote}&rdquo;</p>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 p-3">
                      {isAdmin && entry.status === "pending_review" && (
                        <>
                          <button onClick={async () => { await setYearbookStatusAction(entry.id, "published"); await loadData(); }} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white">Approve</button>
                          <button onClick={async () => { await setYearbookStatusAction(entry.id, "archived"); await loadData(); }} className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-bold">Archive</button>
                        </>
                      )}
                      {(isAdmin || entry.submittedBy === currentUser.id) && (
                        <button onClick={() => setEditing({ id: entry.id, name: entry.name, region: entry.batchRegion, batchId: entry.batchId, role: entry.role, destination: entry.destination || "", subjects: entry.subjects || "", quote: entry.quote, image: entry.image, badge: entry.badge || "" })} className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-bold">Edit</button>
                      )}
                      {isAdmin && <button onClick={async () => { if (window.confirm(`Delete ${entry.name}?`)) { await deleteYearbookAction(entry.id); await loadData(); } }} className="rounded-lg px-3 py-1 text-xs font-bold text-red-600">Delete</button>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-black text-[#09234B]">Add Yearbook Profile</h2>
            <form onSubmit={submitNewEntry}>
              <EntryFields value={newEntry} batches={batches} onChange={setNewEntry} />
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold">Cancel</button>
                <button type="submit" disabled={!newEntry.batchId} className="rounded-xl bg-[#0E3B7D] px-5 py-2 text-xs font-bold text-white disabled:opacity-50">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-black text-[#09234B]">Edit Yearbook Profile</h2>
            <form onSubmit={submitEdit}>
              <EntryFields value={editing} batches={batches} onChange={(value) => setEditing({ ...value, id: editing.id })} />
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setEditing(null)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold">Cancel</button>
                <button type="submit" className="rounded-xl bg-[#0E3B7D] px-5 py-2 text-xs font-bold text-white">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBatchManager && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-[#09234B]">Manage Regional Batches</h2>
              <button onClick={() => setShowBatchManager(false)} aria-label="Close"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={createBatch} className="mb-6 grid gap-2 rounded-2xl bg-slate-50 p-4 sm:grid-cols-[1fr_140px_100px_auto]">
              <input required value={newBatch.name} onChange={(event) => setNewBatch({ ...newBatch, name: event.target.value })} placeholder="Batch name" className="rounded-xl border border-slate-200 p-2.5 text-xs" />
              <select value={newBatch.region} onChange={(event) => setNewBatch({ ...newBatch, region: event.target.value as Region })} className="rounded-xl border border-slate-200 p-2.5 text-xs"><option>Yangon</option><option>Mawlamyine</option></select>
              <input type="number" min="0" value={newBatch.sortOrder} onChange={(event) => setNewBatch({ ...newBatch, sortOrder: Number(event.target.value) })} className="rounded-xl border border-slate-200 p-2.5 text-xs" />
              <button className="rounded-xl bg-[#FFC700] px-4 py-2 text-xs font-black text-[#09234B]">Add</button>
            </form>
            <div className="space-y-2">
              {batches.map((batch) => (
                <div key={batch.id} className="grid items-center gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[100px_1fr_90px_auto]">
                  <span className="text-xs font-bold text-slate-500">{batch.region}</span>
                  <input value={batch.name} onChange={(event) => setBatches((items) => items.map((item) => item.id === batch.id ? { ...item, name: event.target.value } : item))} className="rounded-lg border border-slate-200 p-2 text-xs" />
                  <input type="number" min="0" value={batch.sortOrder} onChange={(event) => setBatches((items) => items.map((item) => item.id === batch.id ? { ...item, sortOrder: Number(event.target.value) } : item))} className="rounded-lg border border-slate-200 p-2 text-xs" />
                  <div className="flex gap-1">
                    <button onClick={async () => { await updateYearbookBatchAction(batch.id, { name: batch.name, sortOrder: batch.sortOrder }); notify("Batch updated."); await loadData(); }} className="rounded-lg bg-[#0E3B7D] px-3 py-2 text-[10px] font-bold text-white">Save</button>
                    <button onClick={async () => { await updateYearbookBatchAction(batch.id, { isActive: !batch.isActive }); await loadData(); }} className={`rounded-lg px-3 py-2 text-[10px] font-bold ${batch.isActive ? "bg-slate-200 text-slate-700" : "bg-emerald-100 text-emerald-700"}`}>{batch.isActive ? "Archive" : "Activate"}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
