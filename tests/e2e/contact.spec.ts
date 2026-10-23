import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const form = (page: Page) => page.locator("#contact-form");
/** Matches the start of a label, so "Phone" also finds "Phone (optional)". */
const field = (page: Page, label: string) => form(page).getByLabel(new RegExp(`^${label}`));

test.describe("Contact form (TRD §36)", () => {
  test("shows field errors without losing input", async ({ page }) => {
    await page.goto("/contact");
    await field(page, "Name").fill("Asha Rai");
    await field(page, "Email").fill("asha@");
    await page.getByRole("button", { name: "Send message" }).click();
    const alert = form(page).getByRole("alert");
    await expect(alert).toContainText("Please fix 2 fields below.");
    await expect(alert).toBeFocused();
    await expect(field(page, "Email")).toHaveAttribute("aria-invalid", "true");
    await expect(field(page, "Name")).toHaveValue("Asha Rai");
  });

  test("sends a valid message", async ({ page }) => {
    await page.goto("/contact?product=noir-absolu");
    await expect(field(page, "Product")).toHaveValue("noir-absolu");
    await field(page, "Name").fill("Asha Rai");
    await field(page, "Email").fill("asha@example.com");
    await field(page, "Phone").fill("+977 980 000 0000");
    await field(page, "Message").fill("Is the parfum available in a travel size?");
    await page.waitForTimeout(3200); // anti-spam minimum fill time
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Thank you" })).toBeVisible();
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("still validates on the server", async ({ page }) => {
      await page.goto("/contact");
      await field(page, "Name").fill("Ram");
      await field(page, "Email").fill("bad");
      await field(page, "Message").fill("short");
      await page.getByRole("button", { name: "Send message" }).click();
      await expect(form(page).getByRole("alert")).toContainText("Please fix 2 fields below.");
      await expect(field(page, "Name")).toHaveValue("Ram");
    });
  });
});
