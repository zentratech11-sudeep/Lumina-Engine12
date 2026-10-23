import Link from "next/link";
import type { ReactNode } from "react";

/** Shown on sections that have no content yet, pointing visitors somewhere useful. */
export function EmptyState({ children, action }: { children: ReactNode; action?: { label: string; href: string } }) {
  return (
    <div className="border-t border-border/70 py-16">
      <p className="max-w-[52ch] text-lg leading-relaxed text-muted-text">{children}</p>
      {action && (
        <Link href={action.href} className="pill-button mt-8 inline-flex">
          {action.label}
        </Link>
      )}
    </div>
  );
}
