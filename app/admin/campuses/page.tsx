"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  CampusRecord,
  mapCampusRecord,
  FALLBACK_GUEST_USER,
  UserProfile,
  mapUserProfileRecord,
} from "../adminStore";
import { authClient } from "@/lib/auth/auth-client";
import { isR2AssetUrl } from "@/lib/utils/r2Image";
import {
  getCampuses,
  createCampusAction,
  updateCampusAction,
  deleteCampusAction,
} from "@/lib/actions/campuses";
import ImageUploadPicker from "@/app/components/admin/ImageUploadPicker";

export default function AdminCampusesPage() {
  const [campuses, setCampuses] = useState<CampusRecord[]>([]);
  const { data: session } = authClient.useSession();
  const currentUser: UserProfile = session?.user
    ? mapUserProfileRecord(session.user)
    : FALLBACK_GUEST_USER;
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCity, setSelectedCity] = useState<"All" | "Yangon" | "Mawlamyine">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [editingCampus, setEditingCampus] = useState<CampusRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingCampus, setDeletingCampus] = useState<CampusRecord | null>(null);

  // Form State — bilingual EN/MY (MY optional, fallback to EN on public site)
  const [formState, setFormState] = useState<Partial<CampusRecord>>({
    id: "",
    name: "",
    nameMy: "",
    city: "Yangon",
    tagline: "",
    taglineMy: "",
    address: "",
    addressMy: "",
    phone: "",
    email: "",
    gradesServed: "Year 7–9 · Pearson IGCSE · Pearson IAL",
    imageUrl: "/images/g2.jpg",
    mapUrl: "",
    isActive: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    let cancelled = false;
    getCampuses()
      .then((data) => {
        if (!cancelled) setCampuses(data.map(mapCampusRecord));
      })
      .catch((err) => console.warn("Failed to load campuses:", err))
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter & Search
  const filteredCampuses = campuses.filter((c) => {
    const matchesCity = selectedCity === "All" || c.city === selectedCity;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gradesServed.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  // Save changes (Edit)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampus) return;
    const res = await updateCampusAction(editingCampus.id, editingCampus);
    if (!res?.success) {
      showToast(`Error: ${res?.message || "Failed to update campus."}`);
      return;
    }
    setCampuses((prev) =>
      prev.map((c) => (c.id === editingCampus.id ? editingCampus : c))
    );
    showToast(res.message);
    setEditingCampus(null);
  };

  // Add Campus
  const handleCreateCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.address) return;
    const newId = formState.id || `campus-${Date.now()}`;
    const newRecord: CampusRecord = {
      id: newId,
      name: formState.name || "New Campus",
      nameMy: formState.nameMy || undefined,
      city: (formState.city as "Yangon" | "Mawlamyine") || "Yangon",
      tagline: formState.tagline || "Center of Academic Excellence",
      taglineMy: formState.taglineMy || undefined,
      address: formState.address || "",
      addressMy: formState.addressMy || undefined,
      phone: formState.phone || "+95 9 894 332200",
      email: formState.email || "admissions@hinthar.education",
      gradesServed: formState.gradesServed || "Year 7–9 · Pearson IGCSE · Pearson IAL",
      imageUrl: formState.imageUrl || "/images/g2.jpg",
      mapUrl: formState.mapUrl || undefined,
      isActive: formState.isActive ?? true,
    };
    const res = await createCampusAction(newRecord);
    if (!res?.success) {
      showToast(`Error: ${res?.message || "Failed to add campus."}`);
      return;
    }
    setCampuses((prev) => [newRecord, ...prev]);
    setIsAddModalOpen(false);
    showToast(res.message);
  };

  // Delete Campus
  const handleDeleteCampus = async () => {
    if (!deletingCampus) return;
    const res = await deleteCampusAction(deletingCampus.id);
    if (!res?.success) {
      showToast(`Error: ${res?.message || "Failed to delete campus."}`);
      return;
    }
    setCampuses((prev) => prev.filter((c) => c.id !== deletingCampus.id));
    setDeletingCampus(null);
    showToast(res.message);
  };

  if (currentUser?.role === "student") {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <span aria-hidden="true" className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <h2 className="text-xl font-black text-slate-800">Campus Master Records</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Master configuration of School Campuses and examination center accreditations is restricted to the School Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 bg-[#0E3B7D] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FFC700] animate-fade-in">
          <span aria-hidden="true" className="material-symbols-outlined text-[#FFC700]">check_circle</span>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0E3B7D]">Campuses Management</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0E3B7D] font-extrabold text-xs">
              {campuses.length} Campuses Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage details, contact info, facilities, and statuses for our 3 Yangon campuses & 1 Mawlamyine campus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">add_location_alt</span>
            <span>Add New Campus</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">City:</span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            {(["All", "Yangon", "Mawlamyine"] as const).map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCity === city
                    ? "bg-[#0E3B7D] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <span aria-hidden="true" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campus name, address, track..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
        </div>
      </div>

      {/* Campuses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCampuses.map((campus) => (
          <div
            key={campus.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Card Image Banner */}
              <div className="relative h-48 w-full bg-slate-900">
                <Image
                  src={campus.imageUrl || "/images/g2.jpg"}
                  alt={campus.name}
                  fill
                  unoptimized={isR2AssetUrl(campus.imageUrl)}
                  className="object-cover opacity-90"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#09234B]/80 text-[#FFC700] backdrop-blur-sm border border-[#FFC700]/30">
                    {campus.city} Campus
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider backdrop-blur-sm ${
                      campus.isActive
                        ? "bg-emerald-600/80 text-white"
                        : "bg-red-600/80 text-white"
                    }`}
                  >
                    {campus.isActive ? "Active Branch" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-black text-[#09234B]">{campus.name}</h3>
                  <p className="text-xs font-semibold text-[#0E3B7D] mt-0.5">{campus.tagline}</p>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-base text-slate-400 shrink-0 mt-0.5">
                      location_on
                    </span>
                    <span>{campus.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-base text-slate-400 shrink-0">
                      call
                    </span>
                    <span>{campus.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-base text-slate-400 shrink-0">
                      mail
                    </span>
                    <span>{campus.email}</span>
                  </div>
                </div>

                {/* Grades */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <span className="font-bold text-[#09234B] block mb-0.5">Curriculum &amp; Grades:</span>
                  <span className="text-slate-600">{campus.gradesServed}</span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 px-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono font-bold">ID: {campus.id}</span>
                {campus.mapUrl && (
                  <a
                    href={campus.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0E3B7D] hover:underline bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-xs">map</span>
                    <span>Map</span>
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button aria-label="Edit"
                  onClick={() => setEditingCampus(campus)}
                  className="px-3 py-1.5 rounded-lg bg-[#E8F0FE] hover:bg-[#0E3B7D] text-[#0E3B7D] hover:text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">edit</span>
                  <span>Edit</span>
                </button>
                <button aria-label="Delete"
                  onClick={() => setDeletingCampus(campus)}
                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">delete</span>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT CAMPUS MODAL */}
      {editingCampus && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h2 className="text-xl font-black text-[#09234B]">Edit Campus: {editingCampus.name}</h2>
              <button
                onClick={() => setEditingCampus(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span aria-hidden="true" className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus Name (EN)</label>
                  <input
                    type="text"
                    required
                    value={editingCampus.name}
                    onChange={(e) => setEditingCampus({ ...editingCampus, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City Region</label>
                  <select
                    value={editingCampus.city}
                    onChange={(e) => setEditingCampus({ ...editingCampus, city: e.target.value as "Yangon" | "Mawlamyine" })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Yangon">Yangon</option>
                    <option value="Mawlamyine">Mawlamyine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Campus Name (Burmese) — optional, fallback to EN</label>
                <input
                  type="text"
                  placeholder="ဥပမာ — ရွာမကျောင်း"
                  value={editingCampus.nameMy || ""}
                  onChange={(e) => setEditingCampus({ ...editingCampus, nameMy: e.target.value })}
                  className="w-full p-2.5 bg-amber-50/50 border border-amber-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tagline / Subtitle (EN)</label>
                <input
                  type="text"
                  required
                  value={editingCampus.tagline}
                  onChange={(e) => setEditingCampus({ ...editingCampus, tagline: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tagline (Burmese) — optional</label>
                <input
                  type="text"
                  placeholder="မြန်မာ ဘာသာဖြင့်"
                  value={editingCampus.taglineMy || ""}
                  onChange={(e) => setEditingCampus({ ...editingCampus, taglineMy: e.target.value })}
                  className="w-full p-2.5 bg-amber-50/50 border border-amber-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Physical Address (EN)</label>
                <textarea
                  rows={2}
                  required
                  value={editingCampus.address}
                  onChange={(e) => setEditingCampus({ ...editingCampus, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Address (Burmese) — optional</label>
                <textarea
                  rows={2}
                  placeholder="မြန်မာ လိပ်စာ"
                  value={editingCampus.addressMy || ""}
                  onChange={(e) => setEditingCampus({ ...editingCampus, addressMy: e.target.value })}
                  className="w-full p-2.5 bg-amber-50/50 border border-amber-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={editingCampus.phone}
                    onChange={(e) => setEditingCampus({ ...editingCampus, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={editingCampus.email}
                    onChange={(e) => setEditingCampus({ ...editingCampus, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Grades Served</label>
                <input
                  type="text"
                  required
                  value={editingCampus.gradesServed}
                  onChange={(e) => setEditingCampus({ ...editingCampus, gradesServed: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Google Maps Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/... or https://maps.google.com/..."
                  value={editingCampus.mapUrl || ""}
                  onChange={(e) => setEditingCampus({ ...editingCampus, mapUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  When set, a &quot;View on Map&quot; button will be displayed on the public campuses page.
                </p>
              </div>

              {/* Image Picker */}
              <div>
                <ImageUploadPicker
                  label="Campus Showcase Photo"
                  value={editingCampus.imageUrl}
                  onChange={(url) => setEditingCampus({ ...editingCampus, imageUrl: url })}
                  folder="campuses"
                  defaultPresetsCategory="campus"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editingCampus.isActive}
                  onChange={(e) => setEditingCampus({ ...editingCampus, isActive: e.target.checked })}
                  className="rounded text-[#0E3B7D]"
                />
                <label htmlFor="editIsActive" className="font-bold text-slate-700">
                  Campus is Active &amp; Accepting Students
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCampus(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0E3B7D] text-white font-bold hover:bg-[#164E9A]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CAMPUS MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h2 className="text-xl font-black text-[#09234B]">Add New School Campus</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span aria-hidden="true" className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCampus} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. North Yangon Campus"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City Region</label>
                  <select
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value as "Yangon" | "Mawlamyine" })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Yangon">Yangon</option>
                    <option value="Mawlamyine">Mawlamyine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tagline / Facility Focus</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Secondary & Pearson Examination Hall"
                  value={formState.tagline}
                  onChange={(e) => setFormState({ ...formState, tagline: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Physical Address</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Street, Township, City"
                  value={formState.address}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+95 9..."
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    placeholder="campus@hinthar.education"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Grades Served</label>
                <input
                  type="text"
                  required
                  placeholder="Year 7–9 · Pearson IGCSE · Pearson IAL"
                  value={formState.gradesServed}
                  onChange={(e) => setFormState({ ...formState, gradesServed: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Google Maps Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/... or https://maps.google.com/..."
                  value={formState.mapUrl || ""}
                  onChange={(e) => setFormState({ ...formState, mapUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  When set, a &quot;View on Map&quot; button will be displayed on the public campuses page.
                </p>
              </div>

              {/* Image Picker */}
              <div>
                <ImageUploadPicker
                  label="Campus Showcase Photo"
                  value={formState.imageUrl || "/images/g2.jpg"}
                  onChange={(url) => setFormState({ ...formState, imageUrl: url })}
                  folder="campuses"
                  defaultPresetsCategory="campus"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0E3B7D] text-white font-bold hover:bg-[#164E9A]"
                >
                  Create Campus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCampus && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <span aria-hidden="true" className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h3 className="text-lg font-black text-[#09234B]">Delete Campus?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong>{deletingCampus.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCampus(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCampus}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
