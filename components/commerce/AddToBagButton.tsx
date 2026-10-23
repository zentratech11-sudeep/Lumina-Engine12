"use client";

import { useState } from "react";
import { cart } from "@/lib/commerce/cart-store";

/** Adds a product to the bag and opens it, announcing the change to screen readers. */
export function AddToBagButton({ slug, label, addedLabel }: { slug: string; label: string; addedLabel: string }) {
  const [added, setAdded] = useState(false);
  return (
    <>
      <button
        type="button"
        className="submit-button"
        onClick={() => {
          cart.add(slug);
          setAdded(true);
          cart.open();
        }}
      >
        {label}
      </button>
      <span className="sr-only" aria-live="polite">
        {added ? addedLabel : ""}
      </span>
    </>
  );
}
