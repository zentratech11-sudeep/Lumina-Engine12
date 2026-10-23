"use client";

import { media } from "@/config/breakpoints";
import { useMediaQuery } from "./useMediaQuery";

/** True when the visitor has asked their OS for less motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery(media.reducedMotion);
}
