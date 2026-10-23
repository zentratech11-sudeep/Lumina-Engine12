import { beforeEach, describe, expect, it, vi } from "vitest";
import { brandRegistry } from "@/brands";
import { parseBrandBundle } from "@/lib/brand";
import { createResendSender, escapeHtml, getMailConfig, type EmailMessage, type MailConfig } from "@/lib/contact/email";
import { createRateLimiter, isTooFast } from "@/lib/contact/spam";
import { handleContactSubmission, type SubmissionContext } from "@/lib/contact/submit";

const bundle = parseBrandBundle(brandRegistry.lumina, "lumina");
const NOW = 1_800_000_000_000;

const valid = {
  name: "Asha Rai",
  email: "asha@example.com",
  topic: "Product question",
  product: "noir-absolu",
  message: "Is the parfum available in a travel size?",
  startedAt: String(NOW - 20_000),
  website: "",
};

let sent: EmailMessage[];
let context: SubmissionContext;

function mailStub(): MailConfig {
  return {
    to: "studio@lumina.example",
    from: "website@lumina.example",
    send: async (message) => {
      sent.push(message);
    },
  };
}

beforeEach(() => {
  sent = [];
  vi.spyOn(console, "error").mockImplementation(() => {});
  context = {
    bundle,
    mail: mailStub(),
    limiter: createRateLimiter({ limit: 5, windowMs: 600_000 }),
    clientKey: "203.0.113.7",
    now: NOW,
    siteUrl: "https://lumina.example",
  };
});

describe("contact submission", () => {
  it("sends a valid message with the visitor as reply-to", async () => {
    const result = await handleContactSubmission(valid, context);
    expect(result).toEqual({ status: "success" });
    expect(sent).toHaveLength(1);
    expect(sent[0]!.replyTo).toBe("asha@example.com");
    expect(sent[0]!.subject).toBe("[LUMINA] Product question: Asha Rai");
    expect(sent[0]!.text).toContain("Product: Noir Absolu Parfum");
  });

  it("returns an error per invalid field and keeps what was typed", async () => {
    const result = await handleContactSubmission({ ...valid, email: "not-an-email", message: "hi" }, context);
    expect(result.status).toBe("error");
    if (result.status !== "error") return;
    expect(Object.keys(result.fieldErrors).sort()).toEqual(["email", "message"]);
    expect(result.values.name).toBe("Asha Rai");
    expect(result.message).toBe("Please fix 2 fields below.");
    expect(sent).toHaveLength(0);
  });

  it("only accepts topics and products from the brand data", async () => {
    const result = await handleContactSubmission({ ...valid, topic: "Free money", product: "fake" }, context);
    expect(result.status === "error" && Object.keys(result.fieldErrors).sort()).toEqual(["product", "topic"]);
  });

  it("rejects line breaks in the name (header injection)", async () => {
    const result = await handleContactSubmission({ ...valid, name: "Asha\r\nBcc: x@y.z" }, context);
    expect(result.status === "error" && result.fieldErrors.name).toBeTruthy();
  });

  it("pretends to succeed for bots that fill the honeypot, and sends nothing", async () => {
    const result = await handleContactSubmission({ ...valid, website: "http://spam.example" }, context);
    expect(result).toEqual({ status: "success" });
    expect(sent).toHaveLength(0);
  });

  it("rejects instant submissions", async () => {
    const result = await handleContactSubmission({ ...valid, startedAt: String(NOW - 500) }, context);
    expect(result.status).toBe("error");
    expect(sent).toHaveLength(0);
  });

  it("limits each visitor to 5 messages per window", async () => {
    for (let i = 0; i < 5; i += 1) {
      expect((await handleContactSubmission(valid, context)).status).toBe("success");
    }
    const blocked = await handleContactSubmission(valid, context);
    expect(blocked.status).toBe("error");
    expect(blocked.status === "error" && blocked.message).toContain("hello@lumina.example");
    const otherVisitor = await handleContactSubmission(valid, { ...context, clientKey: "198.51.100.2" });
    expect(otherVisitor.status).toBe("success");
  });

  it("tells visitors to email directly when mail is not configured", async () => {
    const result = await handleContactSubmission(valid, { ...context, mail: null });
    expect(result.status === "error" && result.message).toContain("hello@lumina.example");
  });

  it("reports provider failures without losing the message", async () => {
    const failing: MailConfig = { ...mailStub(), send: async () => Promise.reject(new Error("down")) };
    const result = await handleContactSubmission(valid, { ...context, mail: failing });
    expect(result.status).toBe("error");
    expect(result.status === "error" && result.values.message).toBe(valid.message);
  });

  it("escapes HTML in the email body", async () => {
    await handleContactSubmission({ ...valid, message: "<script>alert('x')</script> & more" }, context);
    expect(sent[0]!.html).not.toContain("<script>");
    expect(sent[0]!.html).toContain("&lt;script&gt;");
  });
});

describe("spam helpers", () => {
  it("does not treat a missing timestamp as spam", () => expect(isTooFast(undefined, NOW)).toBe(false));
  it("frees a visitor once the window passes", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(limiter.take("a", 0)).toBe(true);
    expect(limiter.take("a", 500)).toBe(false);
    expect(limiter.take("a", 1500)).toBe(true);
  });
  it("escapes every HTML special character", () => expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;"));
});

describe("mail configuration", () => {
  it("uses Resend when all variables are set", () => {
    const config = getMailConfig({ NODE_ENV: "production", RESEND_API_KEY: "re_x", CONTACT_TO_EMAIL: "a@b.c", CONTACT_FROM_EMAIL: "d@e.f" });
    expect(config?.to).toBe("a@b.c");
  });
  it("falls back to the terminal in development", () => {
    expect(getMailConfig({ NODE_ENV: "development" })).not.toBeNull();
  });
  it("is disabled in production without variables", () => {
    expect(getMailConfig({ NODE_ENV: "production" })).toBeNull();
  });
  it("posts the message to Resend", async () => {
    const fetcher = vi.fn(async () => new Response("{}", { status: 200 }));
    await createResendSender("re_test", fetcher as unknown as typeof fetch)({
      to: "a@b.c",
      from: "d@e.f",
      replyTo: "g@h.i",
      subject: "s",
      text: "t",
      html: "h",
    });
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(JSON.parse(init.body as string)).toMatchObject({ to: ["a@b.c"], reply_to: "g@h.i" });
  });
});
