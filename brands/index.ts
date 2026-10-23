import lumina from "./lumina";
import solenne from "./solenne";

/**
 * Every brand the engine can build. Add a folder under /brands, import it
 * here, and select it with NEXT_PUBLIC_BRAND=<key>.
 */
export const brandRegistry = {
  lumina,
  solenne,
} as const;

export type BrandKey = keyof typeof brandRegistry;
export const defaultBrandKey: BrandKey = "lumina";
