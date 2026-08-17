"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CampusRecord } from "@/lib/supabase/types";
import { DEFAULT_CAMPUSES } from "@/lib/data/campuses";
import {
  getStoredCampuses,
  saveStoredCampuses,
  getActiveAdminRole,
  UserProfile,
  INITIAL_USER_ACCOUNTS,
} from "../adminStore";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import ImageUploadPicker from "@/app/components/admin/ImageUploadPicker";

export default function AdminCampusesPage() {
  const [campuses, setCampuses] = useState<CampusRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER_ACCOUNTS[0]);
  const [isLoaded, setIsLoaded] = useState(false);
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
    city: "Yangon",
    tagline: "",
    address: "",
    phone: "",
    email: "",
    office_hours: "Mon–Sat: 08:30 AM – 05:00 PM",
    grades_served: "Year 7–9 · Pearson IGCSE · Pearson IAL",
    facilities: ["Pearson Exam Center", "Science Labs", "Computer Lab"],
    image_url: "/images/heroImg.png",
    is_active: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setCurrentUser(getActiveAdminRole());
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("campuses")
          .select("*")
          .order("city", { ascending: false });

        if (!error && data && data.length > 0) {
          setCampuses(data as CampusRecord[]);
          saveStoredCampuses(data as CampusRecord[]);
          setIsLoaded(true);
          return;
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to local store", err);
      }
    }
    setCampuses(getStoredCampuses());
    setIsLoaded(true);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      setCampuses(getStoredCampuses());
    };
    window.addEventListener("his_campuses_updated", handleUpdate);
    return () => window.removeEventListener("his_campuses_updated", handleUpdate);
  }, []);

  // Filter & Search
  const filteredCampuses = campuses.filter((c) => {
    const matchesCity = selectedCity === "All" || c.city === selectedCity;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.grades_served.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  // Save changes (Edit)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampus) return;

    const updated = campuses.map((c) => (c.id === editingCampus.id ? editingCampus : c));
    setCampuses(updated);
    saveStoredCampuses(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from("campuses")
          .update({
            name: editingCampus.name,
            city: editingCampus.city,
            tagline: editingCampus.tagline,
            address: editingCampus.address,
            phone: editingCampus.phone,
            email: editingCampus.email,
            office_hours: editingCampus.office_hours,
            grades_served: editingCampus.grades_served,
            facilities: editingCampus.facilities,
            image_url: editingCampus.image_url,
            is_active: editingCampus.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCampus.id);
      } catch (err) {
        console.error("Supabase update error:", err);
      }
    }

    setEditingCampus(null);
    showToast(`Campus "${editingCampus.name}" updated successfully!`);
  };

  // Add Campus
  const handleCreateCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.address) return;

    const newId = formState.id || `campus-${Date.now()}`;
    const newRecord: CampusRecord = {
      id: newId,
      name: formState.name || "New Campus",
      city: (formState.city as "Yangon" | "Mawlamyine") || "Yangon",
      tagline: formState.tagline || "Center of Academic Excellence",
      address: formState.address || "",
      phone: formState.phone || "+95 9 894 332200",
      email: formState.email || "admissions@hinthar.education",
      office_hours: formState.office_hours || "Mon–Sat: 08:30 AM – 05:00 PM",
      grades_served: formState.grades_served || "Year 7–9 · Pearson IGCSE · Pearson IAL",
      facilities: formState.facilities || ["Pearson Exam Center", "Science Lab"],
      image_url: formState.image_url || "/images/heroImg.png",
      is_active: formState.is_active ?? true,
    };

    const updated = [newRecord, ...campuses];
    setCampuses(updated);
    saveStoredCampuses(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from("campuses").insert([newRecord]);
      } catch (err) {
        console.error("Supabase insert error:", err);
      }
    }

    setIsAddModalOpen(false);
    showToast(`Campus "${newRecord.name}" added successfully!`);
  };

  // Delete Campus
  const handleDeleteCampus = async () => {
    if (!deletingCampus) return;

    const updated = campuses.filter((c) => c.id !== deletingCampus.id);
    setCampuses(updated);
    saveStoredCampuses(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from("campuses").delete().eq("id", deletingCampus.id);
      } catch (err) {
        console.error("Supabase delete error:", err);
      }
    }

    setDeletingCampus(null);
    showToast(`Campus deleted.`);
  };

  if (currentUser.role === "student") {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <h2 className="text-xl font-black text-slate-800">Campus Master Records</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Master configuration of School Campuses and examination center accreditations is restricted to the School Principal &amp; Staff Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0E3B7D] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FFC700] animate-bounce">
          <span className="material-symbols-outlined text-[#FFC700]">check_circle</span>
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
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add_location_alt</span>
            <span>Add New Campus</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0E3B7D] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">location_city</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Network</p>
            <p className="text-2xl font-black text-[#0E3B7D]">{campuses.length} Campuses</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#FFC700] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">apartment</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Yangon Region</p>
            <p className="text-2xl font-black text-[#09234B]">
              {campuses.filter((c) => c.city === "Yangon").length} Campuses
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">hub</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Mon State (Regional)</p>
            <p className="text-2xl font-black text-emerald-700">
              {campuses.filter((c) => c.city === "Mawlamyine").length} Campus
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          {(["All", "Yangon", "Mawlamyine"] as const).map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                selectedCity === city
                  ? "bg-[#0E3B7D] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campus or address..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
        </div>
      </div>

      {/* Campuses Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampuses.map((campus) => (
          <div
            key={campus.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header Image */}
              <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                <Image
                  src={campus.image_url || "/images/heroImg.png"}
                  alt={campus.name}
                  fill
                  className="object-cover opacity-85"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-[#FFC700] text-[#09234B] text-[11px] font-black uppercase">
                    {campus.city}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      campus.is_active ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    {campus.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-xl font-black">{campus.name}</h3>
                  <p className="text-xs text-slate-200 truncate">{campus.tagline}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm text-[#0E3B7D] shrink-0">pin_drop</span>
                  <span className="font-medium text-slate-800">{campus.address}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#0E3B7D]">call</span>
                    <span className="truncate">{campus.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#0E3B7D]">mail</span>
                    <span className="truncate">{campus.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="material-symbols-outlined text-sm text-[#0E3B7D]">school</span>
                  <span className="font-semibold text-slate-700">{campus.grades_served}</span>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Key Facilities</p>
                  <div className="flex flex-wrap gap-1">
                    {campus.facilities.map((fac, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <a
                href="/campuses"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#0E3B7D] hover:underline flex items-center gap-1"
              >
                <span>View Public Page</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingCampus({ ...campus })}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0E3B7D] hover:bg-blue-100 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeletingCampus(campus)}
                  className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Edit Campus Modal ────────────────────────────────────── */}
      {editingCampus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <h2 className="text-xl font-black text-[#0E3B7D]">Edit Campus Information</h2>
              <button onClick={() => setEditingCampus(null)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus Name</label>
                  <input
                    type="text"
                    value={editingCampus.name}
                    onChange={(e) => setEditingCampus({ ...editingCampus, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City / Region</label>
                  <select
                    value={editingCampus.city}
                    onChange={(e) =>
                      setEditingCampus({
                        ...editingCampus,
                        city: e.target.value as "Yangon" | "Mawlamyine",
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  >
                    <option value="Yangon">Yangon</option>
                    <option value="Mawlamyine">Mawlamyine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tagline / Headline</label>
                <input
                  type="text"
                  value={editingCampus.tagline}
                  onChange={(e) => setEditingCampus({ ...editingCampus, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Campus Address</label>
                <textarea
                  rows={2}
                  value={editingCampus.address}
                  onChange={(e) => setEditingCampus({ ...editingCampus, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Contact</label>
                  <input
                    type="text"
                    value={editingCampus.phone}
                    onChange={(e) => setEditingCampus({ ...editingCampus, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Admissions Email</label>
                  <input
                    type="email"
                    value={editingCampus.email}
                    onChange={(e) => setEditingCampus({ ...editingCampus, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Visiting Hours</label>
                  <input
                    type="text"
                    value={editingCampus.office_hours}
                    onChange={(e) => setEditingCampus({ ...editingCampus, office_hours: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grades Served</label>
                  <input
                    type="text"
                    value={editingCampus.grades_served}
                    onChange={(e) => setEditingCampus({ ...editingCampus, grades_served: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Facilities (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingCampus.facilities.join(", ")}
                  onChange={(e) =>
                    setEditingCampus({
                      ...editingCampus,
                      facilities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                />
              </div>

              {/* Campus Image Upload & Picker */}
              <div className="pt-1">
                <ImageUploadPicker
                  label="Campus Photo / Cover Banner"
                  value={editingCampus.image_url || ""}
                  onChange={(url) => setEditingCampus({ ...editingCampus, image_url: url })}
                  folder="campuses"
                  aspectRatio="banner"
                  defaultPresetsCategory="campus"
                  helperText="Upload campus exterior/interior photo or choose from the school asset library."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={editingCampus.is_active}
                  onChange={(e) => setEditingCampus({ ...editingCampus, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#0E3B7D] rounded border-slate-300"
                />
                <label htmlFor="activeCheck" className="font-bold text-slate-700">
                  Campus is Active &amp; Accepting Students
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCampus(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-extrabold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Campus Modal ──────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <h2 className="text-xl font-black text-[#0E3B7D]">Add New Campus Branch</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCampus} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Yankin Junior Campus"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <select
                    value={formState.city}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        city: e.target.value as "Yangon" | "Mawlamyine",
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  >
                    <option value="Yangon">Yangon</option>
                    <option value="Mawlamyine">Mawlamyine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Modern Primary & Junior STEM Wing"
                  value={formState.tagline}
                  onChange={(e) => setFormState({ ...formState, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address</label>
                <textarea
                  rows={2}
                  placeholder="Street name, Township, City"
                  value={formState.address}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  />
                </div>
              </div>

              {/* Campus Image Upload & Picker */}
              <div className="pt-1">
                <ImageUploadPicker
                  label="Campus Photo / Cover Banner"
                  value={formState.image_url || "/images/heroImg.png"}
                  onChange={(url) => setFormState({ ...formState, image_url: url })}
                  folder="campuses"
                  aspectRatio="banner"
                  defaultPresetsCategory="campus"
                  helperText="Upload campus exterior/interior photo or choose from library."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-extrabold"
                >
                  Create Campus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────── */}
      {deletingCampus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">Delete Campus</h3>
            <p className="text-xs text-slate-600 mt-1 mb-5">
              Are you sure you want to remove <strong>{deletingCampus.name}</strong>?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeletingCampus(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCampus}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 font-black text-xs text-white"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
