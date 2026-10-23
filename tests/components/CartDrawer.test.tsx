/** @vitest-environment jsdom */
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AddToBagButton } from "@/components/commerce/AddToBagButton";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { cart } from "@/lib/commerce/cart-store";
import { solenne } from "./mocks";

vi.mock("next/image", async () => ({ default: (await import("./mocks")).MockImage }));

const labels = solenne.content.cart;
const products = solenne.products.map(({ slug, name, category, image, price, currency }) => ({ slug, name, category, image, price, currency }));

afterEach(() => act(() => cart.clear()));

describe("Bag", () => {
  it("adds a product, shows it in the drawer with a total, and changes quantity", async () => {
    const user = userEvent.setup();
    render(
      <>
        <AddToBagButton slug="ambre-nuit" label={labels.addLabel} addedLabel={labels.addedLabel} />
        <CartDrawer products={products} labels={labels} />
      </>,
    );
    await user.click(screen.getByRole("button", { name: labels.addLabel }));
    act(() => cart.open());

    const drawer = await screen.findByRole("dialog", { name: labels.title });
    expect(within(drawer).getAllByText("Ambre Nuit").length).toBeGreaterThan(0);
    await user.click(within(drawer).getByRole("button", { name: "Add one more Ambre Nuit" }));
    expect(within(drawer).getByRole("group", { name: "Quantity of Ambre Nuit" })).toHaveTextContent("2");
    expect(drawer).toHaveTextContent("290");
  });

  it("empties when the last item is removed", async () => {
    const user = userEvent.setup();
    act(() => {
      cart.add("rose-cendree");
      cart.open();
    });
    render(<CartDrawer products={products} labels={labels} />);
    const drawer = await screen.findByRole("dialog", { name: labels.title });
    await user.click(within(drawer).getByRole("button", { name: "Remove one Rose Cendrée" }));
    expect(within(drawer).getByText(labels.empty)).toBeInTheDocument();
  });

  it("sends the bag to the contact form as an enquiry", async () => {
    act(() => {
      cart.add("ambre-nuit");
      cart.open();
    });
    render(<CartDrawer products={products} labels={labels} />);
    const drawer = await screen.findByRole("dialog", { name: labels.title });
    expect(within(drawer).getByRole("link", { name: labels.checkoutLabel })).toHaveAttribute("href", "/contact?bag=1#contact-form");
  });
});
