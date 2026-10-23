/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { StarRating } from "@/components/reviews/StarRating";
import { lumina } from "./mocks";

describe("Reviews", () => {
  it("spells the rating out for screen readers", () => {
    render(<StarRating rating={4} />);
    expect(screen.getByRole("img", { name: "Rated 4 out of 5" })).toBeInTheDocument();
  });

  it("labels sample reviews so they can't pass for real ones", () => {
    const review = lumina.reviews.find((r) => r.sample)!;
    const product = lumina.products.find((p) => p.id === review.productId);
    render(<ReviewCard review={review} product={product} sampleLabel={lumina.content.reviewsPage.sampleLabel} />);
    expect(screen.getByText(lumina.content.reviewsPage.sampleLabel)).toBeInTheDocument();
  });
});
