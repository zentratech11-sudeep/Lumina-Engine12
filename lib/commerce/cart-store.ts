"use client";

import { useSyncExternalStore } from "react";
import { addLine, parseStoredLines, setLineQuantity, type CartLine } from "./cart";

interface CartSnapshot {
  lines: CartLine[];
  open: boolean;
}

const STORAGE_KEY = `bag:${process.env.NEXT_PUBLIC_BRAND ?? "lumina"}`;
const empty: CartSnapshot = { lines: [], open: false };
let snapshot: CartSnapshot = empty;
let hydrated = false;
const listeners = new Set<() => void>();

function emit(next: CartSnapshot, persist = true) {
  snapshot = next;
  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next.lines));
    } catch {
      // Private mode or full storage: the bag still works for this visit.
    }
  }
  listeners.forEach((listener) => listener());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    snapshot = { ...snapshot, lines: parseStoredLines(window.localStorage.getItem(STORAGE_KEY)) };
  } catch {
    snapshot = empty;
  }
  // Keep tabs in sync.
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) emit({ ...snapshot, lines: parseStoredLines(event.newValue) }, false);
  });
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCart(): CartSnapshot {
  return useSyncExternalStore(subscribe, () => snapshot, () => empty);
}

export const cart = {
  add(slug: string, quantity = 1) {
    hydrate();
    emit({ ...snapshot, lines: addLine(snapshot.lines, slug, quantity) });
  },
  setQuantity(slug: string, quantity: number) {
    emit({ ...snapshot, lines: setLineQuantity(snapshot.lines, slug, quantity) });
  },
  remove(slug: string) {
    emit({ ...snapshot, lines: setLineQuantity(snapshot.lines, slug, 0) });
  },
  clear() {
    emit({ ...snapshot, lines: [] });
  },
  open() {
    emit({ ...snapshot, open: true }, false);
  },
  close() {
    emit({ ...snapshot, open: false }, false);
  },
};
