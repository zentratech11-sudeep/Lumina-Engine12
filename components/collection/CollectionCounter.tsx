import { formatCounter } from "@/lib/utils";

/** "01 / 06". Decorative; the showcase announces changes through its own live region. */
export function CollectionCounter({ index, count }: { index: number; count: number }) {
  const { current, total } = formatCounter(index, count);
  return (
    <p aria-hidden="true" className="font-ui text-[0.7rem] tracking-[0.32em] text-muted-text tabular-nums">
      {current} <span className="mx-1 opacity-60">/</span> {total}
    </p>
  );
}
