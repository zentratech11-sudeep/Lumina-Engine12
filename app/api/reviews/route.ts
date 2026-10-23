import { json } from "@/lib/api";
import { getBrand } from "@/lib/brand";

export const dynamic = "force-static";

/** GET /api/reviews — reviews, including the `sample` flag so clients can hide placeholders. */
export function GET() {
  return json(getBrand().reviews);
}
