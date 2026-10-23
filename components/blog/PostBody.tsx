import type { BlogBlock } from "@/types/content";
import { SafeImage } from "@/components/ui/SafeImage";

/** Renders a post's content blocks. Plain data, so a CMS can produce the same shape later. */
export function PostBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-7">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={i} className="pt-6 font-display text-[clamp(1.6rem,2.6vw,2.2rem)] font-light text-text">
                {block.text}
              </h2>
            );
          case "quote":
            return (
              <figure key={i} className="border-l border-primary/50 py-1 pl-6">
                <blockquote className="font-display text-[1.6rem] italic leading-snug text-text">{block.text}</blockquote>
                {block.cite && <figcaption className="mt-3 text-sm text-muted-text">{block.cite}</figcaption>}
              </figure>
            );
          case "image":
            return (
              <figure key={i} className="py-4">
                <div className="product-frame relative overflow-hidden" style={{ aspectRatio: `${block.width} / ${block.height}` }}>
                  <SafeImage src={block.src} alt={block.alt} fill sizes="(min-width: 768px) 720px, 92vw" className="object-cover" />
                </div>
                {block.caption && <figcaption className="mt-3 text-sm text-muted-text">{block.caption}</figcaption>}
              </figure>
            );
          case "paragraph":
          default:
            return (
              <p key={i} className="text-[1.15rem] leading-[1.75] text-text/85">
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}
