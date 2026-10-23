"use client";

import { useEffect, type RefObject } from "react";
import { useScrollLock } from "@/lib/motion/scroll";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Shared behaviour for overlays (mobile menu, bag, lightbox): locks page
 * scroll, moves focus inside, keeps Tab inside, closes on Escape, and returns
 * focus to whatever opened it.
 */
export function useDialog(open: boolean, onClose: () => void, panelRef: RefObject<HTMLElement | null>): void {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const focusables = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    const frame = requestAnimationFrame(() => focusables()[0]?.focus());

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const list = focusables();
      const first = list[0];
      const last = list[list.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open, onClose, panelRef]);
}
