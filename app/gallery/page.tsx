import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBrand } from "@/lib/brand";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  const bundle = getBrand();
  const page = bundle.content.pages.gallery;
  return buildMetadata(bundle, { title: page.title, description: page.intro, path: "/gallery" });
}

export default function GalleryPage() {
  const bundle = getBrand();
  const page = bundle.content.pages.gallery;
  return (
    <>
      <PageHeader title={page.title} intro={page.intro} />
      <Container className="pb-32">
        {bundle.gallery.length > 0 ? (
          <GalleryGrid items={bundle.gallery} />
        ) : (
          <EmptyState action={{ label: "See the collection", href: "/exclusive" }}>New photography is on its way.</EmptyState>
        )}
      </Container>
    </>
  );
}
