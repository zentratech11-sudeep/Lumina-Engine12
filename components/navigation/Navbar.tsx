"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { isActivePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { Brand, BrandContent, NavItem } from "@/types/brand";
import { CartButton } from "@/components/commerce/CartButton";
import { CartDrawer, type CartProduct } from "@/components/commerce/CartDrawer";
import { MenuIcon } from "@/components/ui/Icons";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { SoundToggle } from "./SoundToggle";

interface NavbarProps {
  brand: Pick<Brand, "name" | "tagline" | "logo" | "features" | "audio">;
  items: NavItem[];
  /** Present when the brand has the bag turned on (`features.cart`). */
  cart?: { labels: BrandContent["cart"]; products: CartProduct[] };
}

/** Transparent over the hero; gains a backdrop once the page scrolls. */
export function Navbar({ brand, items, cart }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sound = brand.features.sound && brand.audio ? brand.audio : null;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter,border-color] duration-500",
        scrolled ? "border-b border-border/60 bg-background/70 backdrop-blur-md" : "border-b border-transparent",
      )}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:h-[4.5rem] lg:px-12">
        <Logo logo={brand.logo} name={brand.name} />

        <ul className="hidden items-center gap-8 lg:flex">
          {items.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("nav-link", active && "is-active")}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1">
          {sound && <SoundToggle src={sound.ambient} volume={sound.volume} />}
          {cart && <CartButton label={cart.labels.title} />}
          <button
            type="button"
            className="icon-button lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {cart && <CartDrawer labels={cart.labels} products={cart.products} />}
      <MobileMenu open={menuOpen} onClose={closeMenu} items={items} pathname={pathname} brand={brand} />
    </header>
  );
}
