/** Joins class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Wraps any integer into the range 0..count-1, so stepping past either end loops around. */
export function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

/** "01 / 06" style counter text. */
export function formatCounter(index: number, count: number): { current: string; total: string } {
  const width = Math.max(2, String(count).length);
  return {
    current: String(index + 1).padStart(width, "0"),
    total: String(count).padStart(width, "0"),
  };
}

/** Shortest direction from one slide to another, used to decide which way products travel. */
export function travelDirection(from: number, to: number, count: number): 1 | -1 {
  if (from === to) return 1;
  const forward = wrapIndex(to - from, count);
  return forward <= count / 2 ? 1 : -1;
}

/** Localised price, e.g. "NPR 4,500" or "$45.00". */
export function formatPrice(amount: number, currency: string, locale = "en"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

/** Rough reading time for an article, at 220 words per minute, never less than 1. */
export function readingMinutes(texts: string[]): number {
  const words = texts.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** "2 September 2026" style date from an ISO date string, without timezone drift. */
export function formatDate(isoDate: string, locale = "en-GB"): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1)).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
