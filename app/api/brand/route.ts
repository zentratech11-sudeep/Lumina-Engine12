import { json } from "@/lib/api";
import { getBrand } from "@/lib/brand";

export const dynamic = "force-static";

/** GET /api/brand — name, tagline, theme, contact and social links of the active brand. */
export function GET() {
  const { brand, navigation } = getBrand();
  return json({ ...brand, navigation });
}
