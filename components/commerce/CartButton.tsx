"use client";

import { cart, useCart } from "@/lib/commerce/cart-store";
import { countItems } from "@/lib/commerce/cart";
import { BagIcon } from "@/components/ui/Icons";

/** The bag icon in the navigation, with a count once something is in it. */
export function CartButton({ label }: { label: string }) {
  const { lines, open } = useCart();
  const count = countItems(lines);
  return (
    <button
      type="button"
      className="icon-button relative"
      aria-label={count > 0 ? `${label}, ${count} ${count === 1 ? "item" : "items"}` : label}
      aria-expanded={open}
      aria-controls="bag-drawer"
      onClick={() => cart.open()}
      data-testid="bag-button"
    >
      <BagIcon />
      {count > 0 && (
        <span aria-hidden="true" className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-text px-1 text-[0.6rem] font-medium leading-none text-background">
          {count}
        </span>
      )}
    </button>
  );
}
