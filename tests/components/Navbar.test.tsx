/** @vitest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Navbar } from "@/components/navigation/Navbar";
import { lumina, solenne } from "./mocks";

vi.mock("next/navigation", () => ({ usePathname: () => "/about" }));
vi.mock("next/image", async () => ({ default: (await import("./mocks")).MockImage }));

const cartProps = {
  labels: lumina.content.cart,
  products: lumina.products.map(({ slug, name, category }) => ({ slug, name, category })),
};

describe("Navbar", () => {
  it("lists every navigation item from brand data", () => {
    render(<Navbar brand={lumina.brand} items={lumina.navigation} cart={cartProps} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    for (const item of lumina.navigation) {
      expect(within(nav).getByRole("link", { name: item.label })).toHaveAttribute("href", item.href);
    }
  });

  it("marks the current page", () => {
    render(<Navbar brand={lumina.brand} items={lumina.navigation} />);
    expect(screen.getAllByRole("link", { name: "About" })[0]).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("link", { name: "Home" })[0]).not.toHaveAttribute("aria-current");
  });

  it("shows the sound toggle only for brands with audio", () => {
    const { unmount } = render(<Navbar brand={lumina.brand} items={lumina.navigation} />);
    expect(screen.getByRole("button", { name: "Turn sound on" })).toBeInTheDocument();
    unmount();
    render(<Navbar brand={solenne.brand} items={solenne.navigation} />);
    expect(screen.queryByRole("button", { name: /sound/ })).not.toBeInTheDocument();
  });

  it("shows the bag button when the cart feature is on", () => {
    render(<Navbar brand={lumina.brand} items={lumina.navigation} cart={cartProps} />);
    expect(screen.getByRole("button", { name: new RegExp(lumina.content.cart.title, "i") })).toBeInTheDocument();
  });
});

describe("MobileMenu", () => {
  it("opens as a dialog, focuses inside, and closes on Escape returning focus", async () => {
    const user = userEvent.setup();
    render(<Navbar brand={lumina.brand} items={lumina.navigation} />);
    const opener = screen.getByRole("button", { name: "Open menu" });
    await user.click(opener);

    const dialog = await screen.findByRole("dialog", { name: "Menu" });
    expect(within(dialog).getByRole("link", { name: "Gallery" })).toHaveAttribute("href", "/gallery");
    await vi.waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    await user.keyboard("{Escape}");
    await vi.waitFor(() => expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });
});
