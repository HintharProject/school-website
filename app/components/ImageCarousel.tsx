"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export default function ImageCarousel({ images, alt, className = "" }: ImageCarouselProps) {
  const uniqueImages = useMemo(() => [...new Set(images.filter(Boolean))], [images]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (uniqueImages.length < 2) return;
    const timer = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % uniqueImages.length),
      5000
    );
    return () => window.clearInterval(timer);
  }, [uniqueImages.length]);

  const effectiveIndex = uniqueImages.length ? activeIndex % uniqueImages.length : 0;
  const activeImage = uniqueImages[effectiveIndex] || "/images/g2.jpg";

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={activeImage}
        alt={`${alt} — photo ${effectiveIndex + 1}`}
        fill
        unoptimized={isR2AssetUrl(activeImage)}
        className="object-cover transition-opacity duration-500"
      />
      {uniqueImages.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex((index) => (index - 1 + uniqueImages.length) % uniqueImages.length);
            }}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-1 text-white backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex((index) => (index + 1) % uniqueImages.length);
            }}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-1 text-white backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {uniqueImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`Show photo ${index + 1}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex(index);
                }}
                className={`h-1.5 rounded-full transition-all ${index === effectiveIndex ? "w-5 bg-white" : "w-1.5 bg-white/60"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
