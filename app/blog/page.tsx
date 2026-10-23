import { PostCard } from "@/components/blog/PostCard";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBrand, sortedPosts } from "@/lib/brand";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  const bundle = getBrand();
  const page = bundle.content.pages.blog;
  return buildMetadata(bundle, { title: page.title, description: page.intro, path: "/blog" });
}

export default function BlogPage() {
  const bundle = getBrand();
  const page = bundle.content.pages.blog;
  const posts = sortedPosts(bundle);
  return (
    <>
      <PageHeader title={page.title} intro={page.intro} />
      <Container className="pb-32">
        {posts.length > 0 ? (
          <ul className="grid gap-x-10 gap-y-20 md:grid-cols-2">
            {posts.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState action={{ label: "See the collection", href: "/exclusive" }}>The first journal entry is being written.</EmptyState>
        )}
      </Container>
    </>
  );
}
