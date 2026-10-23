import { expect, test } from "./fixtures";

test.describe("Gallery, reviews and journal", () => {
  test("gallery lightbox opens, steps and closes", async ({ page }) => {
    await page.goto("/gallery");
    await page.getByRole("button", { name: /Open image/ }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const first = await dialog.getByRole("img").first().getAttribute("alt");
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => dialog.getByRole("img").first().getAttribute("alt")).not.toBe(first);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("reviews page shows the average rating", async ({ page }) => {
    await page.goto("/reviews");
    await expect(page.getByRole("img", { name: /Rated [\d.]+ out of 5/ }).first()).toBeVisible();
  });

  test("journal lists posts and opens an article", async ({ page }) => {
    await page.goto("/blog");
    const firstPost = page.locator("main article a").first();
    const title = (await firstPost.textContent())?.trim() ?? "";
    await firstPost.click();
    await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(title.slice(0, 20));
  });
});

test.describe("SEO and API", () => {
  test("sitemap lists pages, products and posts", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/products/noir-absolu");
    expect(xml).toContain("/blog/");
    expect(xml).toContain("/exclusive");
  });

  test("robots.txt points to the sitemap", async ({ request }) => {
    expect(await (await request.get("/robots.txt")).text()).toContain("sitemap.xml");
  });

  test("pages have a canonical URL and Open Graph image", async ({ page }) => {
    await page.goto("/products/noir-absolu");
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", /\/products\/noir-absolu$/);
    await expect(page.locator("meta[property='og:image']").first()).toHaveAttribute("content", /\.(webp|jpg|png)/);
  });

  test("read-only API returns brand data", async ({ request }) => {
    const products = await (await request.get("/api/products")).json();
    expect(products.data.length).toBeGreaterThan(0);
    const product = await request.get("/api/products/noir-absolu");
    expect((await product.json()).data.name).toBe("Noir Absolu Parfum");
    expect((await request.post("/api/products")).status()).toBe(405);
  });
});
