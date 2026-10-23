/**
 * Animation tokens. Every duration and easing in the engine comes from here,
 * so the whole site can be made faster or slower in one place.
 * Values are in seconds (GSAP and Framer Motion both use seconds).
 */
export const duration = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.8,
  cinematic: 1.2,
} as const;

export const ease = {
  /** GSAP easing names */
  out: "power3.out",
  in: "power2.in",
  inOut: "power2.inOut",
  /** CSS / Framer Motion equivalent of power3.out */
  outCurve: [0.22, 1, 0.36, 1] as [number, number, number, number],
} as const;

/** Collection transition timeline (TRD §20), offsets in seconds from the moment a change starts. */
export const collectionTimeline = {
  productExit: 0,
  titleExit: 0.2,
  environment: 0.4,
  counterUpdate: 0.6,
  productEnter: 0.6,
  titleEnter: 0.9,
  settled: 1.5,
} as const;

/** Minimum time between two slide changes, so rapid clicks or swipes cannot stack transitions. */
export const navigationCooldown = 0.9;
