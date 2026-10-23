import type { z } from "zod";
import type { collectionSchema, environmentSchema, slideSchema, stagedProductSchema, transitionStyles } from "@/lib/validation";
import type { Product } from "./product";

export type Collection = z.infer<typeof collectionSchema>;
export type Slide = z.infer<typeof slideSchema>;
export type StagedProduct = z.infer<typeof stagedProductSchema>;
export type EnvironmentOverride = z.infer<typeof environmentSchema>;
export type TransitionStyle = (typeof transitionStyles)[number];

/** Fully resolved scene mood for one slide: brand scene ← collection override ← slide override. */
export interface Environment {
  glowColor: string;
  glowIntensity: number;
  horizonColor: string;
}

/** A slide with its product references resolved, ready to render. */
export interface ResolvedSlide {
  id: string;
  featured: Product;
  stage: Array<StagedProduct & { product: Product }>;
  environment: Environment;
}

export interface ResolvedCollection {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  transition: TransitionStyle;
  slides: ResolvedSlide[];
}
