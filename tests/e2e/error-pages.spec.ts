import { expect, test } from "@playwright/test";

test.describe("application error pages", () => {
  test("shows custom not found page", async ({ page }) => {
    const response = await page.goto("/route-that-does-not-exist-2026");

    expect(response?.status()).toBe(404);

    await expect(
      page.getByRole("heading", {
        name: "Halaman tidak ditemukan",
      }),
    ).toBeVisible();
  });

  test("protects forbidden page from unauthenticated access", async ({ page }) => {
    await page.goto("/forbidden");

    await expect(page).toHaveURL(/\/login$/);
  });
});
