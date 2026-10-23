import type { Brand } from "@/types/brand";
import type { Theme } from "@/types/theme";

const themeKeys = [
  "primary",
  "secondary",
  "accent",
  "background",
  "surface",
  "text",
  "mutedText",
  "border",
  "glow",
  "error",
] as const satisfies ReadonlyArray<keyof Theme>;

const kebab = (value: string) => value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

/** Brand colors as CSS custom properties, e.g. { "--brand-muted-text": "#9aa6aa" }. */
export function themeToCssVariables(theme: Theme): Record<string, string> {
  return Object.fromEntries(themeKeys.map((key) => [`--brand-${kebab(key)}`, theme[key]]));
}

/**
 * @font-face rules plus the font-family variables components use.
 * Inputs are validated (family names and paths are restricted to safe characters).
 */
export function typographyToCss(typography: Brand["typography"]): string {
  const faces = [typography.display, typography.ui].flatMap((font) =>
    font.files.map(
      (file) =>
        `@font-face{font-family:"${font.family}";src:url("${file.src}") format("woff2");font-weight:${file.weight};font-style:${file.style};font-display:swap;}`,
    ),
  );
  const unique = Array.from(new Set(faces));
  const variables = `:root{--brand-font-display:"${typography.display.family}",${typography.display.fallback};--brand-font-ui:"${typography.ui.family}",${typography.ui.fallback};}`;
  return [...unique, variables].join("\n");
}

/** The regular-weight file of each family, preloaded so the first paint uses brand fonts. */
export function primaryFontFiles(typography: Brand["typography"]): string[] {
  return [typography.display, typography.ui]
    .map((font) => (font.files.find((f) => f.weight === 400 && f.style === "normal") ?? font.files[0])?.src)
    .filter((src): src is string => Boolean(src));
}
