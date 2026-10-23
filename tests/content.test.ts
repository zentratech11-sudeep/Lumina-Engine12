import { describe, expect, it } from "vitest";
import { brandRegistry } from "@/brands";
import { averageRating, parseBrandBundle, resolveCollections, resolveEnvironment, sortedPosts } from "@/lib/brand";
import { readingMinutes } from "@/lib/utils";

const lumina = parseBrandBundle(brandRegistry.lumina, "lumina");

describe("collections", () => {
  it("supports any number of collections (PRD §11)", () => {
    const collections = resolveCollections(lumina);
    expect(collections.length).toBe(lumina.collections.length);
    expect(collections.length).toBeGreaterThan(1);
    collections.forEach((collection) => expect(collection.slides.length).toBeGreaterThan(0));
  });

  it("layers slide environment over collection over scene defaults", () => {
    const base = resolveEnvironment(lumina);
    expect(base.glowColor).toBe(lumina.scene.glow.color);
    const tinted = resolveEnvironment(lumina, { glowColor: "#ff0000" }, { glowIntensity: 2 });
    expect(tinted).toMatchObject({ glowColor: "#ff0000", glowIntensity: 2, horizonColor: base.horizonColor });
  });
});

describe("journal and reviews", () => {
  it("lists posts newest first", () => {
    const dates = sortedPosts(lumina).map((post) => post.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("averages ratings to one decimal", () => {
    expect(averageRating([])).toBeNull();
    const reviews = lumina.reviews.slice(0, 2);
    const expected = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    expect(averageRating(reviews)).toBeCloseTo(expected, 1);
  });

  it("estimates reading time", () => {
    expect(readingMinutes(["word ".repeat(450)])).toBe(2);
  });
});
