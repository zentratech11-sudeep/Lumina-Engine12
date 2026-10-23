import { expect, test as base, type Page } from "@playwright/test";

interface Fixtures {
  allowedErrors: RegExp[];
  /** Lets a test expect a specific console error, e.g. the 404 for a page that doesn't exist. */
  allowConsoleErrors: (pattern: RegExp) => void;
  consoleErrors: string[];
}

/** Fails a test if the page throws or logs an error (PRD §33 "no major console errors"). */
export const test = base.extend<Fixtures>({
  allowedErrors: async ({}, provide) => {
    await provide([]);
  },
  allowConsoleErrors: async ({ allowedErrors }, provide) => {
    await provide((pattern) => {
      allowedErrors.push(pattern);
    });
  },
  consoleErrors: [
    async ({ page, allowedErrors }, provide) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await provide(errors);
      const unexpected = errors.filter((error) => !allowedErrors.some((pattern) => pattern.test(error)));
      expect(unexpected, "console errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** The "01 / 06" counter as plain text. */
export async function counterText(page: Page): Promise<string> {
  const text = await page.locator("section[aria-roledescription='carousel'] p[aria-hidden='true']").first().textContent();
  return (text ?? "").replace(/\s+/g, "");
}

/** Pretends the browser has no WebGL, to exercise the image fallback (TRD §29). */
export async function disableWebGL(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.startsWith("webgl")) return null;
      return (original as (...a: unknown[]) => RenderingContext | null).call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
}
