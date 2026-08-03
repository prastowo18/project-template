import { expect, test } from "@playwright/test";

test.describe("authentication pages", () => {
  test("redirects unauthenticated visitor to login", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login$/);

    await expect(
      page.getByRole("heading", {
        name: "Masuk",
      }),
    ).toBeVisible();
  });

  test("shows login form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByLabel("Email")).toBeVisible();

    await expect(page.getByLabel("Password")).toBeVisible();

    await expect(
      page.getByRole("checkbox", {
        name: "Ingat saya",
      }),
    ).toBeChecked();

    await expect(
      page.getByRole("button", {
        name: "Masuk",
      }),
    ).toBeVisible();
  });

  test("validates empty login form", async ({ page }) => {
    await page.goto("/login");

    await page
      .getByRole("button", {
        name: "Masuk",
      })
      .click();

    await expect(page.getByText("Email wajib diisi.")).toBeVisible();

    await expect(page.getByText("Password wajib diisi.")).toBeVisible();
  });

  test("navigates from login to registration", async ({ page }) => {
    await page.goto("/login");

    await page
      .getByRole("link", {
        name: "Daftar",
      })
      .click();

    await expect(page).toHaveURL(/\/register$/);

    await expect(
      page.getByRole("heading", {
        name: "Buat akun",
      }),
    ).toBeVisible();
  });

  test("shows registration form", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByLabel("Nama")).toBeVisible();

    await expect(page.getByLabel("Email")).toBeVisible();

    await expect(
      page.getByLabel("Password", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(page.getByLabel("Konfirmasi password")).toBeVisible();

    await expect(
      page.getByRole("checkbox", {
        name: /Saya menyetujui/,
      }),
    ).not.toBeChecked();
  });

  test("validates mismatched registration passwords", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Nama").fill("Test User");

    await page.getByLabel("Email").fill("test@example.com");

    await page
      .getByLabel("Password", {
        exact: true,
      })
      .fill("secure-password-123");

    await page.getByLabel("Konfirmasi password").fill("different-password-123");

    await page
      .getByRole("checkbox", {
        name: /Saya menyetujui/,
      })
      .check();

    await page
      .getByRole("button", {
        name: "Daftar",
      })
      .click();

    await expect(page.getByText("Konfirmasi password tidak sama.")).toBeVisible();

    await expect(page).toHaveURL(/\/register$/);
  });

  test("requires terms acceptance", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Nama").fill("Test User");

    await page.getByLabel("Email").fill("test@example.com");

    await page
      .getByLabel("Password", {
        exact: true,
      })
      .fill("secure-password-123");

    await page.getByLabel("Konfirmasi password").fill("secure-password-123");

    await page
      .getByRole("button", {
        name: "Daftar",
      })
      .click();

    await expect(page.getByText("Anda harus menyetujui syarat dan ketentuan.")).toBeVisible();
  });
});

test("protects audit log page from unauthenticated access", async ({ page }) => {
  await page.goto("/admin/audit-logs");

  await expect(page).toHaveURL(/\/login$/);
});

test("protects user administration page from unauthenticated access", async ({ page }) => {
  await page.goto("/admin/users");

  await expect(page).toHaveURL(/\/login$/);
});

test("protects role administration page from unauthenticated access", async ({ page }) => {
  await page.goto("/admin/roles");

  await expect(page).toHaveURL(/\/login$/);
});
