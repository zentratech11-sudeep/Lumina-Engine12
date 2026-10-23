/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ContactForm, type ContactFormProps } from "@/components/forms/ContactForm";
import { cart } from "@/lib/commerce/cart-store";
import { lumina } from "./mocks";

const sendContactMessage = vi.hoisted(() => vi.fn());
vi.mock("@/app/contact/actions", () => ({ sendContactMessage }));

const form = lumina.content.contactForm;
const baseProps: ContactFormProps = {
  topics: form.topics,
  products: lumina.products.map(({ slug, name }) => ({ slug, name })),
  initialTopic: form.topics[0]!,
  initialProduct: "",
  startedAt: 0,
  successHeading: form.successHeading,
  successBody: form.successBody,
  privacyNote: form.privacyNote,
};

describe("ContactForm", () => {
  it("has a labelled field for name, email, phone, topic, product and message (TRD §36)", () => {
    render(<ContactForm {...baseProps} />);
    for (const label of ["Name", "Email", "Phone", "What is this about?", "Product", "Message"]) {
      expect(screen.getByLabelText(new RegExp(`^${label.replace("?", "\\?")}`))).toBeInTheDocument();
    }
  });

  it("pre-selects a product passed from a product page", () => {
    render(<ContactForm {...baseProps} initialProduct="noir-absolu" initialTopic={form.productTopic} />);
    expect(screen.getByLabelText(/^Product/)).toHaveValue("noir-absolu");
    expect(screen.getByLabelText(/^What is this about/)).toHaveValue(form.productTopic);
  });

  it("keeps the honeypot away from people and assistive technology", () => {
    const { container } = render(<ContactForm {...baseProps} />);
    const honeypot = container.querySelector<HTMLInputElement>("input[name='website']")!;
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("shows field errors from the server and keeps what was typed", async () => {
    sendContactMessage.mockResolvedValueOnce({
      status: "error",
      message: "Please fix 1 field below.",
      fieldErrors: { email: "Please enter a valid email address, like name@example.com." },
      values: { name: "Asha", email: "asha@", phone: "", topic: form.topics[0], product: "", message: "Hello there, a question" },
      attempt: 1,
    });
    const user = userEvent.setup();
    render(<ContactForm {...baseProps} />);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Please fix 1 field below.");
    expect(alert).toHaveFocus();
    const email = screen.getByLabelText(/^Email/);
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription(/valid email/);
    expect(screen.getByLabelText(/^Name/)).toHaveValue("Asha");
  });

  it("replaces the form with the success message", async () => {
    sendContactMessage.mockResolvedValueOnce({ status: "success" });
    const user = userEvent.setup();
    render(<ContactForm {...baseProps} />);
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByRole("status")).toHaveTextContent(form.successHeading);
  });

  it("pre-fills the message from the bag", async () => {
    cart.add("noir-absolu", 2);
    render(<ContactForm {...baseProps} fromBag />);
    await vi.waitFor(() => expect((screen.getByLabelText(/^Message/) as HTMLTextAreaElement).value).toContain("2 × Noir Absolu Parfum"));
    cart.clear();
  });
});
