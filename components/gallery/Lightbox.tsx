"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, type PointerEvent } from "react";
import { duration, ease } from "@/config/motion";
import { useDialog } from "@/hooks/useDialog";
import type { GalleryItem } from "@/types/content";
import { ChevronIcon, CloseIcon } from "@/components/ui/Icons";

interface LightboxProps {
  items: GalleryItem[];
  index: number | null;
  onChange: (index: number) => void;
  onClose: () => void;
}

/** Full-screen image viewer: ← → or swipe to move, Escape to close. */
export function Lightbox({ items, index, onChange, onClose }: LightboxProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const open = index !== null;
  useDialog(open, onClose, panelRef);

  const count = items.length;
  const item = index !== null ? items[index] : undefined;
  const step = (delta: number) => index !== null && onChange((index + delta + count) % count);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") onChange(((index ?? 0) + 1) % count);
      if (event.key === "ArrowLeft") onChange(((index ?? 0) - 1 + count) % count);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, index, count, onChange]);

  const onPointerUp = (event: PointerEvent) => {
    if (swipe.current === null) return;
    const dx = event.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
  };

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${(index ?? 0) + 1} of ${count}`}
          className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : duration.normal, ease: ease.outCurve }}
        >
          <div className="flex h-16 items-center justify-between px-5 sm:px-8">
            <p className="text-sm tabular-nums text-muted-text">
              {(index ?? 0) + 1} / {count}
            </p>
            <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
          <div
            className="relative flex-1 touch-pan-y"
            onPointerDown={(event) => (swipe.current = event.clientX)}
            onPointerUp={onPointerUp}
          >
            <Image key={item.id} src={item.src} alt={item.alt} fill sizes="100vw" className="object-contain p-4 sm:p-10" />
            {count > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Previous image" className="stage-arrow absolute top-1/2 left-2 -translate-y-1/2 sm:left-6">
                  <ChevronIcon direction="left" width={22} height={22} />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next image" className="stage-arrow absolute top-1/2 right-2 -translate-y-1/2 sm:right-6">
                  <ChevronIcon direction="right" width={22} height={22} />
                </button>
              </>
            )}
          </div>
          <p className="min-h-16 px-6 py-5 text-center font-display text-xl text-text">{item.caption ?? ""}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
