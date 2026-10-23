import { z } from "zod";

/**
 * The bag (PRD §8, §29). Lines hold only a product slug and a quantity;
 * names, images and prices are always read from current brand data, so a
 * stale bag can never show an old price. Pure helpers here are unit-tested;
 * the browser store lives in `cart-store.ts`.
 */
export interface CartLine {
  slug: string;
  quantity: number;
}

export const MAX_QUANTITY = 10;

const storedSchema = z.array(
  z.object({ slug: z.string().regex(/^[a-z0-9-]+$/), quantity: z.number().int().min(1).max(MAX_QUANTITY) }),
);

const clamp = (quantity: number) => Math.min(MAX_QUANTITY, Math.max(0, Math.round(quantity)));

export function addLine(lines: CartLine[], slug: string, quantity = 1): CartLine[] {
  const existing = lines.find((line) => line.slug === slug);
  if (!existing) return [...lines, { slug, quantity: clamp(quantity) || 1 }];
  return lines.map((line) => (line.slug === slug ? { ...line, quantity: clamp(line.quantity + quantity) } : line));
}

/** Sets a line's quantity; 0 removes it. */
export function setLineQuantity(lines: CartLine[], slug: string, quantity: number): CartLine[] {
  const next = clamp(quantity);
  if (next === 0) return lines.filter((line) => line.slug !== slug);
  return lines.map((line) => (line.slug === slug ? { ...line, quantity: next } : line));
}

/** Parses whatever was in storage, dropping anything malformed or no longer in the catalog. */
export function parseStoredLines(raw: string | null, validSlugs?: ReadonlySet<string>): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = storedSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return [];
    const unique = new Map<string, CartLine>();
    for (const line of parsed.data) {
      if (validSlugs && !validSlugs.has(line.slug)) continue;
      unique.set(line.slug, line);
    }
    return [...unique.values()];
  } catch {
    return [];
  }
}

export function countItems(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

interface PricedProduct {
  slug: string;
  name: string;
  price?: number;
  currency?: string;
}

/** Total in one currency, or null if any line has no price or currencies differ. */
export function subtotal(lines: CartLine[], products: PricedProduct[]): { amount: number; currency: string } | null {
  if (lines.length === 0) return null;
  let currency: string | undefined;
  let amount = 0;
  for (const line of lines) {
    const product = products.find((p) => p.slug === line.slug);
    if (!product || product.price === undefined || !product.currency) return null;
    if (currency && currency !== product.currency) return null;
    currency = product.currency;
    amount += product.price * line.quantity;
  }
  return currency ? { amount, currency } : null;
}

/** The message pre-filled in the contact form when a visitor sends their bag as an enquiry. */
export function enquiryMessage(lines: CartLine[], products: PricedProduct[]): string {
  const items = lines
    .map((line) => {
      const product = products.find((p) => p.slug === line.slug);
      return product ? `- ${line.quantity} × ${product.name}` : null;
    })
    .filter(Boolean);
  if (items.length === 0) return "";
  return `I'd like to ask about availability and prices for:\n${items.join("\n")}\n`;
}
