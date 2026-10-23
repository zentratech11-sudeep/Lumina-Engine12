import { describe, expect, it } from "vitest";
import { isActivePath } from "@/lib/navigation";
import { cn, formatCounter, travelDirection, wrapIndex } from "@/lib/utils";

describe("wrapIndex", () => {
  it("keeps in-range values", () => expect(wrapIndex(3, 6)).toBe(3));
  it("wraps past the end", () => expect(wrapIndex(6, 6)).toBe(0));
  it("wraps before the start", () => expect(wrapIndex(-1, 6)).toBe(5));
  it("handles large jumps", () => expect(wrapIndex(-13, 6)).toBe(5));
  it("returns 0 for an empty collection", () => expect(wrapIndex(4, 0)).toBe(0));
});

describe("formatCounter", () => {
  it("pads to two digits", () => expect(formatCounter(0, 6)).toEqual({ current: "01", total: "06" }));
  it("grows for long collections", () => expect(formatCounter(4, 120)).toEqual({ current: "005", total: "120" }));
});

describe("travelDirection", () => {
  it("moves forward to the next slide", () => expect(travelDirection(0, 1, 6)).toBe(1));
  it("moves back to the previous slide", () => expect(travelDirection(2, 1, 6)).toBe(-1));
  it("takes the short way around the loop", () => expect(travelDirection(5, 0, 6)).toBe(1));
  it("takes the short way backwards", () => expect(travelDirection(0, 5, 6)).toBe(-1));
});

describe("isActivePath", () => {
  it("matches home only exactly", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/about", "/")).toBe(false);
  });
  it("matches nested routes", () => expect(isActivePath("/products/luxe", "/products")).toBe(true));
  it("does not match lookalike prefixes", () => expect(isActivePath("/productsale", "/products")).toBe(false));
});

describe("cn", () => {
  it("drops falsy values", () => expect(cn("a", false, null, undefined, "b")).toBe("a b"));
});
