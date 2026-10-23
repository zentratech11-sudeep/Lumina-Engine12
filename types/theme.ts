import type { z } from "zod";
import type { themeSchema } from "@/lib/validation";

export type Theme = z.infer<typeof themeSchema>;
