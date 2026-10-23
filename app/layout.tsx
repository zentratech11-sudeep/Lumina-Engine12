import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { preload } from "react-dom";
import { Footer } from "@/components/footer/Footer";
import { Navbar } from "@/components/navigation/Navbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { getBrand } from "@/lib/brand";
import { buildMetadata, organizationJsonLd, siteUrl } from "@/lib/seo";
import { primaryFontFiles, themeToCssVariables, typographyToCss } from "@/lib/theme";
import "./globals.css";

export function generateMetadata(): Metadata {
  const bundle = getBrand();
  return {
    metadataBase: new URL(siteUrl()),
    ...buildMetadata(bundle, { path: "/" }),
    applicationName: bundle.brand.name,
  };
}

export function generateViewport(): Viewport {
  const { theme } = getBrand().brand;
  return { themeColor: theme.background, colorScheme: "dark" };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const bundle = getBrand();
  const { brand, navigation, content, products } = bundle;
  const cart = brand.features.cart
    ? {
        labels: content.cart,
        products: products.map(({ slug, name, category, image, price, currency }) => ({ slug, name, category, image, price, currency })),
      }
    : undefined;

  for (const href of primaryFontFiles(brand.typography)) {
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }

  return (
    <html lang="en" style={themeToCssVariables(brand.theme) as CSSProperties}>
      <body>
        <style href={`brand-typography-${brand.slug}`} precedence="high">
          {typographyToCss(brand.typography)}
        </style>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SmoothScroll />
        <Navbar brand={brand} items={navigation} cart={cart} />
        <main id="main">{children}</main>
        <Footer brand={brand} items={navigation} content={content.footer} />
        <JsonLd data={organizationJsonLd(bundle)} />
      </body>
    </html>
  );
}
