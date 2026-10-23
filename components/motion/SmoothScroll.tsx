"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { setLenis } from "@/lib/motion/scroll";

/**
 * Smooth wheel scrolling with Lenis, driven by GSAP's ticker so ScrollTrigger
 * scroll sequences stay in sync (TRD §2, §18). Touch scrolling stays native,
 * and nothing is smoothed for visitors who prefer reduced motion.
 */
export function SmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.11 });
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    setLenis(lenis);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, [reducedMotion]);

  return null;
}
