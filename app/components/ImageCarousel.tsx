"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export default function ImageCarousel({
  images,
  alt,
  className = "",
}: ImageCarouselProps) {
  const uniqueImages = useMemo(
    () => [...new Set(images.filter(Boolean))],
    [images]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (uniqueImages.length < 2) return;
    const timer = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % uniqueImages.length),
      5500
    );
    return () => window.clearInterval(timer);
  }, [uniqueImages.length]);

  const effectiveIndex = uniqueImages.length
    ? activeIndex % uniqueImages.length
    : 0;
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
              setActiveIndex(
                (index) =>
                  (index - 1 + uniqueImages.length) % uniqueImages.length
              );
            }}
            className="absolute left-2.5 top-1/2 z-10 -translate-y-1/2 inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#0F2759]/65 text-white hover:bg-[#0F2759]/85 backdrop-blur-xs transition-colors cursor-pointer"
          >
            <CaretLeft className="w-4 h-4" weight="bold" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex((index) => (index + 1) % uniqueImages.length);
            }}
            className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#0F2759]/65 text-white hover:bg-[#0F2759]/85 backdrop-blur-xs transition-colors cursor-pointer"
          >
            <CaretRight className="w-4 h-4" weight="bold" />
          </button>
          <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {uniqueImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`Show photo ${index + 1}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex(index);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  index === effectiveIndex ? "w-5 bg-[#FFD600]" : "w-1.5 bg-white/75"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
