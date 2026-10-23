import type { BrandBundle } from "@/types/brand";
import { escapeHtml, type MailConfig } from "./email";
import {
  contactFields,
  createContactSchema,
  HONEYPOT_FIELD,
  STARTED_AT_FIELD,
  type ContactField,
  type ContactState,
  type ContactValues,
} from "./schema";
import { isHoneypotFilled, isTooFast, type RateLimiter } from "./spam";

export interface SubmissionContext {
  bundle: BrandBundle;
  mail: MailConfig | null;
  limiter: RateLimiter;
  /** Visitor's IP, used only for rate limiting. */
  clientKey: string;
  now: number;
  siteUrl: string;
}

type RawInput = Record<string, string | undefined>;

function readValues(input: RawInput): ContactValues {
  return Object.fromEntries(contactFields.map((field) => [field, (input[field] ?? "").slice(0, 6000)])) as ContactValues;
}

function failure(values: ContactValues, now: number, message: string, fieldErrors: Partial<Record<ContactField, string>> = {}): ContactState {
  return { status: "error", message, fieldErrors, values, attempt: now };
}

function buildEmail(bundle: BrandBundle, data: ContactValues, siteUrl: string) {
  const product = bundle.products.find((p) => p.slug === data.product);
  const rows: Array<[string, string]> = [
    ["Name", data.name],
    ["Email", data.email],
    ...(data.phone ? ([["Phone", data.phone]] as Array<[string, string]>) : []),
    ["Topic", data.topic],
    ...(product ? ([["Product", product.name]] as Array<[string, string]>) : []),
  ];
  const subject = `[${bundle.brand.name}] ${data.topic}: ${data.name}`;
  const text = [
    `New message from the ${bundle.brand.name} website`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    data.message,
    "",
    `Sent from ${siteUrl}/contact. Reply to this email to answer ${data.name} directly.`,
  ].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111">
<p>New message from the ${escapeHtml(bundle.brand.name)} website</p>
<table cellpadding="4" style="border-collapse:collapse">${rows
    .map(([label, value]) => `<tr><td style="color:#666;padding-right:16px">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`)
    .join("")}</table>
<p style="white-space:pre-wrap;margin-top:20px">${escapeHtml(data.message)}</p>
<p style="color:#666;font-size:13px;margin-top:24px">Reply to this email to answer ${escapeHtml(data.name)} directly.</p>
</div>`;
  return { subject, text, html };
}

/**
 * Everything the contact form does on the server, with its dependencies
 * passed in so it can be unit-tested without a network or a framework.
 */
export async function handleContactSubmission(input: RawInput, context: SubmissionContext): Promise<ContactState> {
  const { bundle, mail, limiter, clientKey, now, siteUrl } = context;
  const values = readValues(input);
  const fallbackEmail = bundle.brand.contact.email;
  const directly = fallbackEmail ? ` You can also email ${fallbackEmail} directly.` : "";

  // Bots that fill the hidden field get a normal-looking success and nothing is sent.
  if (isHoneypotFilled(input[HONEYPOT_FIELD])) return { status: "success" };

  const schema = createContactSchema({
    topics: bundle.content.contactForm.topics,
    productSlugs: bundle.products.map((p) => p.slug),
  });
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<ContactField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ContactField | undefined;
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    const count = Object.keys(fieldErrors).length;
    return failure(values, now, count === 1 ? "Please fix 1 field below." : `Please fix ${count} fields below.`, fieldErrors);
  }

  // Checked after field validation, so a person who submits an empty form sees field errors, not this.
  if (isTooFast(input[STARTED_AT_FIELD], now)) {
    return failure(values, now, "That was quicker than we expected. Please check your message and send it again.");
  }

  if (!limiter.take(clientKey, now)) {
    return failure(values, now, `You've sent several messages in a short time. Please wait a few minutes and try again.${directly}`);
  }

  if (!mail) {
    console.error("[contact form] RESEND_API_KEY, CONTACT_TO_EMAIL or CONTACT_FROM_EMAIL is not set; message not sent.");
    return failure(values, now, `Sorry, the form can't send messages right now.${directly}`);
  }

  const data = parsed.data;
  const email = buildEmail(bundle, data, siteUrl);
  try {
    await mail.send({ to: mail.to, from: mail.from, replyTo: data.email, ...email });
  } catch (error) {
    console.error("[contact form] Sending failed:", error);
    return failure(values, now, `Sorry, your message didn't go through. Please try again in a moment.${directly}`);
  }
  return { status: "success" };
}
