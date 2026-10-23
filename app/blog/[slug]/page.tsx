import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/blog/PostBody";
import { PostCard, postTexts } from "@/components/blog/PostCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { SafeImage } from "@/components/ui/SafeImage";
import { getBrand, getPostBySlug, sortedPosts } from "@/lib/brand";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { formatDate, readingMinutes } from "@/lib/utils";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}


export function generateStaticParams() {
  return getBrand().posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  const bundle = getBrand();
  const post = getPostBySlug(bundle, slug);
  if (!post) return {};
  return buildMetadata(bundle, { title: post.title, description: post.excerpt, path: `/blog/${post.slug}`, image: post.cover?.src });
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const bundle = getBrand();
  const post = getPostBySlug(bundle, slug);
  if (!post) notFound();
  const journal = bundle.content.pages.blog.title;
  const more = sortedPosts(bundle)
    .filter((other) => other.slug !== post.slug)
    .slice(0, 2);

  return (
    <article>
      <Container className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-[760px]">
          <Link href="/blog" className="text-sm text-muted-text transition-colors hover:text-text">
            ← {journal}
          </Link>
          <p className="mt-8 text-sm text-muted-text">
            <time dateTime={post.date}>{formatDate(post.date)}</time> · {readingMinutes(postTexts(post))} min read · {post.author}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,5.5vw,4.5rem)] font-light leading-[1.04] text-text">{post.title}</h1>
          <p className="mt-6 text-xl leading-relaxed text-muted-text">{post.excerpt}</p>
        </div>
      </Container>

      {post.cover && (
        <Container className="mt-14">
          <div className="product-frame relative mx-auto aspect-[16/9] max-w-[1100px] overflow-hidden">
            <SafeImage src={post.cover.src} alt={post.cover.alt} fill priority sizes="(min-width: 1100px) 1100px, 100vw" className="object-cover" />
          </div>
        </Container>
      )}

      <Container className="py-16 lg:py-24">
        <div className="mx-auto max-w-[720px]">
          <PostBody blocks={post.body} />
        </div>
      </Container>

      {more.length > 0 && (
        <section aria-labelledby="more-heading" className="border-t border-border/70 py-24">
          <Container>
            <h2 id="more-heading" className="mb-12 font-display text-[clamp(1.9rem,3vw,2.75rem)] font-light text-text">
              More from the {journal.toLowerCase()}
            </h2>
            <ul className="grid gap-x-10 gap-y-16 md:grid-cols-2">
              {more.map((other) => (
                <li key={other.slug}>
                  <PostCard post={other} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <JsonLd data={articleJsonLd(bundle, post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: journal, path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
    </article>
  );
}
