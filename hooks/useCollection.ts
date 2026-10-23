"use client";

import { useCallback, useRef, useState } from "react";
import { navigationCooldown } from "@/config/motion";
import { travelDirection, wrapIndex } from "@/lib/utils";

export interface CollectionPosition {
  collection: number;
  slide: number;
  /** 1 when moving forward, -1 when moving back. Products travel in this direction. */
  direction: 1 | -1;
}

export interface CollectionState extends CollectionPosition {
  next: () => void;
  prev: () => void;
  /** Jump to a slide in the active collection. `immediate` skips the cooldown (used by scroll). */
  goTo: (slide: number, options?: { immediate?: boolean }) => void;
  selectCollection: (collection: number) => void;
}

/**
 * Single source of truth for the showcase (TRD §21): which collection and
 * which slide are active. Stage, title, counter and environment all read it.
 * `slideCounts[i]` is the number of slides in collection i.
 */
export function useCollection(slideCounts: number[], cooldownSeconds: number = navigationCooldown): CollectionState {
  const [position, setPosition] = useState<CollectionPosition>({ collection: 0, slide: 0, direction: 1 });
  // Mirrors `position` so callbacks can decide synchronously, keeping state updaters pure.
  const current = useRef(position);
  const lastChange = useRef(-Infinity);

  const commit = useCallback((next: CollectionPosition) => {
    current.current = next;
    lastChange.current = performance.now();
    setPosition(next);
  }, []);

  const coolingDown = useCallback(
    () => performance.now() - lastChange.current < cooldownSeconds * 1000,
    [cooldownSeconds],
  );

  const step = useCallback(
    (delta: 1 | -1) => {
      if (coolingDown()) return;
      const now = current.current;
      commit({ ...now, slide: wrapIndex(now.slide + delta, slideCounts[now.collection] ?? 1), direction: delta });
    },
    [coolingDown, commit, slideCounts],
  );

  const goTo = useCallback(
    (target: number, options?: { immediate?: boolean }) => {
      const now = current.current;
      const count = slideCounts[now.collection] ?? 1;
      const slide = wrapIndex(target, count);
      if (slide === now.slide || (!options?.immediate && coolingDown())) return;
      const direction = options?.immediate ? (slide > now.slide ? 1 : -1) : travelDirection(now.slide, slide, count);
      commit({ ...now, slide, direction });
    },
    [coolingDown, commit, slideCounts],
  );

  const selectCollection = useCallback(
    (collection: number) => {
      const now = current.current;
      if (collection === now.collection || collection < 0 || collection >= slideCounts.length) return;
      commit({ collection, slide: 0, direction: collection > now.collection ? 1 : -1 });
    },
    [commit, slideCounts.length],
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  return { ...position, next, prev, goTo, selectCollection };
}
