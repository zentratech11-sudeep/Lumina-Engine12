import type { z } from "zod";
import type { blogPostSchema, galleryItemSchema, homeSections, reviewSchema } from "@/lib/validation";

export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type BlogPost = z.infer<typeof blogPostSchema>;
export type BlogBlock = BlogPost["body"][number];
export type HomeSection = (typeof homeSections)[number];
