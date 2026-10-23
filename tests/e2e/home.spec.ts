import { expect, test } from "./fixtures";

test.describe("Home page", () => {
  test("renders the hero and every configured section in order (PRD §6)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const headings = await page.locator("main h2").allTextContents();
    const order = ["Made slowly", "From the collection", "Exclusive Collection", "Why black glass", "In the studio", "After a full bottle", "Visit the studio"];
    let last = -1;
    for (const expected of order) {
      const index = headings.findIndex((text, i) => i > last && text.includes(expected));
      expect(index, `"${expected}" after the previous section`).toBeGreaterThan(last);
      last = index;
    }
  });

  test("has a working skip link", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("labels sample reviews", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Sample review").first()).toBeVisible();
  });
});
