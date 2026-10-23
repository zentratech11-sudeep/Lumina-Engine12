"use client";

import { useCallback, useState } from "react";
import type { GalleryItem } from "@/types/content";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SafeImage } from "@/components/ui/SafeImage";
import { Lightbox } from "./Lightbox";

/** Masonry gallery (PRD §5). Images lazy-load below the fold; any image opens in the lightbox. */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <>
      <ul className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>li]:mb-6">
        {items.map((item, i) => (
          <li key={item.id} className="break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full text-left"
              aria-label={`Open image: ${item.alt}`}
            >
              <span className="product-frame relative block overflow-hidden" style={{ aspectRatio: `${item.width} / ${item.height}` }}>
                <SafeImage
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </span>
              {item.caption && <span className="mt-3 block text-sm text-muted-text">{item.caption}</span>}
            </button>
          </li>
        ))}
      </ul>
      <ErrorBoundary fallback={null} label="gallery lightbox">
        <Lightbox items={items} index={open} onChange={setOpen} onClose={close} />
      </ErrorBoundary>
    </>
  );
}
