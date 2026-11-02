"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, CaretLeft, CaretRight, CornersOut } from "@phosphor-icons/react";
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
  if (count >= 3 && index === 0)
    return "col-span-2 row-span-2 aspect-auto min-h-[190px] sm:min-h-[260px]";
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
      } else if (expandedIndex !== null && images.length > 1) {
        if (event.key === "ArrowRight") {
          setExpandedIndex((prev) => ((prev ?? 0) + 1) % images.length);
        } else if (event.key === "ArrowLeft") {
          setExpandedIndex(
            (prev) => ((prev ?? 0) - 1 + images.length) % images.length
          );
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, expandedIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0F2759]/50 backdrop-blur-xs p-3 sm:p-6 animate-fade-in"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${campusName} photo gallery`}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {city && (
              <span className="inline-flex items-center rounded-full bg-[#FFD600] px-2.5 py-0.5 text-[11px] font-extrabold text-[#162033] mb-1">
                {city}
              </span>
            )}
            <h3 className="truncate text-lg font-extrabold text-[#1E232B] sm:text-xl">
              {campusName}
            </h3>
            <p className="text-xs font-medium text-slate-500">
              {images.length} {images.length === 1 ? "photo" : "photos"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#193E8A] cursor-pointer"
            aria-label="Close gallery"
          >
            <X className="w-5 h-5" weight="bold" />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain p-3 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 auto-rows-fr">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`View ${campusName} photo ${index + 1}`}
                onClick={() => setExpandedIndex(index)}
                className={`group relative overflow-hidden rounded-2xl bg-slate-100 cursor-pointer ${galleryLayout(images.length, index)}`}
              >
                <Image
                  src={image}
                  alt={`${campusName} — photo ${index + 1}`}
                  fill
                  unoptimized={isR2AssetUrl(image)}
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 50vw, 300px"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
                <span className="pointer-events-none absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-[#0F2759]/80 px-2.5 py-1 text-[11px] font-bold text-white opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                  <CornersOut className="w-3.5 h-3.5" weight="bold" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {expandedIndex !== null && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center bg-[#0F2759]/85 backdrop-blur-sm p-4 sm:p-8"
          onClick={() => setExpandedIndex(null)}
          role="dialog"
          aria-label="Expanded photo"
        >
          <button
            type="button"
            onClick={() => setExpandedIndex(null)}
            className="absolute top-4 right-4 z-10 inline-flex items-center justify-center h-11 w-11 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer"
            aria-label="Close expanded photo"
          >
            <X className="w-5 h-5" weight="bold" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedIndex(
                    (expandedIndex - 1 + images.length) % images.length
                  );
                }}
                aria-label="Previous photo"
                className="absolute left-3 sm:left-6 z-10 inline-flex items-center justify-center h-11 w-11 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer"
              >
                <CaretLeft className="w-5 h-5" weight="bold" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedIndex((expandedIndex + 1) % images.length);
                }}
                aria-label="Next photo"
                className="absolute right-3 sm:right-6 z-10 inline-flex items-center justify-center h-11 w-11 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer"
              >
                <CaretRight className="w-5 h-5" weight="bold" />
              </button>
            </>
          )}

          <div
            className="relative h-full w-full max-h-[84vh] max-w-5xl"
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
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3.5 py-1 text-xs font-semibold text-white">
              {expandedIndex + 1} / {images.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
