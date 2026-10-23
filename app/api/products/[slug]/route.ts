import { json, notFound } from "@/lib/api";
import { getBrand, getProductBySlug } from "@/lib/brand";


export function generateStaticParams() {
  return getBrand().products.map((product) => ({ slug: product.slug }));
}

/** GET /api/products/:slug — one product, or 404. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(getBrand(), slug);
  return product ? json(product) : notFound(`No product with slug "${slug}"`);
}
