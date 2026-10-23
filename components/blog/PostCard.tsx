import Link from "next/link";
import { formatDate, readingMinutes } from "@/lib/utils";
import type { BlogPost } from "@/types/content";
import { SafeImage } from "@/components/ui/SafeImage";

export function postTexts(post: BlogPost): string[] {
  return post.body.flatMap((block) => ("text" in block ? [block.text] : []));
}

/** A journal entry in a list. The title link covers the whole card. */
export function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group relative">
      {post.cover && (
        <div className="product-frame relative aspect-[16/10] overflow-hidden">
          <SafeImage
            src={post.cover.src}
            alt={post.cover.alt}
            fill
            sizes="(min-width: 1024px) 45vw, 92vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>
      )}
      <p className="mt-5 text-sm text-muted-text">
        <time dateTime={post.date}>{formatDate(post.date)}</time> · {readingMinutes(postTexts(post))} min read
      </p>
      <h3 className="mt-2 font-display text-[1.9rem] leading-tight text-text">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:underline decoration-text/40 underline-offset-4">
          {post.title}
        </Link>
      </h3>
      <p className="mt-3 max-w-[52ch] leading-relaxed text-muted-text">{post.excerpt}</p>
    </article>
  );
}
