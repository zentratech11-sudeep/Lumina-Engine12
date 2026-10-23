/** @vitest-environment jsdom */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CollectionCounter } from "@/components/collection/CollectionCounter";

describe("CollectionCounter", () => {
  it("pads the current and total slide numbers", () => {
    const { container } = render(<CollectionCounter index={2} count={6} />);
    expect(container.textContent?.replace(/\s+/g, " ").trim()).toBe("03 / 06");
  });

  it("is hidden from screen readers, which hear the live announcement instead", () => {
    const { container } = render(<CollectionCounter index={0} count={6} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
