import type { z } from "zod";
import type { sceneSchema } from "@/lib/validation";

export type SceneConfig = z.infer<typeof sceneSchema>;
export type Quality = "high" | "low";
