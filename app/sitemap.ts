import type { MetadataRoute } from "next";
import { getBrand } from "@/lib/brand";
import { siteUrl } from "@/lib/seo";

const routes = ["", "/about", "/products", "/exclusive", "/gallery", "/reviews", "/blog", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const pages = routes.map((route) => ({
    url: `${base}${route}`,
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.7,
  }));
  const products = getBrand().products.map((product) => ({
    url: `${base}/products/${product.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  const posts = getBrand().posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
  return [...pages, ...products, ...posts];
}
