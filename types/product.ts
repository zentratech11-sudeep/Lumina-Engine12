import type { z } from "zod";
import type { placeholderShapes, productSchema } from "@/lib/validation";

export type Product = z.infer<typeof productSchema>;
export type PlaceholderShape = (typeof placeholderShapes)[number];
