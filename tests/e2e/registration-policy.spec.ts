import { expect, test } from "@playwright/test";

test.describe("public registration policy", () => {
  test("blocks public registration by default", async ({ page }) => {
    await page.goto("/register");

    await expect(page).toHaveURL(/\/login$/);

    await expect(page.getByText("Pendaftaran akun baru dinonaktifkan.")).toBeVisible();

    await expect(
      page.getByRole("link", {
        name: "Daftar",
      }),
    ).toHaveCount(0);
  });
});
