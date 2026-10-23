import type { ReactNode } from "react";
import { CollectionShowcase } from "@/components/collection/CollectionShowcase";
import { Hero } from "@/components/hero/Hero";
import {
  CtaSection,
  FeaturedSection,
  GallerySection,
  IntroSection,
  ReviewsSection,
  StorySection,
} from "@/components/home/Sections";
import { getBrand, resolveCollections } from "@/lib/brand";
import { buildMetadata } from "@/lib/seo";
import type { HomeSection } from "@/types/content";

export function generateMetadata() {
  return buildMetadata(getBrand(), { path: "/" });
}

const sectionId = (section: HomeSection) => `home-${section}`;

/**
 * The home page is assembled from `content.json → home.sections`, so each
 * brand chooses which sections appear and in what order (PRD §6, §32 level 3).
 * When the hero *is* the collection scene, the separate collection section is skipped.
 */
export default function HomePage() {
  const bundle = getBrand();
  const { brand, content, scene } = bundle;
  const { hero } = content.home;
  const heroIsCollection = hero.media.type === "collection";
  const sections = content.home.sections.filter((section) => !(heroIsCollection && section === "collection"));
  const collections = resolveCollections(bundle);

  const render = (section: HomeSection, index: number): ReactNode => {
    const id = sectionId(section);
    const after = sections[index + 1];
    const nextSectionId = after ? sectionId(after) : undefined;
    const showcase = (headingLevel: "h1" | "h2", next?: string) => (
      <div id={id} key={section}>
        <CollectionShowcase
          collections={collections}
          scene={scene}
          brandName={brand.name}
          displayFont={brand.typography.display.family}
          nextSectionId={next}
          headingLevel={headingLevel}
        />
      </div>
    );

    switch (section) {
      case "hero":
        if (hero.media.type === "collection") return showcase("h1", nextSectionId);
        return (
          <div id={id} key={section}>
            <Hero hero={{ ...hero, media: hero.media }} nextSectionId={nextSectionId} />
          </div>
        );
      case "collection":
        return showcase("h2");
      case "intro":
        return <IntroSection key={section} id={id} bundle={bundle} />;
      case "featured":
        return <FeaturedSection key={section} id={id} bundle={bundle} />;
      case "story":
        return <StorySection key={section} id={id} bundle={bundle} />;
      case "gallery":
        return <GallerySection key={section} id={id} bundle={bundle} />;
      case "reviews":
        return <ReviewsSection key={section} id={id} bundle={bundle} />;
      case "cta":
        return <CtaSection key={section} id={id} bundle={bundle} />;
    }
  };

  return (
    <>
      {!sections.includes("hero") && <h1 className="sr-only">{`${brand.name}, ${brand.tagline}`}</h1>}
      {sections.map(render)}
    </>
  );
}
