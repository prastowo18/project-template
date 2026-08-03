import { expect, test } from "@playwright/test";

test.describe("application health", () => {
  test("returns application health status", async ({ request }) => {
    const response = await request.get("/api/health");

    expect(response.status()).toBe(200);

    expect(response.headers()["cache-control"]).toContain("no-store");

    const body: unknown = await response.json();

    expect(body).toEqual(
      expect.objectContaining({
        status: "ok",
        service: "nextjs-standard-template",
        timestamp: expect.any(String),
        uptimeSeconds: expect.any(Number),
      }),
    );
  });

  test("returns valid ISO timestamp", async ({ request }) => {
    const response = await request.get("/api/health");

    const body = (await response.json()) as {
      timestamp: string;
    };

    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });
});

test.describe("security headers", () => {
  test("adds baseline browser security headers", async ({ page }) => {
    const response = await page.goto("/login");

    expect(response).not.toBeNull();

    const headers = response?.headers();

    expect(headers?.["content-security-policy"]).toContain("frame-ancestors 'none'");

    expect(headers?.["content-security-policy"]).toContain("object-src 'none'");

    expect(headers?.["x-content-type-options"]).toBe("nosniff");

    expect(headers?.["x-frame-options"]).toBe("DENY");

    expect(headers?.["referrer-policy"]).toBe("strict-origin-when-cross-origin");

    expect(headers?.["permissions-policy"]).toContain("camera=()");

    expect(headers?.["x-powered-by"]).toBeUndefined();
  });
});
