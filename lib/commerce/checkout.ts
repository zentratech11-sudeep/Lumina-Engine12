import type { CartLine } from "./cart";

/**
 * Extension point for real checkout (PRD §29). Today the only provider sends
 * the bag to the contact form as an enquiry. A Stripe or Shopify provider
 * would create a hosted checkout session on the server and return its URL.
 */
export interface CheckoutProvider {
  id: string;
  start: (lines: CartLine[]) => { href: string };
}

export const enquiryCheckout: CheckoutProvider = {
  id: "enquiry",
  start: () => ({ href: "/contact?bag=1#contact-form" }),
};
