import { counterText, expect, test } from "./fixtures";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.describe("Mobile (PRD §9, §25)", () => {
  test("menu opens full screen, navigates and closes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Gallery" })).toBeHidden();
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Gallery" }).click();
    await expect(page).toHaveURL(/\/gallery$/);
    await expect(menu).toBeHidden();
  });

  test("swiping left shows the next product", async ({ page }) => {
    await page.goto("/exclusive");
    const box = await page.locator("section[aria-roledescription='carousel']").boundingBox();
    if (!box) throw new Error("carousel not found");
    const y = box.y + box.height / 2;
    await page.locator("section[aria-roledescription='carousel']").evaluate(
      (element, { y, left, right }) => {
        const fire = (type: string, x: number) =>
          element.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType: "touch", clientX: x, clientY: y, isPrimary: true }));
        fire("pointerdown", right);
        fire("pointerup", left);
      },
      { y, left: box.x + 40, right: box.x + box.width - 40 },
    );
    await expect.poll(() => counterText(page)).toBe("02/06");
  });

  test("no horizontal scrolling on any main page", async ({ page }) => {
    for (const path of ["/", "/products", "/exclusive", "/contact", "/gallery"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(1);
    }
  });
});
