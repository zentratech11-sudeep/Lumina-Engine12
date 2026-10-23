"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { duration, ease } from "@/config/motion";
import { useDialog } from "@/hooks/useDialog";
import { cn } from "@/lib/utils";
import type { Brand, NavItem } from "@/types/brand";
import { CloseIcon } from "@/components/ui/Icons";
import { isActivePath } from "@/lib/navigation";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  pathname: string;
  brand: Pick<Brand, "name" | "tagline">;
}

/** Full-screen menu below the desktop breakpoint (PRD §9). Traps focus and closes on Escape or navigation. */
export function MobileMenu({ open, onClose, items, pathname, brand }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Close when the route changes (a link was followed).
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  useDialog(open, onClose, panelRef);

  const fade = reduceMotion ? 0 : duration.normal;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fade, ease: ease.outCurve }}
        >
          <div className="flex h-16 items-center justify-between px-5 sm:px-8">
            <span className="font-display text-[1.35rem] tracking-[0.14em] text-text">{brand.name}</span>
            <button type="button" className="icon-button" aria-label="Close menu" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>

          <ul className="flex flex-1 flex-col justify-center gap-1 px-8 sm:px-14">
            {items.map((item, i) => {
              const active = isActivePath(pathname, item.href);
              return (
                <motion.li
                  key={item.href}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: duration.slow, delay: reduceMotion ? 0 : 0.05 + i * 0.04, ease: ease.outCurve }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block py-2 font-display text-[clamp(2rem,9vw,3rem)] leading-tight transition-colors",
                      active ? "text-text" : "text-muted-text hover:text-text",
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.li>
              );
            })}
          </ul>

          <p className="px-8 pb-10 text-sm text-muted-text sm:px-14">{brand.tagline}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
