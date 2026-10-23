import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Product } from "@/types/product";
import type { Review } from "@/types/content";
import { StarRating } from "./StarRating";

interface ReviewCardProps {
  review: Review;
  product?: Pick<Product, "name" | "slug">;
  sampleLabel: string;
}

export function ReviewCard({ review, product, sampleLabel }: ReviewCardProps) {
  return (
    <figure className="flex h-full flex-col border-t border-border/70 pt-7">
      <div className="flex items-center justify-between gap-4">
        <StarRating rating={review.rating} />
        {review.sample && (
          <span className="rounded-full border border-border px-2.5 py-0.5 text-[0.68rem] tracking-[0.08em] text-muted-text">{sampleLabel}</span>
        )}
      </div>
      {review.title && <p className="mt-5 font-display text-2xl leading-snug text-text">{review.title}</p>}
      <blockquote className="mt-3 flex-1 text-[1.02rem] leading-relaxed text-muted-text">
        <p>{review.body}</p>
      </blockquote>
      <figcaption className="mt-6 text-sm text-muted-text">
        <span className="text-text">{review.author}</span>
        {product && (
          <>
            {" · "}
            <Link href={`/products/${product.slug}`} className="text-link">
              {product.name}
            </Link>
          </>
        )}
        {" · "}
        <time dateTime={review.date}>{formatDate(review.date)}</time>
      </figcaption>
    </figure>
  );
}
