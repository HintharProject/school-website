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
  getCampusesForAdmin,
  upsertCampusAction,
  deleteCampusAction,
} from "@/lib/actions/campuses";
import ImageUploadPicker from "@/app/components/admin/ImageUploadPicker";
import GalleryUploadPicker from "@/app/components/admin/GalleryUploadPicker";
import BilingualField from "@/app/components/admin/BilingualField";
import {
  CheckCircle,
  Plus,
  MagnifyingGlass,
  MapPin,
  Phone,
  EnvelopeSimple,
  PencilSimple,
  Trash,
  X,
  WarningCircle,
  Lock,
  ArrowSquareOut,
} from "@phosphor-icons/react";

export default function AdminCampusesPage() {
  const [campuses, setCampuses] = useState<CampusRecord[]>([]);
  const { data: session } = authClient.useSession();
  const currentUser: UserProfile = session?.user
    ? mapUserProfileRecord(session.user)
    : FALLBACK_GUEST_USER;
  const [selectedCity, setSelectedCity] = useState<"All" | "Yangon" | "Mawlamyine">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [editingCampus, setEditingCampus] = useState<CampusRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingCampus, setDeletingCampus] = useState<CampusRecord | null>(null);

  // Form State
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
    galleryUrls: [],
    mapUrl: "",
    isActive: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCampuses = async () => {
    try {
      const data = await getCampusesForAdmin();
      setCampuses(data.map(mapCampusRecord));
    } catch (err) {
      console.warn("Failed to load campuses:", err);
    }
  };

  useEffect(() => {
    loadCampuses();
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
    const res = await upsertCampusAction(editingCampus);
    if (!res.success) {
      showToast(`Error: ${res.message || "Failed to update campus."}`);
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
      galleryUrls: formState.galleryUrls || [],
      mapUrl: formState.mapUrl || undefined,
      isActive: formState.isActive ?? true,
    };
    const res = await upsertCampusAction(newRecord);
    if (!res.success) {
      showToast(`Error: ${res.message || "Failed to add campus."}`);
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
    if (!res.success) {
      showToast(`Error: ${res.message || "Failed to delete campus."}`);
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
          <Lock className="w-8 h-8" weight="bold" />
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
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 bg-[#0F2759] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FFD600] animate-fade-in">
          <CheckCircle className="w-5 h-5 text-[#FFD600]" weight="fill" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0F2759]">Campuses Management</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#193E8A] font-extrabold text-xs">
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFD600] hover:bg-[#ECC300] text-[#162033] font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" weight="bold" />
            <span>Add New Campus</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(["All", "Yangon", "Mawlamyine"] as const).map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCity === city
                  ? "bg-[#193E8A] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {city}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <MagnifyingGlass className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" weight="bold" />
          <input
            type="text"
            placeholder="Search campuses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#193E8A]"
          />
        </div>
      </div>

      {/* Campuses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCampuses.map((campus) => (
          <div
            key={campus.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 w-full bg-slate-100">
                <Image
                  src={campus.imageUrl || "/images/g2.jpg"}
                  alt={campus.name}
                  fill
                  unoptimized={isR2AssetUrl(campus.imageUrl)}
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                    {campus.city}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold backdrop-blur-md ${campus.isActive
                        ? "bg-emerald-500/90 text-white"
                        : "bg-rose-500/90 text-white"
                      }`}
                  >
                    {campus.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{campus.name}</h3>
                  {campus.nameMy && (
                    <p className="text-xs text-slate-500 font-medium">{campus.nameMy}</p>
                  )}
                  <p className="text-xs text-[#193E8A] font-bold mt-1">{campus.tagline}</p>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" weight="bold" />
                    <span>{campus.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" weight="bold" />
                    <span>{campus.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EnvelopeSimple className="w-4 h-4 text-slate-400 shrink-0" weight="bold" />
                    <span>{campus.email}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                    Grades / Pathways Served
                  </span>
                  <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                    {campus.gradesServed}
                  </span>
                </div>

                {campus.galleryUrls && campus.galleryUrls.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400">
                      Gallery: {campus.galleryUrls.length} photos
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-4">
              {campus.mapUrl ? (
                <a
                  href={campus.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ArrowSquareOut className="w-3.5 h-3.5" weight="bold" />
                  <span>View Map</span>
                </a>
              ) : (
                <span className="text-xs text-slate-400">No map link</span>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingCampus(campus)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Edit Campus"
                >
                  <PencilSimple className="w-4 h-4" weight="bold" />
                </button>
                <button
                  onClick={() => setDeletingCampus(campus)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                  title="Delete Campus"
                >
                  <Trash className="w-4 h-4" weight="bold" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingCampus && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-[#0F2759]">Edit Campus</h2>
              <button
                onClick={() => setEditingCampus(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <BilingualField
                label="Campus Name"
                enValue={editingCampus.name}
                myValue={editingCampus.nameMy || ""}
                onEnChange={(v) => setEditingCampus({ ...editingCampus, name: v })}
                onMyChange={(v) => setEditingCampus({ ...editingCampus, nameMy: v })}
                requiredEn
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City Region</label>
                  <select
                    value={editingCampus.city}
                    onChange={(e) =>
                      setEditingCampus({
                        ...editingCampus,
                        city: e.target.value as "Yangon" | "Mawlamyine",
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="Yangon">Yangon</option>
                    <option value="Mawlamyine">Mawlamyine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingCampus.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setEditingCampus({
                        ...editingCampus,
                        isActive: e.target.value === "true",
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>

              <BilingualField
                label="Tagline / Description"
                enValue={editingCampus.tagline}
                myValue={editingCampus.taglineMy || ""}
                onEnChange={(v) => setEditingCampus({ ...editingCampus, tagline: v })}
                onMyChange={(v) => setEditingCampus({ ...editingCampus, taglineMy: v })}
                requiredEn
              />

              <BilingualField
                label="Campus Address"
                enValue={editingCampus.address}
                myValue={editingCampus.addressMy || ""}
                onEnChange={(v) => setEditingCampus({ ...editingCampus, address: v })}
                onMyChange={(v) => setEditingCampus({ ...editingCampus, addressMy: v })}
                multiline
                rows={2}
                requiredEn
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingCampus.phone}
                    onChange={(e) => setEditingCampus({ ...editingCampus, phone: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editingCampus.email}
                    onChange={(e) => setEditingCampus({ ...editingCampus, email: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Grades Served</label>
                <input
                  type="text"
                  value={editingCampus.gradesServed}
                  onChange={(e) => setEditingCampus({ ...editingCampus, gradesServed: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Google Maps Embed or Link</label>
                <input
                  type="text"
                  value={editingCampus.mapUrl || ""}
                  onChange={(e) => setEditingCampus({ ...editingCampus, mapUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Featured Campus Photo</label>
                <ImageUploadPicker
                  value={editingCampus.imageUrl}
                  onChange={(url) => setEditingCampus({ ...editingCampus, imageUrl: url })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campus Photo Gallery</label>
                <GalleryUploadPicker
                  folder="campuses"
                  value={editingCampus.galleryUrls || []}
                  onChange={(urls) => setEditingCampus({ ...editingCampus, galleryUrls: urls })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCampus(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold text-[#162033] bg-[#FFD600] hover:bg-[#ECC300]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-[#0F2759]">Add New Campus</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" weight="bold" />
              </button>
            </div>

            <form onSubmit={handleCreateCampus} className="space-y-4">
              <BilingualField
                label="Campus Name"
                enValue={formState.name || ""}
                myValue={formState.nameMy || ""}
                onEnChange={(v) => setFormState({ ...formState, name: v })}
                onMyChange={(v) => setFormState({ ...formState, nameMy: v })}
                requiredEn
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City Region</label>
                  <select
                    value={formState.city}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        city: e.target.value as "Yangon" | "Mawlamyine",
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="Yangon">Yangon</option>
                    <option value="Mawlamyine">Mawlamyine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formState.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        isActive: e.target.value === "true",
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>

              <BilingualField
                label="Tagline / Description"
                enValue={formState.tagline || ""}
                myValue={formState.taglineMy || ""}
                onEnChange={(v) => setFormState({ ...formState, tagline: v })}
                onMyChange={(v) => setFormState({ ...formState, taglineMy: v })}
                requiredEn
              />

              <BilingualField
                label="Campus Address"
                enValue={formState.address || ""}
                myValue={formState.addressMy || ""}
                onEnChange={(v) => setFormState({ ...formState, address: v })}
                onMyChange={(v) => setFormState({ ...formState, addressMy: v })}
                multiline
                rows={2}
                requiredEn
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formState.phone || ""}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    placeholder="+95 9 894 332200"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formState.email || ""}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="admissions@hinthar.education"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Grades Served</label>
                <input
                  type="text"
                  value={formState.gradesServed || ""}
                  onChange={(e) => setFormState({ ...formState, gradesServed: e.target.value })}
                  placeholder="Year 7–9 · Pearson IGCSE · Pearson IAL"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Featured Campus Photo</label>
                <ImageUploadPicker
                  value={formState.imageUrl || "/images/g2.jpg"}
                  onChange={(url) => setFormState({ ...formState, imageUrl: url })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold text-[#162033] bg-[#FFD600] hover:bg-[#ECC300]"
                >
                  Create Campus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCampus && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <WarningCircle className="w-6 h-6" weight="bold" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Delete Campus?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-800">{deletingCampus.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingCampus(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCampus}
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
