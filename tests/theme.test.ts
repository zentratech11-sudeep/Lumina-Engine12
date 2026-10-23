import { describe, expect, it } from "vitest";
import { brandRegistry } from "@/brands";
import { parseBrandBundle } from "@/lib/brand";
import { primaryFontFiles, themeToCssVariables, typographyToCss } from "@/lib/theme";

const lumina = parseBrandBundle(brandRegistry.lumina, "lumina").brand;
const solenne = parseBrandBundle(brandRegistry.solenne, "solenne").brand;

describe("themeToCssVariables", () => {
  it("emits one variable per theme color", () => {
    const vars = themeToCssVariables(lumina.theme);
    expect(Object.keys(vars)).toHaveLength(10);
    expect(vars["--brand-muted-text"]).toBe(lumina.theme.mutedText);
  });

  it("changes with the brand", () => {
    expect(themeToCssVariables(solenne.theme)["--brand-background"]).not.toBe(
      themeToCssVariables(lumina.theme)["--brand-background"],
    );
  });
});

describe("typographyToCss", () => {
  it("declares every font file and the family variables", () => {
    const css = typographyToCss(lumina.typography);
    const fileCount = lumina.typography.display.files.length + lumina.typography.ui.files.length;
    expect(css.match(/@font-face/g)).toHaveLength(fileCount);
    expect(css).toContain(`--brand-font-display:"${lumina.typography.display.family}"`);
  });

  it("preloads one regular file per family", () => {
    expect(primaryFontFiles(lumina.typography)).toEqual([
      "/fonts/cormorant-garamond-latin-400-normal.woff2",
      "/fonts/jost-latin-400-normal.woff2",
    ]);
  });
});
