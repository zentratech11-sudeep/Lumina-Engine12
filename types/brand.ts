import type { z } from "zod";
import type { brandBundleSchema, brandSchema, contentSchema, logoSchema, navItemSchema } from "@/lib/validation";

export type Brand = z.infer<typeof brandSchema>;
export type BrandLogo = z.infer<typeof logoSchema>;
export type NavItem = z.infer<typeof navItemSchema>;
export type BrandContent = z.infer<typeof contentSchema>;
/** Everything one brand folder provides, after validation. */
export type BrandBundle = z.infer<typeof brandBundleSchema>;
