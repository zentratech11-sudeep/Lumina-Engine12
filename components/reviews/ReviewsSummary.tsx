import { StarRating } from "./StarRating";

export function ReviewsSummary({ average, count, label }: { average: number; count: number; label: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <p className="font-display text-5xl font-light text-text">{average.toFixed(1)}</p>
      <div>
        <StarRating rating={average} size={18} />
        <p className="mt-1 text-sm text-muted-text">
          {label} · {count} {count === 1 ? "review" : "reviews"}
        </p>
      </div>
    </div>
  );
}
