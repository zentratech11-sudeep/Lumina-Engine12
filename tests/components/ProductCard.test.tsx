/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductCard } from "@/components/products/ProductCard";
import { lumina } from "./mocks";

vi.mock("next/image", async () => ({ default: (await import("./mocks")).MockImage }));

const product = lumina.products[0]!;

describe("ProductCard", () => {
  it("links to the product page and shows its name, category and description", () => {
    render(<ProductCard product={product} />);
    expect(screen.getByRole("link", { name: product.name })).toHaveAttribute("href", `/products/${product.slug}`);
    expect(screen.getByText(product.category)).toBeInTheDocument();
    expect(screen.getByText(product.description)).toBeInTheDocument();
  });

  it("uses the product's alt text", () => {
    render(<ProductCard product={product} />);
    expect(screen.getByRole("img", { name: product.imageAlt! })).toBeInTheDocument();
  });

  it("replaces a broken image with a placeholder instead of a broken icon (TRD §52)", () => {
    render(<ProductCard product={{ ...product, image: "/brands/lumina/images/products/missing.webp" }} />);
    fireEvent.error(screen.getByRole("img", { name: product.imageAlt! }));
    const fallback = screen.getByRole("img", { name: product.imageAlt! });
    expect(fallback.tagName).not.toBe("IMG");
  });

  it("renders without any image", () => {
    render(<ProductCard product={{ ...product, image: undefined }} />);
    expect(screen.getByRole("link", { name: product.name })).toBeInTheDocument();
  });
});
