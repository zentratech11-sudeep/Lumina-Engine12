import { json } from "@/lib/api";
import { getBrand } from "@/lib/brand";

export const dynamic = "force-static";

/** GET /api/collections — collections with their slides and staging. */
export function GET() {
  return json(getBrand().collections);
}
