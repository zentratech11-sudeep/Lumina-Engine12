"use client";

import { useEffect, useState, type RefObject } from "react";

/** Whether an element is at least `threshold` visible. Used to pause rendering offscreen. */
export function useInView(ref: RefObject<Element | null>, threshold = 0.15): boolean {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting && entry.intersectionRatio >= threshold)),
      { threshold: [0, threshold, 1] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return inView;
}
