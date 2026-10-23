/** @vitest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { lumina } from "./mocks";

vi.mock("next/image", async () => ({ default: (await import("./mocks")).MockImage }));

const items = lumina.gallery;

describe("Gallery", () => {
  it("renders every image with its alt text", () => {
    render(<GalleryGrid items={items} />);
    for (const item of items) expect(screen.getAllByRole("img", { name: item.alt }).length).toBeGreaterThan(0);
  });

  it("opens a lightbox that steps with the arrow keys and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<GalleryGrid items={items} />);
    await user.click(screen.getAllByRole("button", { name: new RegExp(items[0]!.alt) })[0]!);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("img", { name: items[0]!.alt })).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(within(dialog).getByRole("img", { name: items[1]!.alt })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
