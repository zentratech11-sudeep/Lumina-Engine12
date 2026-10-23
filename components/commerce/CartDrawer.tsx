"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useRef } from "react";
import { duration, ease } from "@/config/motion";
import { useDialog } from "@/hooks/useDialog";
import { enquiryCheckout } from "@/lib/commerce/checkout";
import { cart, useCart } from "@/lib/commerce/cart-store";
import { MAX_QUANTITY, subtotal } from "@/lib/commerce/cart";
import { formatPrice } from "@/lib/utils";
import type { BrandContent } from "@/types/brand";
import { CloseIcon } from "@/components/ui/Icons";
import { SafeImage } from "@/components/ui/SafeImage";

export interface CartProduct {
  slug: string;
  name: string;
  category: string;
  image?: string;
  price?: number;
  currency?: string;
}

interface CartDrawerProps {
  products: CartProduct[];
  labels: BrandContent["cart"];
}

/** Side panel listing the bag (PRD §29). Sends the bag as an enquiry until checkout exists. */
export function CartDrawer({ products, labels }: CartDrawerProps) {
  const { lines, open } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const close = useCallback(() => cart.close(), []);
  useDialog(open, close, panelRef);

  const items = lines
    .map((line) => ({ line, product: products.find((p) => p.slug === line.slug) }))
    .filter((item): item is { line: typeof item.line; product: CartProduct } => Boolean(item.product));
  const total = subtotal(lines, products);
  const checkout = enquiryCheckout.start(lines);
  const time = reduceMotion ? 0 : duration.normal;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: time }}
            onClick={close}
          />
          <motion.div
            id="bag-drawer"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bag-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border/70 bg-surface"
            initial={{ x: reduceMotion ? 0 : "100%", opacity: reduceMotion ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: reduceMotion ? 0 : "100%", opacity: reduceMotion ? 0 : 1 }}
            transition={{ duration: reduceMotion ? 0 : duration.slow, ease: ease.outCurve }}
            data-lenis-prevent
          >
            <div className="flex h-16 items-center justify-between border-b border-border/70 px-6">
              <h2 id="bag-title" className="font-display text-2xl text-text">
                {labels.title}
              </h2>
              <button type="button" className="icon-button" aria-label="Close bag" onClick={close}>
                <CloseIcon />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-start justify-center gap-6 px-6">
                <p className="text-lg text-muted-text">{labels.empty}</p>
                <Link href="/products" className="pill-button" onClick={close}>
                  Browse products
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-border/70 overflow-y-auto px-6">
                  {items.map(({ line, product }) => (
                    <li key={product.slug} className="flex gap-4 py-5">
                      <div className="product-frame relative h-24 w-20 shrink-0 overflow-hidden">
                        {product.image && <SafeImage src={product.image} alt="" fill sizes="80px" className="object-cover" />}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <Link href={`/products/${product.slug}`} onClick={close} className="font-display text-xl leading-tight text-text hover:underline">
                          {product.name}
                        </Link>
                        <p className="text-sm text-muted-text">{product.category}</p>
                        {product.price !== undefined && product.currency && (
                          <p className="mt-1 text-sm text-text">{formatPrice(product.price, product.currency)}</p>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center rounded-full border border-border" role="group" aria-label={`Quantity of ${product.name}`}>
                            <button
                              type="button"
                              className="grid h-9 w-9 place-items-center text-text"
                              aria-label={`Remove one ${product.name}`}
                              onClick={() => cart.setQuantity(product.slug, line.quantity - 1)}
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm tabular-nums text-text" aria-live="polite">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              className="grid h-9 w-9 place-items-center text-text disabled:opacity-40"
                              aria-label={`Add one more ${product.name}`}
                              disabled={line.quantity >= MAX_QUANTITY}
                              onClick={() => cart.setQuantity(product.slug, line.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <button type="button" className="text-sm text-muted-text underline-offset-4 hover:text-text hover:underline" onClick={() => cart.remove(product.slug)}>
                            Remove<span className="sr-only"> {product.name}</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="space-y-4 border-t border-border/70 p-6">
                  {total && (
                    <p className="flex justify-between text-text">
                      <span>Subtotal</span>
                      <span>{formatPrice(total.amount, total.currency)}</span>
                    </p>
                  )}
                  <p className="text-sm leading-relaxed text-muted-text">{labels.note}</p>
                  <Link href={checkout.href} className="submit-button w-full" onClick={close}>
                    {labels.checkoutLabel}
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
