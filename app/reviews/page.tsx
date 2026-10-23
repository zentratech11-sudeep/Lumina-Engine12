import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewsSummary } from "@/components/reviews/ReviewsSummary";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { averageRating, getBrand } from "@/lib/brand";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  const bundle = getBrand();
  const page = bundle.content.pages.reviews;
  return buildMetadata(bundle, { title: page.title, description: page.intro, path: "/reviews" });
}

export default function ReviewsPage() {
  const bundle = getBrand();
  const page = bundle.content.pages.reviews;
  const reviews = [...bundle.reviews].sort((a, b) => b.date.localeCompare(a.date));
  const average = averageRating(reviews);
  return (
    <>
      <PageHeader title={page.title} intro={page.intro} />
      <Container className="pb-32">
        {average === null ? (
          <EmptyState action={{ label: "Get in touch", href: "/contact" }}>Reviews will appear here once customers have shared them.</EmptyState>
        ) : (
          <>
            <div className="border-t border-border/70 py-10">
              <ReviewsSummary average={average} count={reviews.length} label={bundle.content.reviewsPage.averageLabel} />
            </div>
            <ul className="grid gap-x-10 gap-y-14 md:grid-cols-2">
              {reviews.map((review) => (
                <li key={review.id}>
                  <ReviewCard
                    review={review}
                    product={bundle.products.find((p) => p.id === review.productId)}
                    sampleLabel={bundle.content.reviewsPage.sampleLabel}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </Container>
    </>
  );
}
