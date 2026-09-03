"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

interface CampusGalleryModalProps {
  images: string[];
  campusName: string;
  city?: string;
  isOpen: boolean;
  onClose: () => void;
}

function galleryLayout(count: number, index: number): string {
  if (count === 1) return "col-span-2 sm:col-span-3 aspect-[16/10]";
  if (count === 2) return "col-span-1 aspect-[4/3]";
  if (count === 3 && index === 0) return "col-span-2 row-span-2 aspect-auto min-h-[180px] sm:min-h-[240px]";
  if (count >= 4 && index === 0) return "col-span-2 row-span-2 aspect-auto min-h-[180px] sm:min-h-[260px]";
  return "col-span-1 aspect-[4/3]";
}

export default function CampusGalleryModal({
  images,
  campusName,
  city,
  isOpen,
  onClose,
}: CampusGalleryModalProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setExpandedIndex(null);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (expandedIndex !== null) setExpandedIndex(null);
        else onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, expandedIndex]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/25 backdrop-blur-sm p-3 sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${campusName} photo gallery`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {city && (
              <span className="inline-flex items-center rounded-full bg-[#FFC700] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#09234B]">
                {city}
              </span>
            )}
            <h3 className="truncate text-lg font-black text-[#09234B] sm:text-xl">{campusName}</h3>
            <p className="text-xs font-semibold text-slate-500">
              {images.length} {images.length === 1 ? "photo" : "photos"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close gallery"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-2xl">
              close
            </span>
          </button>
        </div>

        {/* Flexible grid — all photos visible at once */}
        <div className="overflow-y-auto overscroll-contain p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 auto-rows-fr">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`View ${campusName} photo ${index + 1} full size`}
                onClick={() => setExpandedIndex(index)}
                className={`group relative overflow-hidden rounded-xl bg-slate-100 ${galleryLayout(images.length, index)}`}
              >
                <Image
                  src={image}
                  alt={`${campusName} — photo ${index + 1}`}
                  fill
                  unoptimized={isR2AssetUrl(image)}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 50vw, 280px"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  Expand
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Optional full-size expand overlay — only when a tile is clicked */}
      {expandedIndex !== null && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-8"
          onClick={() => setExpandedIndex(null)}
          role="dialog"
          aria-label="Expanded photo"
        >
          <button
            type="button"
            onClick={() => setExpandedIndex(null)}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label="Close expanded photo"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-2xl">
              close
            </span>
          </button>

          <div
            className="relative h-full w-full max-h-[85vh] max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={images[expandedIndex]}
              alt={`${campusName} — photo ${expandedIndex + 1}`}
              fill
              unoptimized={isR2AssetUrl(images[expandedIndex])}
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {images.length > 1 && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {expandedIndex + 1} / {images.length} — click outside to return to grid
            </p>
          )}
        </div>
      )}
    </div>
  );
}
