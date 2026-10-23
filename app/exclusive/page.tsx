import Link from "next/link";
import { CollectionShowcase } from "@/components/collection/CollectionShowcase";
import { Container } from "@/components/ui/Container";
import { getBrand, resolveCollections } from "@/lib/brand";
import { buildMetadata } from "@/lib/seo";
import { formatCounter } from "@/lib/utils";

export function generateMetadata() {
  const bundle = getBrand();
  const page = bundle.content.pages.exclusive;
  return buildMetadata(bundle, { title: page.title, description: page.intro, path: "/exclusive" });
}

export default function ExclusivePage() {
  const bundle = getBrand();
  const { brand, scene } = bundle;
  const collections = resolveCollections(bundle);

  return (
    <>
      <CollectionShowcase
        collections={collections}
        scene={scene}
        brandName={brand.name}
        displayFont={brand.typography.display.family}
        nextSectionId="collection-list"
      />
      <div id="collection-list" className="scroll-mt-16">
        {collections.map((collection) => (
          <section key={collection.id} aria-labelledby={`${collection.id}-heading`} className="border-t border-border/70 py-24 lg:py-32">
            <Container>
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <h2 id={`${collection.id}-heading`} className="font-display text-[clamp(2rem,3.6vw,3.25rem)] font-light text-text">
                    {collection.title}
                  </h2>
                  {collection.subtitle && <p className="mt-2 font-display text-xl italic text-muted-text">{collection.subtitle}</p>}
                </div>
                {collection.description && (
                  <p className="max-w-[52ch] text-lg leading-relaxed text-muted-text lg:col-span-6 lg:col-start-7">{collection.description}</p>
                )}
              </div>
              <ol className="mt-14 border-t border-border/70">
                {collection.slides.map((slide, i) => (
                  <li key={slide.id} className="grid gap-3 border-b border-border/70 py-8 sm:grid-cols-[5rem_1fr_1.2fr] sm:gap-8">
                    <span className="font-ui text-xs tracking-[0.3em] text-muted-text tabular-nums sm:pt-2">
                      {formatCounter(i, collection.slides.length).current}
                    </span>
                    <div>
                      <h3 className="font-display text-[1.8rem] leading-tight text-text">
                        <Link href={`/products/${slide.featured.slug}`} className="text-link no-underline hover:underline">
                          {slide.featured.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-muted-text">{slide.featured.category}</p>
                    </div>
                    <p className="max-w-[52ch] leading-relaxed text-muted-text sm:pt-2">{slide.featured.description}</p>
                  </li>
                ))}
              </ol>
            </Container>
          </section>
        ))}
      </div>
    </>
  );
}
