export interface EmailMessage {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}

export type EmailSender = (message: EmailMessage) => Promise<void>;

export interface MailConfig {
  send: EmailSender;
  to: string;
  from: string;
}

/** Sends through Resend's REST API. Any provider with an HTTP API can replace this function. */
export function createResendSender(apiKey: string, fetcher: typeof fetch = fetch): EmailSender {
  return async (message) => {
    const response = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: message.from,
        to: [message.to],
        reply_to: message.replyTo,
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Email provider responded ${response.status}: ${detail.slice(0, 300)}`);
    }
  };
}

/** Development stand-in: prints the email instead of sending it. */
const consoleSender: EmailSender = async (message) => {
  console.info(`\n[contact form] Email not sent (no RESEND_API_KEY). It would have been:\n` +
    `To: ${message.to}\nReply-To: ${message.replyTo}\nSubject: ${message.subject}\n\n${message.text}\n`);
};

/**
 * Reads mail settings from the environment.
 * - All three variables set: real email through Resend.
 * - Missing in development: emails are printed to the terminal.
 * - Missing in production: returns null, and the form tells visitors to email directly.
 */
export function getMailConfig(env: NodeJS.ProcessEnv = process.env): MailConfig | null {
  const apiKey = env.RESEND_API_KEY;
  const to = env.CONTACT_TO_EMAIL;
  const from = env.CONTACT_FROM_EMAIL;
  // Test-only switch (used by the Playwright suite): log instead of sending, even in production builds.
  if (env.CONTACT_DRY_RUN === "1") return { send: consoleSender, to: to ?? "studio@example.com", from: from ?? "website@example.com" };
  if (apiKey && to && from) return { send: createResendSender(apiKey), to, from };
  if (env.NODE_ENV !== "production") {
    return { send: consoleSender, to: to ?? "studio@example.com", from: from ?? "website@example.com" };
  }
  return null;
}

const htmlEscapes: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => htmlEscapes[char] ?? char);
}
