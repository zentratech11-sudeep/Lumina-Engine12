import Link from "next/link";
import type { Product } from "@/types/product";
import { SafeImage } from "@/components/ui/SafeImage";

/**
 * A product in a listing. The whole card is clickable through the title link
 * (its ::after covers the card), so there is one link per card for screen readers.
 */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="group relative">
      <div className="product-frame relative aspect-[4/5] overflow-hidden">
        {product.image ? (
          <SafeImage
            src={product.image}
            alt={product.imageAlt ?? product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-display text-5xl text-muted-text/40" aria-hidden="true">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-[1.6rem] leading-tight text-text">
          <Link
            href={`/products/${product.slug}`}
            className="decoration-text/40 underline-offset-4 after:absolute after:inset-0 group-hover:underline"
          >
            {product.name}
          </Link>
        </h3>
        <p className="shrink-0 text-sm text-muted-text">{product.category}</p>
      </div>
      <p className="mt-2 max-w-[42ch] text-[0.95rem] leading-relaxed text-muted-text">{product.description}</p>
    </article>
  );
}
