"use client";

import { useEffect, useSyncExternalStore } from "react";
import type Lenis from "lenis";

/**
 * Shared access to the smooth-scroll instance (TRD §2: Lenis) and a
 * reference-counted scroll lock for menus, the bag and the lightbox.
 */
let instance: Lenis | null = null;
const listeners = new Set<() => void>();

export function setLenis(next: Lenis | null): void {
  instance = next;
  listeners.forEach((listener) => listener());
}

export function getLenis(): Lenis | null {
  return instance;
}

export function useLenis(): Lenis | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => instance,
    () => null,
  );
}

/** Scrolls to an element, smoothly through Lenis when it is running. */
export function scrollToElement(element: HTMLElement, immediate = false): void {
  if (instance) instance.scrollTo(element, { immediate, offset: 0 });
  else element.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
}

let locks = 0;
let previousOverflow = "";

function lock() {
  if (locks === 0) {
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    instance?.stop();
  }
  locks += 1;
}

function unlock() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    document.documentElement.style.overflow = previousOverflow;
    instance?.start();
  }
}

/** Stops page scrolling while `active` (several overlays can hold the lock at once). */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
