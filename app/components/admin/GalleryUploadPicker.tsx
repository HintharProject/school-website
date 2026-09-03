"use client";

import Image from "next/image";
import ImageUploadPicker from "./ImageUploadPicker";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

interface GalleryUploadPickerProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: "campuses" | "clubs";
  label?: string;
}

export default function GalleryUploadPicker({
  value,
  onChange,
  folder,
  label = "Photo Gallery",
}: GalleryUploadPickerProps) {
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-xs font-bold text-slate-700">{label}</h3>
        <p className="text-[10px] text-slate-400">Add up to 12 photos. Use the arrows to set slideshow order.</p>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="relative aspect-video">
                <Image src={url} alt={`Gallery photo ${index + 1}`} fill unoptimized={isR2AssetUrl(url)} className="object-cover" />
              </div>
              <div className="flex items-center justify-between p-1.5">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move photo left" className="p-1 text-slate-500 disabled:opacity-30">
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                </button>
                <button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove photo" className="p-1 text-red-500">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === value.length - 1} aria-label="Move photo right" className="p-1 text-slate-500 disabled:opacity-30">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {value.length < 12 && (
        <ImageUploadPicker
          label="Add Gallery Photo"
          value=""
          onChange={(url) => {
            if (url && !value.includes(url)) onChange([...value, url]);
          }}
          folder={folder}
          defaultPresetsCategory={folder === "campuses" ? "campus" : "club"}
          helperText={`${value.length}/12 photos added`}
        />
      )}
    </div>
  );
}
