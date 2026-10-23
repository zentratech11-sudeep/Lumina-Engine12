import { expect, test } from "./fixtures";

test.describe("Products, bag and enquiry", () => {
  test("product cards open their detail page with structured data", async ({ page }) => {
    await page.goto("/products");
    await page.getByRole("link", { name: "Noir Absolu Parfum" }).click();
    await expect(page).toHaveURL(/\/products\/noir-absolu$/);
    await expect(page.getByRole("heading", { level: 1, name: "Noir Absolu Parfum" })).toBeVisible();
    const jsonLd = await page.locator("script[type='application/ld+json']").allTextContents();
    expect(jsonLd.some((block) => block.includes('"@type":"Product"'))).toBe(true);
    expect(jsonLd.some((block) => block.includes('"@type":"BreadcrumbList"'))).toBe(true);
  });

  test("unknown products are a 404", async ({ page, allowConsoleErrors }) => {
    allowConsoleErrors(/status of 404/);
    expect((await page.goto("/products/not-a-product"))?.status()).toBe(404);
  });

  test("add to bag, change quantity, and send the bag as an enquiry", async ({ page }) => {
    await page.goto("/products/noir-absolu");
    await page.getByRole("button", { name: "Add to bag" }).click();
    await expect(page.getByTestId("bag-button")).toHaveAccessibleName(/1 item/);

    // Adding opens the bag drawer.
    const drawer = page.getByRole("dialog", { name: /bag/i });
    await expect(drawer.getByText("Noir Absolu Parfum").first()).toBeVisible();
    await drawer.getByRole("button", { name: "Add one more Noir Absolu Parfum" }).click();
    await expect(drawer.getByRole("group", { name: "Quantity of Noir Absolu Parfum" })).toContainText("2");

    await drawer.getByRole("link").filter({ hasText: /enquir|send|request/i }).click();
    await expect(page).toHaveURL(/\/contact\?bag=1/);
    await expect(page.locator("#contact-form").getByLabel("Message", { exact: true })).toHaveValue(/2 × Noir Absolu Parfum/);
  });

  test("the bag survives a reload", async ({ page }) => {
    await page.goto("/products/luxe-renewal-cream");
    await page.getByRole("button", { name: "Add to bag" }).click();
    await page.reload();
    await expect(page.getByTestId("bag-button")).toHaveAccessibleName(/1 item/);
  });
});
