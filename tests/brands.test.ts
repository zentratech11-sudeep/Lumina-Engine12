import { describe, expect, it } from "vitest";
import { brandRegistry } from "@/brands";
import { parseBrandBundle, resolveBrandKey, resolveSlides } from "@/lib/brand";

describe("brand data", () => {
  it.each(Object.entries(brandRegistry))("%s passes validation", (key, raw) => {
    const bundle = parseBrandBundle(raw, key);
    expect(bundle.brand.slug).toBe(key);
    expect(bundle.collections.length).toBeGreaterThan(0);
  });

  it.each(Object.entries(brandRegistry))("%s: every slide resolves to real products", (key, raw) => {
    const bundle = parseBrandBundle(raw, key);
    for (const collection of bundle.collections) {
      const slides = resolveSlides(bundle, collection);
      expect(slides).toHaveLength(collection.slides.length);
      for (const slide of slides) {
        expect(slide.stage.some((staged) => staged.productId === slide.featured.id)).toBe(true);
      }
    }
  });

  it("reports unknown product references with their location", () => {
    const raw = structuredClone(brandRegistry.lumina) as { collections: Array<{ slides: Array<{ featuredProductId: string }> }> };
    raw.collections[0]!.slides[0]!.featuredProductId = "does-not-exist";
    expect(() => parseBrandBundle(raw, "lumina")).toThrow(/does-not-exist/);
  });

  it("rejects colors that are not hex values", () => {
    const raw = structuredClone(brandRegistry.lumina) as { brand: { theme: { primary: string } } };
    raw.brand.theme.primary = "silver";
    expect(() => parseBrandBundle(raw, "lumina")).toThrow(/hex color/);
  });

  it("rejects asset paths that could break out of CSS", () => {
    const raw = structuredClone(brandRegistry.lumina) as { brand: { typography: { display: { files: Array<{ src: string }> } } } };
    raw.brand.typography.display.files[0]!.src = '/fonts/a.woff2");}body{display:none';
    expect(() => parseBrandBundle(raw, "lumina")).toThrow(/Asset paths/);
  });
});

describe("resolveBrandKey", () => {
  it("defaults to lumina", () => {
    expect(resolveBrandKey(undefined)).toBe("lumina");
  });

  it("accepts registered brands", () => {
    expect(resolveBrandKey("solenne")).toBe("solenne");
  });

  it("fails loudly on a typo", () => {
    expect(() => resolveBrandKey("lumnia")).toThrow(/not a registered brand/);
  });
});

describe("product helpers", () => {
  const bundle = parseBrandBundle(brandRegistry.lumina, "lumina");

  it("finds products by slug", async () => {
    const { getProductBySlug } = await import("@/lib/brand");
    expect(getProductBySlug(bundle, "noir-absolu")?.name).toBe("Noir Absolu Parfum");
    expect(getProductBySlug(bundle, "missing")).toBeUndefined();
  });

  it("suggests related products from the same category first, never the product itself", async () => {
    const { getRelatedProducts } = await import("@/lib/brand");
    const cream = bundle.products.find((p) => p.id === "luxe-renewal-cream")!;
    const related = getRelatedProducts(bundle, cream);
    expect(related).toHaveLength(3);
    expect(related.map((p) => p.id)).not.toContain(cream.id);
    expect(related[0]!.category).toBe(cream.category);
  });
});
