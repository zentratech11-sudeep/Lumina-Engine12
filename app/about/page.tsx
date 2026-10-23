import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBrand } from "@/lib/brand";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  const bundle = getBrand();
  const page = bundle.content.pages.about;
  return buildMetadata(bundle, { title: page.title, description: page.intro, path: "/about" });
}

export default function AboutPage() {
  const { brand, content } = getBrand();
  const page = content.pages.about;
  const story = content.home.story;
  return (
    <>
      <PageHeader title={page.title} intro={page.intro} />
      <Container className="grid gap-10 border-t border-border/70 py-20 pb-32 lg:grid-cols-12">
        <p className="font-display text-[clamp(1.6rem,2.6vw,2.25rem)] font-light leading-snug text-text lg:col-span-5">
          {brand.description}
        </p>
        <div className="space-y-6 lg:col-span-6 lg:col-start-7">
          <h2 className="font-display text-2xl text-text">{story.heading}</h2>
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-[58ch] text-lg leading-relaxed text-muted-text">
              {paragraph}
            </p>
          ))}
        </div>
      </Container>
    </>
  );
}
