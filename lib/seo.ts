import type { Metadata } from "next";
import type { BrandBundle } from "@/types/brand";
import type { BlogPost } from "@/types/content";
import type { Product } from "@/types/product";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

interface PageMetaInput {
  title?: string;
  description?: string;
  path: string;
  /** Overrides the brand's default share image, e.g. with a product photo. */
  image?: string;
}

/** Route metadata derived from the active brand, so a new brand never edits page files for SEO. */
export function buildMetadata(bundle: BrandBundle, { title, description, path, image }: PageMetaInput): Metadata {
  const { seo, name } = bundle.brand;
  const shareImage = image ?? seo.ogImage;
  const fullTitle = title ? seo.titleTemplate.replace("%s", title) : seo.defaultTitle;
  const desc = description ?? seo.description;
  return {
    title: { absolute: fullTitle },
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: name,
      title: fullTitle,
      description: desc,
      url: path,
      images: shareImage ? [{ url: shareImage, ...(image ? {} : { width: 1200, height: 630 }) }] : undefined,
    },
    twitter: {
      card: shareImage ? "summary_large_image" : "summary",
      title: fullTitle,
      description: desc,
    },
  };
}

/** schema.org Organization data for the site-wide JSON-LD block. */
export function organizationJsonLd(bundle: BrandBundle): Record<string, unknown> {
  const { brand } = bundle;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    description: brand.description,
    url: siteUrl(),
    email: brand.contact.email,
    sameAs: brand.social.map((s) => s.href),
  };
}

/** schema.org Product data. Offers are included only when the product has a price. */
export function productJsonLd(bundle: BrandBundle, product: Product): Record<string, unknown> {
  const url = `${siteUrl()}/products/${product.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    url,
    image: product.image ? [`${siteUrl()}${product.image}`] : undefined,
    brand: { "@type": "Brand", name: bundle.brand.name },
    offers:
      product.price !== undefined && product.currency
        ? { "@type": "Offer", price: product.price, priceCurrency: product.currency, url }
        : undefined,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl()}${item.path}`,
    })),
  };
}

export function articleJsonLd(bundle: BrandBundle, post: BlogPost): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: bundle.brand.name },
    image: post.cover ? [`${siteUrl()}${post.cover.src}`] : undefined,
    mainEntityOfPage: `${siteUrl()}/blog/${post.slug}`,
  };
}
