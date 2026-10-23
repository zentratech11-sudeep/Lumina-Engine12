import { z } from "zod";

export const contactFields = ["name", "email", "phone", "topic", "product", "message"] as const;
export type ContactField = (typeof contactFields)[number];
export type ContactValues = Record<ContactField, string>;

/** Hidden anti-spam fields. `website` must stay empty; `startedAt` is when the form was rendered. */
export const HONEYPOT_FIELD = "website";
export const STARTED_AT_FIELD = "startedAt";

const noLineBreaks = (value: string) => !/[\r\n]/.test(value);

/**
 * Built per brand, because the allowed topics and products come from brand data.
 * Messages are written for visitors, since they are shown next to the fields.
 */
export function createContactSchema({ topics, productSlugs }: { topics: string[]; productSlugs: string[] }) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, "Please enter your name.")
      .max(100, "Please keep your name under 100 characters.")
      .refine(noLineBreaks, "Please keep your name on one line."),
    email: z
      .string()
      .trim()
      .min(1, "Please enter your email address.")
      .max(200, "That email address is too long.")
      .pipe(z.email("Please enter a valid email address, like name@example.com.")),
    phone: z
      .string()
      .trim()
      .max(30, "Please keep the phone number under 30 characters.")
      .refine((value) => value === "" || /^\+?[0-9 ()\-.]{6,}$/.test(value), "Please enter a phone number using digits, spaces and + ( ) - only."),
    topic: z.string().refine((value) => topics.includes(value), "Please choose a topic."),
    product: z
      .string()
      .refine((value) => value === "" || productSlugs.includes(value), "Please choose a product from the list."),
    message: z
      .string()
      .trim()
      .min(10, "Please write a little more so we can help (at least 10 characters).")
      .max(5000, "Please keep your message under 5,000 characters."),
  });
}

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      /** Shown above the form. */
      message: string;
      fieldErrors: Partial<Record<ContactField, string>>;
      /** What the visitor typed, so nothing is lost when the form re-renders. */
      values: ContactValues;
      /** Changes on every failed attempt so the form re-applies `values`. */
      attempt: number;
    };

export const initialContactState: ContactState = { status: "idle" };
