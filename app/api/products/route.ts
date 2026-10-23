import { json } from "@/lib/api";
import { getBrand } from "@/lib/brand";

export const dynamic = "force-static";

/** GET /api/products — every product of the active brand. */
export function GET() {
  return json(getBrand().products);
}
