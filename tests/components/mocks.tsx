import type { ImgHTMLAttributes } from "react";
import { brandRegistry } from "@/brands";
import { parseBrandBundle } from "@/lib/brand";

/** Real brand data, so component tests exercise the same shapes the site renders. */
export const lumina = parseBrandBundle(brandRegistry.lumina, "lumina");
export const solenne = parseBrandBundle(brandRegistry.solenne, "solenne");

/** Stand-in for next/image: a plain <img> without Next-only props. */
export function MockImage({
  src,
  alt,
  fill: _fill,
  priority: _priority,
  sizes: _sizes,
  ...rest
}: ImgHTMLAttributes<HTMLImageElement> & { src: string | { src: string }; fill?: boolean; priority?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={typeof src === "string" ? src : src.src} alt={alt} {...rest} />;
}
