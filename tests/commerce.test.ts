import { describe, expect, it } from "vitest";
import { addLine, countItems, enquiryMessage, MAX_QUANTITY, parseStoredLines, setLineQuantity, subtotal } from "@/lib/commerce/cart";
import { enquiryCheckout } from "@/lib/commerce/checkout";

const products = [
  { slug: "ambre-nuit", name: "Ambre Nuit", price: 145, currency: "USD" },
  { slug: "rose-cendree", name: "Rose Cendrée", price: 160, currency: "USD" },
  { slug: "no-price", name: "Unpriced" },
];

describe("bag lines", () => {
  it("adds a new line and merges repeats", () => {
    const once = addLine([], "ambre-nuit");
    expect(addLine(once, "ambre-nuit", 2)).toEqual([{ slug: "ambre-nuit", quantity: 3 }]);
  });

  it("caps quantities", () => {
    expect(addLine([{ slug: "ambre-nuit", quantity: 9 }], "ambre-nuit", 5)[0]!.quantity).toBe(MAX_QUANTITY);
  });

  it("removes a line at quantity 0", () => {
    expect(setLineQuantity([{ slug: "ambre-nuit", quantity: 2 }], "ambre-nuit", 0)).toEqual([]);
  });

  it("counts items across lines", () => {
    expect(countItems([{ slug: "a", quantity: 2 }, { slug: "b", quantity: 3 }])).toBe(5);
  });
});

describe("stored bag", () => {
  it("ignores corrupt storage", () => {
    expect(parseStoredLines("{not json")).toEqual([]);
    expect(parseStoredLines(JSON.stringify([{ slug: "<script>", quantity: 1 }]))).toEqual([]);
  });

  it("drops products that left the catalog", () => {
    const raw = JSON.stringify([{ slug: "ambre-nuit", quantity: 1 }, { slug: "retired", quantity: 2 }]);
    expect(parseStoredLines(raw, new Set(["ambre-nuit"]))).toEqual([{ slug: "ambre-nuit", quantity: 1 }]);
  });
});

describe("totals and enquiry", () => {
  it("adds up prices in one currency", () => {
    const lines = [{ slug: "ambre-nuit", quantity: 2 }, { slug: "rose-cendree", quantity: 1 }];
    expect(subtotal(lines, products)).toEqual({ amount: 450, currency: "USD" });
  });

  it("shows no total when any product is unpriced", () => {
    expect(subtotal([{ slug: "no-price", quantity: 1 }], products)).toBeNull();
  });

  it("writes the enquiry message from current product names", () => {
    expect(enquiryMessage([{ slug: "rose-cendree", quantity: 2 }], products)).toContain("2 × Rose Cendrée");
  });

  it("sends the bag to the contact form", () => {
    expect(enquiryCheckout.start([{ slug: "ambre-nuit", quantity: 1 }]).href).toBe("/contact?bag=1#contact-form");
  });
});
