import { ProductGrid } from "@/components/products/ProductGrid";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBrand } from "@/lib/brand";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  const bundle = getBrand();
  const page = bundle.content.pages.products;
  return buildMetadata(bundle, { title: page.title, description: page.intro, path: "/products" });
}

export default function ProductsPage() {
  const bundle = getBrand();
  const page = bundle.content.pages.products;
  return (
    <>
      <PageHeader title={page.title} intro={page.intro} />
      <Container className="pb-32">
        <ProductGrid products={bundle.products} />
      </Container>
    </>
  );
}
