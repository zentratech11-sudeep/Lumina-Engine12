"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { enquiryMessage } from "@/lib/commerce/cart";
import { cart, useCart } from "@/lib/commerce/cart-store";
import { useFormStatus } from "react-dom";
import { sendContactMessage } from "@/app/contact/actions";
import {
  HONEYPOT_FIELD,
  STARTED_AT_FIELD,
  initialContactState,
  type ContactField,
  type ContactValues,
} from "@/lib/contact/schema";

export interface ContactFormProps {
  topics: string[];
  products: Array<{ slug: string; name: string }>;
  initialTopic: string;
  initialProduct: string;
  /** Server time when the page rendered; used to spot instant bot submissions. */
  startedAt: number;
  successHeading: string;
  successBody: string;
  privacyNote: string;
  /** Set when the visitor arrived from the bag; the message is pre-filled with its contents. */
  fromBag?: boolean;
}

const fieldLabels: Record<ContactField, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  topic: "What is this about?",
  product: "Product",
  message: "Message",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="submit-button" disabled={pending}>
      {pending ? "Sending…" : "Send message"}
    </button>
  );
}

interface FieldProps {
  id: ContactField;
  error?: string;
  optional?: boolean;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
}

function Field({ id, error, optional, children }: FieldProps) {
  const inputId = `contact-${id}`;
  const errorId = `${inputId}-error`;
  return (
    <div>
      <label htmlFor={inputId} className="field-label">
        {fieldLabels[id]}
        {optional && <span className="ml-1 opacity-70">(optional)</span>}
      </label>
      {children({ id: inputId, "aria-invalid": Boolean(error), "aria-describedby": error ? errorId : undefined })}
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Contact form (PRD §5, TRD §36). Validation runs on the server, so the
 * rules are identical with or without JavaScript. On an error, focus moves
 * to a summary that links to each field; nothing the visitor typed is lost.
 */
export function ContactForm({
  topics,
  products,
  initialTopic,
  initialProduct,
  startedAt,
  successHeading,
  successBody,
  privacyNote,
  fromBag = false,
}: ContactFormProps) {
  const bag = useCart();
  const bagMessage = fromBag ? enquiryMessage(bag.lines, products) : "";
  const [state, formAction] = useActionState(sendContactMessage, initialContactState);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
    if (state.status === "success") {
      successRef.current?.focus();
      if (fromBag) cart.clear();
    }
  }, [state, fromBag]);

  if (state.status === "success") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="border-t border-border/70 pt-10 outline-none">
        <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-light text-text">{successHeading}</h2>
        <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-muted-text">{successBody}</p>
      </div>
    );
  }

  const errors = state.status === "error" ? state.fieldErrors : {};
  const values: ContactValues =
    state.status === "error"
      ? state.values
      : { name: "", email: "", phone: "", topic: initialTopic, product: initialProduct, message: bagMessage };
  const erroredFields = Object.keys(errors) as ContactField[];

  return (
    // Re-keying after each failed attempt re-applies the visitor's values,
    // because React resets uncontrolled forms when an action finishes.
    // The bag is read after hydration, so the key also changes once its message is known.
    <form key={state.status === "error" ? state.attempt : `initial-${bagMessage.length}`} action={formAction} noValidate className="space-y-9">
      {state.status === "error" && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-sm border border-error/50 px-5 py-4 outline-none focus-visible:ring-1 focus-visible:ring-error"
        >
          <p className="text-text">{state.message}</p>
          {erroredFields.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm">
              {erroredFields.map((field) => (
                <li key={field}>
                  <a href={`#contact-${field}`} className="text-error underline underline-offset-4">
                    {fieldLabels[field]}: {errors[field]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <input type="hidden" name={STARTED_AT_FIELD} value={startedAt} />
      {/* Honeypot: invisible to people and screen readers, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="grid gap-9 sm:grid-cols-2">
        <Field id="name" error={errors.name}>
          {(props) => (
            <input {...props} name="name" type="text" autoComplete="name" required maxLength={100} defaultValue={values.name} className="field-input" />
          )}
        </Field>
        <Field id="email" error={errors.email}>
          {(props) => (
            <input
              {...props}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              maxLength={200}
              defaultValue={values.email}
              className="field-input"
            />
          )}
        </Field>
      </div>

      <Field id="phone" error={errors.phone} optional>
        {(props) => (
          <input {...props} name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} defaultValue={values.phone} className="field-input" />
        )}
      </Field>

      <div className="grid gap-9 sm:grid-cols-2">
        <Field id="topic" error={errors.topic}>
          {(props) => (
            <select {...props} name="topic" required defaultValue={values.topic} className="field-input">
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id="product" error={errors.product} optional>
          {(props) => (
            <select {...props} name="product" defaultValue={values.product} className="field-input">
              <option value="">None in particular</option>
              {products.map((product) => (
                <option key={product.slug} value={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field id="message" error={errors.message}>
        {(props) => (
          <textarea {...props} name="message" required rows={6} maxLength={5000} defaultValue={values.message} className="field-input" />
        )}
      </Field>

      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <SubmitButton />
        <p className="max-w-[36ch] text-sm text-muted-text">{privacyNote}</p>
      </div>
    </form>
  );
}
