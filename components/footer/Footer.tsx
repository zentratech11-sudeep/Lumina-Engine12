import Link from "next/link";
import type { Brand, BrandContent, NavItem } from "@/types/brand";

interface FooterProps {
  brand: Pick<Brand, "name" | "tagline" | "contact" | "social">;
  items: NavItem[];
  content: BrandContent["footer"];
}

export function Footer({ brand, items, content }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] lg:px-12">
        <div className="max-w-sm">
          <p className="font-display text-2xl tracking-[0.14em] text-text">{brand.name}</p>
          <p className="mt-3 font-display text-lg italic text-muted-text">{brand.tagline}</p>
          <p className="mt-6 text-sm leading-relaxed text-muted-text">{content.note}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted-text transition-colors hover:text-text">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3 text-sm">
          {brand.contact.email && (
            <a href={`mailto:${brand.contact.email}`} className="block text-text underline-offset-4 hover:underline">
              {brand.contact.email}
            </a>
          )}
          {brand.contact.phone && <p className="text-muted-text">{brand.contact.phone}</p>}
          {brand.contact.address && <p className="text-muted-text">{brand.contact.address}</p>}
          {brand.social.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-3">
              {brand.social.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-text transition-colors hover:text-text">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-border/50">
        <p className="mx-auto max-w-[1440px] px-5 py-6 text-xs text-muted-text sm:px-8 lg:px-12">
          © {year} {brand.name}
        </p>
      </div>
    </footer>
  );
}
