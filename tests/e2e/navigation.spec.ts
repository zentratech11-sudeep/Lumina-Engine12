import { expect, test } from "./fixtures";

const pages = [
  { label: "About", path: "/about" },
  { label: "Products", path: "/products" },
  { label: "Exclusive", path: "/exclusive" },
  { label: "Gallery", path: "/gallery" },
  { label: "Reviews", path: "/reviews" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

test.describe("Navigation", () => {
  for (const { label, path } of pages) {
    test(`${label} link opens ${path} and is marked current`, async ({ page }) => {
      await page.goto("/");
      const nav = page.getByRole("navigation", { name: "Main" });
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
    });
  }

  test("unknown pages show the 404 page", async ({ page, allowConsoleErrors }) => {
    allowConsoleErrors(/status of 404/);
    const response = await page.goto("/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /doesn.t exist/ })).toBeVisible();
  });
});
