import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToBagButton } from "@/components/commerce/AddToBagButton";
import { ProductCard } from "@/components/products/ProductCard";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewsSummary } from "@/components/reviews/ReviewsSummary";
import { JsonLd } from "@/components/seo/JsonLd";
import { SafeImage } from "@/components/ui/SafeImage";
import { Container } from "@/components/ui/Container";
import { averageRating, findCollectionFor, getBrand, getProductBySlug, getRelatedProducts, reviewsForProduct } from "@/lib/brand";
import { breadcrumbJsonLd, buildMetadata, productJsonLd } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/** Every product page is generated at build time; unknown slugs render the 404 page. */

export function generateStaticParams() {
  return getBrand().products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const bundle = getBrand();
  const product = getProductBySlug(bundle, slug);
  if (!product) return {};
  return buildMetadata(bundle, {
    title: product.name,
    description: product.description,
    path: `/products/${product.slug}`,
    image: product.image,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const bundle = getBrand();
  const product = getProductBySlug(bundle, slug);
  if (!product) notFound();

  const { content, brand } = bundle;
  const reviews = reviewsForProduct(bundle, product.id);
  const average = averageRating(reviews);
  const related = getRelatedProducts(bundle, product);
  const collection = findCollectionFor(bundle, product.id);
  const productsTitle = content.pages.products.title;

  return (
    <>
      <Container className="pt-28 lg:pt-32">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-text">
            <li>
              <Link href="/products" className="transition-colors hover:text-text">
                {productsTitle}
              </Link>
            </li>
            <li aria-hidden="true" className="opacity-50">
              /
            </li>
            <li aria-current="page" className="text-text">
              {product.name}
            </li>
          </ol>
        </nav>
      </Container>

      <Container className="grid gap-12 pt-8 pb-28 lg:grid-cols-12 lg:gap-8 lg:pb-36">
        <div className="lg:col-span-7">
          <div className="product-frame relative aspect-[4/5] overflow-hidden">
            {product.image ? (
              <SafeImage
                src={product.image}
                alt={product.imageAlt ?? product.name}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-display text-8xl text-muted-text/40" aria-hidden="true">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center lg:col-span-4 lg:col-start-9">
          <p className="text-sm tracking-[0.04em] text-muted-text">{product.category}</p>
          <h1 className="mt-3 font-display text-[clamp(2.6rem,5vw,4.25rem)] font-light leading-[1.02] text-text">
            {product.name}
          </h1>
          {product.price !== undefined && product.currency && (
            <p className="mt-5 text-xl text-text">{formatPrice(product.price, product.currency)}</p>
          )}
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-muted-text">{product.description}</p>

          {product.details.length > 0 && (
            <dl className="mt-10 border-t border-border/70">
              {product.details.map((detail) => (
                <div key={detail.label} className="flex justify-between gap-6 border-b border-border/70 py-4 text-[0.95rem]">
                  <dt className="text-muted-text">{detail.label}</dt>
                  <dd className="text-right text-text">{detail.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-10 flex flex-col items-start gap-6">
            {brand.features.cart && (
              <AddToBagButton slug={product.slug} label={content.cart.addLabel} addedLabel={content.cart.addedLabel} />
            )}
            <Link
              href={`/contact?product=${product.slug}#contact-form`}
              className={brand.features.cart ? "text-link text-[0.95rem]" : "submit-button"}
            >
              {content.productPage.enquiryLabel}
            </Link>
            {collection && (
              <Link href="/exclusive" className="text-link text-[0.95rem]">
                {content.productPage.collectionLabel}
              </Link>
            )}
          </div>
        </div>
      </Container>

      {average !== null && (
        <section aria-labelledby="product-reviews-heading" className="border-t border-border/70 py-24">
          <Container>
            <h2 id="product-reviews-heading" className="sr-only">
              {content.pages.reviews.title}
            </h2>
            <ReviewsSummary average={average} count={reviews.length} label={content.reviewsPage.averageLabel} />
            <ul className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2">
              {reviews.map((review) => (
                <li key={review.id}>
                  <ReviewCard review={review} sampleLabel={content.reviewsPage.sampleLabel} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t border-border/70 py-24 lg:py-32">
          <Container>
            <h2 id="related-heading" className="mb-12 font-display text-[clamp(1.9rem,3vw,2.75rem)] font-light text-text">
              {content.productPage.relatedHeading}
            </h2>
            <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <ProductCard product={item} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <JsonLd data={productJsonLd(bundle, product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: productsTitle, path: "/products" },
          { name: product.name, path: `/products/${product.slug}` },
        ])}
      />
    </>
  );
}
