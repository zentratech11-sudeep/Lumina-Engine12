import { counterText, disableWebGL, expect, test } from "./fixtures";

const announcement = "section[aria-roledescription='carousel'] [aria-live='polite'][aria-atomic='true']";

test.describe("Exclusive Collection", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("renders the 3D scene with title and counter (PRD §10)", async ({ page }) => {
    await page.goto("/exclusive");
    await expect(page.getByRole("heading", { level: 1, name: "Exclusive Collection" })).toBeVisible();
    expect(await counterText(page)).toBe("01/06");
    await expect(page.locator("section[aria-roledescription='carousel'] canvas")).toBeVisible();
  });

  test("next and previous update the product title and counter", async ({ page }) => {
    await page.goto("/exclusive");
    const carousel = page.locator("section[aria-roledescription='carousel']");
    await carousel.getByRole("button", { name: "Next product" }).click();
    await expect.poll(() => counterText(page)).toBe("02/06");
    await expect(page.locator(announcement)).toHaveText(/2 of 6: Noir Absolu Parfum/);
    await expect(carousel.getByText("Noir Absolu Parfum", { exact: true }).first()).toBeVisible();

    await page.waitForTimeout(1000);
    await carousel.getByRole("button", { name: "Previous product" }).click();
    await expect.poll(() => counterText(page)).toBe("01/06");
  });

  test("keyboard arrows change slides", async ({ page }) => {
    await page.goto("/exclusive");
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => counterText(page)).toBe("02/06");
    await page.waitForTimeout(1000);
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(1000);
    await page.keyboard.press("ArrowLeft");
    await expect.poll(() => counterText(page)).toBe("06/06");
  });

  test("switches to another collection", async ({ page }) => {
    await page.goto("/exclusive");
    await page.getByRole("group", { name: "Collections" }).getByRole("button", { name: "Night Ritual" }).click();
    await expect(page.locator(announcement)).toContainText("of 3");
    await expect.poll(() => counterText(page)).toBe("01/03");
  });

  test("scroll indicator moves to the content below", async ({ page }) => {
    await page.goto("/exclusive");
    await page.getByRole("button", { name: /scroll down/i }).click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  });

  test("falls back to product images without WebGL (TRD §29)", async ({ page }) => {
    await disableWebGL(page);
    await page.goto("/exclusive");
    const carousel = page.locator("section[aria-roledescription='carousel']");
    await expect(carousel.locator("canvas")).toHaveCount(0);
    await expect(carousel.getByRole("img", { name: /Luxe Renewal Cream/ }).first()).toBeVisible();
    await carousel.getByRole("button", { name: "Next product" }).click();
    await expect.poll(() => counterText(page)).toBe("02/06");
  });
});

test.describe("Exclusive Collection with motion", () => {
  test("full cinematic transition settles on the next product (PRD §13)", async ({ page }) => {
    await page.goto("/exclusive");
    await page.getByRole("button", { name: "Next product" }).click();
    // SwiftShader renders slowly, so allow far more than the 1.5 s timeline.
    await expect.poll(() => counterText(page), { timeout: 30_000 }).toBe("02/06");
  });
});
