"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  ImageSquare,
  Trash,
  CloudArrowUp,
  Images,
  LinkSimple,
  FolderOpen,
  CheckCircle,
  WarningCircle,
  ArrowsClockwise,
} from "@phosphor-icons/react";

export interface PresetImage {
  label: string;
  url: string;
  category?: "campus" | "scholar" | "club" | "avatar";
}

export const SCHOOL_PRESET_IMAGES: PresetImage[] = [
  { label: "Ywarma Flagship Campus", url: "/images/g2.jpg", category: "campus" },
  { label: "STEM & Robotics Innovation Centre", url: "/images/engineering.avif", category: "campus" },
  { label: "Creative Arts & Lower Secondary Wing", url: "/images/g8.jpg", category: "campus" },
  { label: "Mawlamyine Regional Campus", url: "/images/g7.jpg", category: "campus" },
  { label: "Scholar Portrait 1", url: "/images/g4.jpg", category: "scholar" },
  { label: "Scholar Portrait 2", url: "/images/g5.jpg", category: "scholar" },
  { label: "Scholar Portrait 3", url: "/images/g6.jpg", category: "scholar" },
  { label: "Scholar Portrait 4", url: "/images/g7.jpg", category: "scholar" },
  { label: "Scholar Portrait 5", url: "/images/g8.jpg", category: "scholar" },
  { label: "Scholar Portrait 6", url: "/images/g9.jpg", category: "scholar" },
  { label: "Graduation Convocation", url: "/images/graduation.webp", category: "scholar" },
  { label: "Robotics & Engineering Lab", url: "/images/engineering.avif", category: "club" },
  { label: "Debate & Global Business", url: "/images/business.jpg", category: "club" },
  { label: "Computing Lab", url: "/images/it.jpg", category: "club" },
  { label: "Dr. Kaung Myat Htut (Principal)", url: "/images/dr-kmh.webp", category: "avatar" },
  { label: "Hinthar Official Logo", url: "/images/hinthar-logo.webp", category: "avatar" },
];

interface ImageUploadPickerProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  folder?:
    | "campuses"
    | "yearbook"
    | "clubs"
    | "activities"
    | "avatars"
    | "general"
    | "testimonials";
  aspectRatio?: "banner" | "portrait" | "square";
  helperText?: string;
  defaultPresetsCategory?: "campus" | "scholar" | "club" | "avatar";
}

export default function ImageUploadPicker({
  label = "Upload / Select Image",
  value,
  onChange,
  folder = "general",
  aspectRatio = "banner",
  helperText,
  defaultPresetsCategory,
}: ImageUploadPickerProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "presets" | "url">(
    "upload"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const relevantPresets = defaultPresetsCategory
    ? SCHOOL_PRESET_IMAGES.filter(
        (p) => p.category === defaultPresetsCategory || !p.category
      )
    : SCHOOL_PRESET_IMAGES;

  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WebP, AVIF).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage("File size exceeds 8 MB limit.");
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

      const data = (await res.json()) as {
        success?: boolean;
        url?: string;
        error?: string;
      };

      if (data.success && data.url) {
        onChange(data.url);
      } else {
        setErrorMessage(data.error || "Upload failed. Please try again.");
      }
    } catch {
      setErrorMessage("Upload failed. Please check your connection and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-700 flex items-center gap-1.5">
          <ImageSquare className="w-4 h-4 text-[#193E8A]" weight="duotone" />
          <span>{label}</span>
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-red-600 hover:text-red-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <Trash className="w-3.5 h-3.5" weight="bold" />
            <span>Remove</span>
          </button>
        )}
      </div>

      <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1">
        {(
          [
            ["upload", "Upload File", CloudArrowUp],
            ["presets", "School Library", Images],
            ["url", "Direct URL", LinkSimple],
          ] as const
        ).map(([tabKey, tabLabel, Icon]) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setActiveTab(tabKey)}
            className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === tabKey
                ? "bg-white text-[#193E8A] shadow-2xs"
                : "text-slate-600 hover:text-[#1E232B]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" weight="bold" />
            <span>{tabLabel}</span>
          </button>
        ))}
      </div>

      {activeTab === "upload" && (
        <div
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 min-h-[140px] flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragActive
              ? "border-[#193E8A] bg-[#EEF3FC]"
              : "border-slate-300 hover:border-[#193E8A] bg-slate-50/70"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />

          {isUploading ? (
            <div className="py-3 flex flex-col items-center gap-2">
              <div className="w-7 h-7 border-3 border-[#193E8A] border-t-transparent rounded-full animate-spin" />
              <p className="font-bold text-[#193E8A] text-xs">
                Uploading to Cloudflare R2...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#EEF3FC] text-[#193E8A] flex items-center justify-center">
                <CloudArrowUp className="w-5 h-5" weight="duotone" />
              </div>
              <p className="font-bold text-[#1E232B] text-xs">
                Drag & drop an image or browse your computer
              </p>
              <p className="text-[11px] text-slate-500">
                PNG, JPG, WebP, AVIF up to 8 MB
              </p>
              <span className="mt-1 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#193E8A] text-white font-bold text-xs">
                <FolderOpen className="w-4 h-4" weight="bold" />
                <span>Browse File</span>
              </span>
            </div>
          )}
        </div>
      )}

      {activeTab === "presets" && (
        <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {relevantPresets.map((preset, idx) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(preset.url)}
                  className={`group relative rounded-xl overflow-hidden border text-left p-1 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#193E8A] ring-2 ring-[#193E8A] bg-[#EEF3FC]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="relative h-14 w-full rounded-lg overflow-hidden bg-slate-900 mb-1">
                    <Image
                      src={preset.url}
                      alt={preset.label}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="150px"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#193E8A]/60 flex items-center justify-center text-white">
                        <CheckCircle className="w-5 h-5" weight="fill" />
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

      {activeTab === "url" && (
        <input
          type="text"
          placeholder="https://... or /images/..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#193E8A] outline-none text-xs"
        />
      )}

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-[11px] font-semibold flex items-center gap-1.5 border border-red-200">
          <WarningCircle className="w-4 h-4 shrink-0" weight="fill" />
          <span>{errorMessage}</span>
        </div>
      )}

      {value && (
        <div className="mt-2 p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">
              Current Image Preview
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-[#EEF3FC] text-[#193E8A] font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowsClockwise className="w-3.5 h-3.5" weight="bold" />
              <span>Replace</span>
            </button>
          </div>

          <div
            className={`relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 ${
              aspectRatio === "portrait"
                ? "h-44 max-w-[170px] mx-auto"
                : aspectRatio === "square"
                  ? "h-36 max-w-[150px] mx-auto"
                  : "h-36 sm:h-40 w-full"
            }`}
          >
            <Image
              src={value}
              alt="Preview"
              fill
              unoptimized
              className="object-cover"
              sizes="400px"
            />
          </div>
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
