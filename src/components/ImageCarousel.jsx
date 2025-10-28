"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function ImageCarousel({ images, title }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  // Handle empty or invalid images
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square rounded-xl bg-background flex items-center justify-center">
        <span className="text-text-secondary">No image available</span>
      </div>
    );
  }
  // Single image - no carousel needed
  if (images.length === 1) {
    return (
      <div className="relative w-full h-full bg-background  ">
        <Image src={images[0]} alt={title} fill className="object-contain p-4 rounded" priority />
      </div>
    );
  }
  // Multiple images - full carousel
  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="overflow-hidden " ref={emblaRef}>
        <div className="flex">
          {images.map((img, idx) => (
            <div key={idx} className="flex-[0_0_100%] min-w-0">
              <div className="relative w-full aspect-square bg-background">
                <Image
                  src={img}
                  alt={`${title} - Image ${idx + 1}`}
                  fill
                  className="object-contain p-4"
                  priority={idx === 0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all z-10"
        aria-label="Previous image"
      >
        <FaArrowLeft />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all z-10"
        aria-label="Next image"
      >
        <FaArrowRight />
      </button>
      {/* Dot Indicators */}
      <div className="flex justify-center gap-1  mb-3">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === selectedIndex ? "bg-text-primary w-8" : "bg-text-secondary/50 w-2"
            }`}
            aria-label={`Go to image ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
