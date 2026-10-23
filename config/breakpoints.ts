/** Layout breakpoints in px (TRD §26). Keep in sync with the @custom-variant rules in globals.css if you change them. */
export const breakpoints = {
  tablet: 640,
  desktop: 1024,
  large: 1440,
} as const;

export const media = {
  mobile: `(max-width: ${breakpoints.tablet - 1}px)`,
  belowDesktop: `(max-width: ${breakpoints.desktop - 1}px)`,
  coarsePointer: "(pointer: coarse)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
} as const;
