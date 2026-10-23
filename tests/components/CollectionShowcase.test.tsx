/** @vitest-environment jsdom */
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CollectionShowcase } from "@/components/collection/CollectionShowcase";
import { resolveCollections } from "@/lib/brand";
import { lumina } from "./mocks";

vi.mock("next/image", async () => ({ default: (await import("./mocks")).MockImage }));

const collections = resolveCollections(lumina);
const first = collections[0]!;

function renderShowcase() {
  return render(
    <CollectionShowcase
      collections={collections}
      scene={lumina.scene}
      brandName={lumina.brand.name}
      displayFont={lumina.brand.typography.display.family}
      nextSectionId="after"
    />,
  );
}

const announcement = () => document.querySelector("[aria-live='polite'][aria-atomic='true']")?.textContent ?? "";

beforeEach(() => {
  // No WebGL in jsdom: the showcase must fall back to the image stage (TRD §29).
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  // Skip the navigation cooldown between clicks.
  let clock = 0;
  vi.spyOn(performance, "now").mockImplementation(() => (clock += 5000));
});

describe("CollectionShowcase", () => {
  it("shows the collection title and announces the first product", () => {
    renderShowcase();
    expect(screen.getByRole("heading", { level: 1, name: first.title })).toBeInTheDocument();
    expect(announcement()).toContain(`1 of ${first.slides.length}`);
    expect(announcement()).toContain(first.slides[0]!.featured.name);
  });

  it("falls back to product images when WebGL is unavailable", () => {
    renderShowcase();
    expect(screen.getAllByRole("img", { name: new RegExp(first.slides[0]!.featured.name) }).length).toBeGreaterThan(0);
  });

  it("moves forward and back with the arrow buttons, wrapping at the ends", async () => {
    const user = userEvent.setup();
    renderShowcase();
    await user.click(screen.getByRole("button", { name: "Next product" }));
    expect(announcement()).toContain(`2 of ${first.slides.length}`);
    expect(announcement()).toContain(first.slides[1]!.featured.name);

    await user.click(screen.getByRole("button", { name: "Previous product" }));
    await user.click(screen.getByRole("button", { name: "Previous product" }));
    expect(announcement()).toContain(`${first.slides.length} of ${first.slides.length}`);
  });

  it("responds to the keyboard arrows", async () => {
    const user = userEvent.setup();
    renderShowcase();
    await user.keyboard("{ArrowRight}");
    expect(announcement()).toContain(`2 of ${first.slides.length}`);
  });

  it("switches between collections", async () => {
    const user = userEvent.setup();
    renderShowcase();
    const second = collections[1]!;
    await user.click(screen.getByRole("button", { name: second.title }));
    expect(announcement()).toContain(second.slides[0]!.featured.name);
  });

  it("scrolls to the next section", async () => {
    const user = userEvent.setup();
    const target = document.createElement("div");
    target.id = "after";
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);
    renderShowcase();
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /scroll down/i }));
    });
    expect(target.scrollIntoView).toHaveBeenCalled();
    target.remove();
  });
});
