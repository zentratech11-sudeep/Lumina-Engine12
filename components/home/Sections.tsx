import Link from "next/link";
import { averageRating } from "@/lib/brand";
import type { BrandBundle } from "@/types/brand";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { ProductCard } from "@/components/products/ProductCard";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewsSummary } from "@/components/reviews/ReviewsSummary";
import { Container } from "@/components/ui/Container";

/** Home page sections (PRD §6). Each reads its own slice of the brand bundle. */

interface SectionProps {
  id: string;
  bundle: BrandBundle;
}

export function IntroSection({ id, bundle }: SectionProps) {
  const { intro } = bundle.content.home;
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-16 py-28 lg:py-40">
      <Container className="grid gap-10 lg:grid-cols-12">
        <h2 id={`${id}-heading`} className="font-display text-[clamp(2.2rem,4.6vw,4.25rem)] font-light leading-[1.05] text-text lg:col-span-8">
          {intro.heading}
        </h2>
        <p className="max-w-[46ch] text-lg leading-relaxed text-muted-text lg:col-span-5 lg:col-start-8">{intro.body}</p>
      </Container>
    </section>
  );
}

export function FeaturedSection({ id, bundle }: SectionProps) {
  const featured = bundle.products.filter((product) => product.featured).slice(0, 3);
  if (featured.length === 0) return null;
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-16 pb-28 lg:pb-40">
      <Container>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 id={`${id}-heading`} className="font-display text-[clamp(1.9rem,3vw,2.75rem)] font-light text-text">
            {bundle.content.home.featured.heading}
          </h2>
          <Link href="/products" className="pill-button">
            All products
          </Link>
        </div>
        <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function StorySection({ id, bundle }: SectionProps) {
  const { story } = bundle.content.home;
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-16 border-t border-border/70 py-28 lg:py-40">
      <Container className="grid gap-10 lg:grid-cols-12">
        <h2 id={`${id}-heading`} className="font-display text-[clamp(2rem,3.6vw,3.25rem)] font-light leading-tight text-text lg:col-span-4">
          {story.heading}
        </h2>
        <div className="space-y-6 lg:col-span-6 lg:col-start-6">
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-[58ch] font-display text-[1.35rem] leading-[1.55] text-text/85">
              {paragraph}
            </p>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function GallerySection({ id, bundle }: SectionProps) {
  const { gallery } = bundle.content.home;
  const items = bundle.gallery.slice(0, gallery.limit);
  if (items.length === 0) return null;
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-16 border-t border-border/70 py-28 lg:py-36">
      <Container>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 id={`${id}-heading`} className="font-display text-[clamp(1.9rem,3vw,2.75rem)] font-light text-text">
            {gallery.heading}
          </h2>
          <Link href="/gallery" className="pill-button">
            Full gallery
          </Link>
        </div>
        <GalleryGrid items={items} />
      </Container>
    </section>
  );
}

export function ReviewsSection({ id, bundle }: SectionProps) {
  const { reviews: config } = bundle.content.home;
  const reviews = bundle.reviews.slice(0, config.limit);
  const average = averageRating(bundle.reviews);
  if (reviews.length === 0 || average === null) return null;
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-16 border-t border-border/70 py-28 lg:py-36">
      <Container>
        <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
          <div>
            <h2 id={`${id}-heading`} className="mb-6 font-display text-[clamp(1.9rem,3vw,2.75rem)] font-light text-text">
              {config.heading}
            </h2>
            <ReviewsSummary average={average} count={bundle.reviews.length} label={bundle.content.reviewsPage.averageLabel} />
          </div>
          <Link href="/reviews" className="pill-button">
            All reviews
          </Link>
        </div>
        <ul className="grid gap-x-10 gap-y-12 md:grid-cols-3">
          {reviews.map((review) => {
            const product = bundle.products.find((p) => p.id === review.productId);
            return (
              <li key={review.id}>
                <ReviewCard review={review} product={product} sampleLabel={bundle.content.reviewsPage.sampleLabel} />
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

export function CtaSection({ id, bundle }: SectionProps) {
  const { cta } = bundle.content.home;
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="relative scroll-mt-16 overflow-hidden border-t border-border/70 py-28 text-center lg:py-36">
      <div aria-hidden="true" className="cta-glow pointer-events-none absolute inset-0" />
      <Container className="relative flex flex-col items-center">
        <h2 id={`${id}-heading`} className="font-display text-[clamp(2.2rem,4vw,3.75rem)] font-light text-text">
          {cta.heading}
        </h2>
        <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-muted-text">{cta.body}</p>
        <Link href={cta.action.href} className="pill-button mt-10">
          {cta.action.label}
        </Link>
      </Container>
    </section>
  );
}
