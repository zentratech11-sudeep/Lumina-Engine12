import { StarIcon } from "@/components/ui/Icons";

/** Five stars with the rating spelled out for screen readers. */
export function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-primary" role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} filled={star <= rounded} width={size} height={size} />
      ))}
    </span>
  );
}
