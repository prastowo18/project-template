import { expect, test } from "@playwright/test";

test.describe("application metadata", () => {
  test("uses Indonesian language and title template", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("html")).toHaveAttribute("lang", "id");

    await expect(page).toHaveTitle("Masuk | Next.js Standard Template");
  });

  test("serves the web application manifest", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");

    expect(response.status()).toBe(200);

    const manifest = (await response.json()) as {
      name: string;
      start_url: string;
      display: string;
    };

    expect(manifest).toEqual(
      expect.objectContaining({
        name: "Next.js Standard Template",
        start_url: "/",
        display: "standalone",
      }),
    );
  });

  test("blocks indexing by default", async ({ request }) => {
    const response = await request.get("/robots.txt");

    expect(response.status()).toBe(200);

    await expect(response.text()).resolves.toContain("Disallow: /");
  });

  test("serves a valid sitemap document", async ({ request }) => {
    const response = await request.get("/sitemap.xml");

    expect(response.status()).toBe(200);

    await expect(response.text()).resolves.toContain("<urlset");
  });
});
