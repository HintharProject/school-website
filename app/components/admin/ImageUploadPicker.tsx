"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export interface PresetImage {
  label: string;
  url: string;
  category?: "campus" | "scholar" | "club" | "avatar";
}

// Curated internal school presets for rapid selection
export const SCHOOL_PRESET_IMAGES: PresetImage[] = [
  // Campus & Facility Presets
  { label: "Ywarma Flagship Campus", url: "/images/heroImg.png", category: "campus" },
  { label: "STEM & Robotics Innovation Center", url: "/images/specialisations/stemSpecialisation.png", category: "campus" },
  { label: "Creative Arts & Lower Secondary Wing", url: "/images/specialisations/creativeSpecialisation.png", category: "campus" },
  { label: "Mawlamyine Regional Campus", url: "/images/specialisations/businessSpecialisation.png", category: "campus" },

  // Scholar & Student Portrait Presets
  { label: "Scholar Portrait — Male 1", url: "/images/g4.jpg", category: "scholar" },
  { label: "Scholar Portrait — Male 2", url: "/images/g5.jpg", category: "scholar" },
  { label: "Scholar Portrait — Female 1", url: "/images/g6.jpg", category: "scholar" },
  { label: "Scholar Portrait — Male 3", url: "/images/g7.jpg", category: "scholar" },
  { label: "Scholar Portrait — Female 2", url: "/images/g8.jpg", category: "scholar" },
  { label: "Scholar Portrait — Female 3", url: "/images/g9.jpg", category: "scholar" },
  { label: "Graduation Convocation", url: "/images/graduation.png", category: "scholar" },

  // Clubs & Society Presets
  { label: "Robotics & Engineering Lab", url: "/images/engineering.avif", category: "club" },
  { label: "Debate & Global Business", url: "/images/business.jpg", category: "club" },
  { label: "Newton Science & Chemistry Suite", url: "/images/g2.jpg", category: "club" },
  { label: "Digital Arts & Media Studio", url: "/images/g8.jpg", category: "club" },
  { label: "Badminton & Athletic Arena", url: "/images/g7.jpg", category: "club" },
  { label: "Music & Theatre Hall", url: "/images/g6.jpg", category: "club" },

  // Avatars
  { label: "Dr. Kaung Myat Htut (Principal)", url: "/images/Dr_KMH.png", category: "avatar" },
];

interface ImageUploadPickerProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: "campuses" | "yearbook" | "clubs" | "activities" | "avatars" | "general";
  aspectRatio?: "banner" | "portrait" | "square";
  helperText?: string;
  defaultPresetsCategory?: "campus" | "scholar" | "club" | "avatar";
}

export default function ImageUploadPicker({
  label = "Upload / Edit Image",
  value,
  onChange,
  folder = "general",
  aspectRatio = "banner",
  helperText,
  defaultPresetsCategory,
}: ImageUploadPickerProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "presets" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter presets if default category provided
  const relevantPresets = defaultPresetsCategory
    ? SCHOOL_PRESET_IMAGES.filter((p) => p.category === defaultPresetsCategory || !p.category)
    : SCHOOL_PRESET_IMAGES;

  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WebP, etc.)");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage("File size exceeds 8MB limit.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as any;

      if (data.success && data.url) {
        onChange(data.url);
      } else {
        setErrorMessage(data.error || "Upload failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage("Network error during upload. Falling back to local preview.");

      // Emergency client-side reader fallback
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const aspectClass =
    aspectRatio === "portrait"
      ? "h-48 w-36"
      : aspectRatio === "square"
      ? "h-36 w-36"
      : "h-36 w-full";

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-700 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-[#0E3B7D]">add_photo_alternate</span>
          <span>{label}</span>
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-red-500 hover:text-red-700 text-[11px] font-bold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">delete</span>
            <span>Remove Image</span>
          </button>
        )}
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-all ${
            activeTab === "upload"
              ? "bg-white text-[#0E3B7D] shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-sm">cloud_upload</span>
          <span>Upload File</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("presets")}
          className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-all ${
            activeTab === "presets"
              ? "bg-white text-[#0E3B7D] shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-sm">photo_library</span>
          <span>School Library</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("url")}
          className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-all ${
            activeTab === "url"
              ? "bg-white text-[#0E3B7D] shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-sm">link</span>
          <span>Direct URL</span>
        </button>
      </div>

      {/* Tab 1: Upload File */}
      {activeTab === "upload" && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 min-h-[150px] flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragActive
              ? "border-[#0E3B7D] bg-blue-50/80 scale-[1.01]"
              : "border-slate-300 hover:border-[#0E3B7D] bg-slate-50/70 hover:bg-slate-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          {isUploading ? (
            <div className="py-4 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-3 border-[#0E3B7D] border-t-transparent rounded-full animate-spin" />
              <p className="font-bold text-[#0E3B7D] text-xs">Uploading to Cloudflare R2 Storage...</p>
            </div>
          ) : (
            <div className="py-2 flex flex-col items-center justify-center gap-2.5 w-full">
              <div className="w-11 h-11 rounded-2xl bg-blue-100/80 text-[#0E3B7D] flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-2xl">file_upload</span>
              </div>
              <div className="text-center pointer-events-none">
                <p className="font-bold text-slate-800 text-xs mb-0.5">
                  Select Banner Image or Drag &amp; Drop Here
                </p>
                <p className="text-[10px] text-slate-400">
                  Supports PNG, JPG, JPEG, WebP, AVIF (Max 8MB)
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-1 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0E3B7D] hover:bg-[#164E9A] text-white font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer border border-[#FFC700]/30"
              >
                <span className="material-symbols-outlined text-base">folder_open</span>
                <span>Browse Image File</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: School Library Presets */}
      {activeTab === "presets" && (
        <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 max-h-48 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Select from Curated Assets ({relevantPresets.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {relevantPresets.map((preset, idx) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(preset.url)}
                  className={`group relative rounded-xl overflow-hidden border text-left p-1 transition-all ${
                    isSelected
                      ? "border-[#0E3B7D] ring-2 ring-[#0E3B7D] bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="relative h-14 w-full rounded-lg overflow-hidden bg-slate-900 mb-1">
                    <Image
                      src={preset.url}
                      alt={preset.label}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="150px"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#0E3B7D]/60 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-slate-800 truncate px-0.5">
                    {preset.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Direct URL */}
      {activeTab === "url" && (
        <div className="space-y-1.5">
          <input
            type="url"
            placeholder="https://images.unsplash.com/... or /images/..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none text-xs"
          />
          <p className="text-[10px] text-slate-400">
            Enter any public image URL or local relative path starting with <code>/images/</code>.
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2 rounded-xl bg-red-50 text-red-700 text-[11px] font-semibold flex items-center gap-1.5 border border-red-200">
          <span className="material-symbols-outlined text-sm">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Preview Display */}
      {value && (
        <div className="mt-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div
            className={`relative ${aspectClass} rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0`}
          >
            <Image
              src={value}
              alt="Selected Preview"
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold text-slate-800">Live Image Preview</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate font-mono">{value}</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0E3B7D] hover:bg-blue-100 font-bold text-[10px] flex items-center gap-1 transition-colors border border-blue-200"
              >
                <span className="material-symbols-outlined text-xs">refresh</span>
                <span>Replace Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {helperText && <p className="text-[10px] text-slate-400 mt-1">{helperText}</p>}
    </div>
  );
}
