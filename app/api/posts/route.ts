import { json } from "@/lib/api";
import { getBrand } from "@/lib/brand";

export const dynamic = "force-static";

/** GET /api/posts — journal posts, newest first, without their full bodies. */
export function GET() {
  const posts = [...getBrand().posts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ slug, title, excerpt, date, author, cover }) => ({ slug, title, excerpt, date, author, cover }));
  return json(posts);
}
