import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <li key={product.id}>
          <ProductCard product={product} priority={i < 3} />
        </li>
      ))}
    </ul>
  );
}
