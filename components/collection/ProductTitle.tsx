import type { Ref } from "react";

/**
 * The featured product's name, with a faint mirrored copy beneath it
 * that reads as the title's reflection on the water.
 */
export function ProductTitle({ name, ref }: { name: string; ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="relative text-center will-change-[opacity,transform,filter]">
      <p className="font-display text-[clamp(1.85rem,3.4vw,3rem)] font-normal leading-none tracking-[0.01em] text-text">
        {name}
      </p>
      <p
        aria-hidden="true"
        className="product-title-reflection pointer-events-none absolute inset-x-0 top-full mt-1 font-display text-[clamp(1.85rem,3.4vw,3rem)] leading-none text-text"
      >
        {name}
      </p>
    </div>
  );
}
