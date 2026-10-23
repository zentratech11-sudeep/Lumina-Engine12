import { z } from "zod";
import { brandRegistry, defaultBrandKey, type BrandKey } from "@/brands";
import { brandBundleSchema } from "./validation";
import type { BrandBundle } from "@/types/brand";
import type { Collection, Environment, EnvironmentOverride, ResolvedCollection, ResolvedSlide } from "@/types/collection";
import type { BlogPost, Review } from "@/types/content";
import type { Product } from "@/types/product";

export function isBrandKey(value: string): value is BrandKey {
  return Object.hasOwn(brandRegistry, value);
}

/** Reads NEXT_PUBLIC_BRAND. An unknown key fails loudly so a typo never ships the wrong brand. */
export function resolveBrandKey(value: string | undefined = process.env.NEXT_PUBLIC_BRAND): BrandKey {
  if (!value) return defaultBrandKey;
  if (!isBrandKey(value)) {
    const known = Object.keys(brandRegistry).join(", ");
    throw new Error(`NEXT_PUBLIC_BRAND="${value}" is not a registered brand. Known brands: ${known}.`);
  }
  return value;
}

/** Validates raw brand data. Throws with a readable list of every problem found. */
export function parseBrandBundle(raw: unknown, label = "brand"): BrandBundle {
  const result = brandBundleSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid data in /brands/${label}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

let cached: BrandBundle | undefined;

/** The active brand, validated once per server process. Call from server components only. */
export function getBrand(): BrandBundle {
  if (!cached) {
    const key = resolveBrandKey();
    cached = parseBrandBundle(brandRegistry[key], key);
    const samples = cached.reviews.filter((review) => review.sample).length;
    if (samples > 0 && process.env.NODE_ENV === "production") {
      console.warn(`[${key}] ${samples} sample review(s) are still in reviews.json. Replace them with real reviews before launch.`);
    }
  }
  return cached;
}

export function getProductById(bundle: BrandBundle, id: string): Product | undefined {
  return bundle.products.find((product) => product.id === id);
}

export function getProductBySlug(bundle: BrandBundle, slug: string): Product | undefined {
  return bundle.products.find((product) => product.slug === slug);
}

/** Up to `limit` other products, same category first, then in catalog order. */
export function getRelatedProducts(bundle: BrandBundle, product: Product, limit = 3): Product[] {
  const others = bundle.products.filter((p) => p.id !== product.id);
  const sameCategory = others.filter((p) => p.category === product.category);
  const rest = others.filter((p) => p.category !== product.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

/** The first collection that puts this product on stage, if any. */
export function findCollectionFor(bundle: BrandBundle, productId: string): Collection | undefined {
  return bundle.collections.find((collection) =>
    collection.slides.some((slide) => slide.stage.some((staged) => staged.productId === productId)),
  );
}

export function getCollection(bundle: BrandBundle, id?: string): Collection {
  const collection = id ? bundle.collections.find((c) => c.id === id) : bundle.collections[0];
  if (!collection) throw new Error(`Collection "${id}" not found`);
  return collection;
}

/** Layers environment overrides: brand scene, then collection, then slide. */
export function resolveEnvironment(bundle: BrandBundle, ...overrides: Array<EnvironmentOverride | undefined>): Environment {
  const base: Environment = {
    glowColor: bundle.scene.glow.color,
    glowIntensity: bundle.scene.glow.intensity,
    horizonColor: bundle.scene.sky.horizon,
  };
  return overrides.reduce<Environment>(
    (env, override) => ({
      glowColor: override?.glowColor ?? env.glowColor,
      glowIntensity: override?.glowIntensity ?? env.glowIntensity,
      horizonColor: override?.horizonColor ?? env.horizonColor,
    }),
    base,
  );
}

/** Every collection with products, slides and environments resolved, in brand order. */
export function resolveCollections(bundle: BrandBundle): ResolvedCollection[] {
  return bundle.collections.map((collection) => ({
    id: collection.id,
    title: collection.title,
    subtitle: collection.subtitle,
    description: collection.description,
    transition: collection.transition,
    slides: resolveSlides(bundle, collection),
  }));
}

/** Joins product records onto a collection's slides. Validation guarantees every id exists. */
export function resolveSlides(bundle: BrandBundle, collection: Collection): ResolvedSlide[] {
  const byId = new Map(bundle.products.map((product) => [product.id, product]));
  const lookup = (id: string): Product => {
    const product = byId.get(id);
    if (!product) throw new Error(`Unknown product "${id}"`);
    return product;
  };
  return collection.slides.map((slide) => ({
    id: slide.id,
    featured: lookup(slide.featuredProductId),
    stage: slide.stage.map((staged) => ({ ...staged, product: lookup(staged.productId) })),
    environment: resolveEnvironment(bundle, collection.environment, slide.environment),
  }));
}

export function getPostBySlug(bundle: BrandBundle, slug: string): BlogPost | undefined {
  return bundle.posts.find((post) => post.slug === slug);
}

/** Posts newest first. */
export function sortedPosts(bundle: BrandBundle): BlogPost[] {
  return [...bundle.posts].sort((a, b) => b.date.localeCompare(a.date));
}

export function reviewsForProduct(bundle: BrandBundle, productId: string): Review[] {
  return bundle.reviews.filter((review) => review.productId === productId);
}

/** Mean rating rounded to one decimal, or null when there are no reviews. */
export function averageRating(reviews: Review[]): number | null {
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}
