"use server";

import { headers } from "next/headers";
import { getBrand } from "@/lib/brand";
import { getMailConfig } from "@/lib/contact/email";
import type { ContactState } from "@/lib/contact/schema";
import { createRateLimiter } from "@/lib/contact/spam";
import { handleContactSubmission } from "@/lib/contact/submit";
import { siteUrl } from "@/lib/seo";

/** 5 messages per visitor per 10 minutes. */
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

/**
 * Server Action behind the contact form. Works without JavaScript too:
 * the browser posts the form and the page re-renders with the result.
 */
export async function sendContactMessage(_previous: ContactState, formData: FormData): Promise<ContactState> {
  const requestHeaders = await headers();
  const clientKey =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";

  const input: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") input[key] = value;
  }

  return handleContactSubmission(input, {
    bundle: getBrand(),
    mail: getMailConfig(),
    limiter,
    clientKey,
    now: Date.now(),
    siteUrl: siteUrl(),
  });
}
