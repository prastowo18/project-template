import { describe, expect, it } from "vitest";

import {
  AUTH_RATE_LIMIT_DEFAULTS,
  AUTH_RATE_LIMIT_RULES,
  createAuthRateLimitConfig,
} from "@/security";

describe("authentication rate limit", () => {
  it("selalu diaktifkan", () => {
    expect(createAuthRateLimitConfig().enabled).toBe(true);
  });

  it("menggunakan database storage", () => {
    expect(createAuthRateLimitConfig()).toEqual(
      expect.objectContaining({
        storage: "database",
        modelName: "rateLimit",
      }),
    );
  });

  it("memiliki batas default", () => {
    const config = createAuthRateLimitConfig();

    expect(config.window).toBe(AUTH_RATE_LIMIT_DEFAULTS.window);

    expect(config.max).toBe(AUTH_RATE_LIMIT_DEFAULTS.max);
  });

  it("membatasi login email", () => {
    const config = createAuthRateLimitConfig();

    expect(config.customRules[AUTH_RATE_LIMIT_RULES.SIGN_IN_EMAIL.path]).toEqual({
      window: AUTH_RATE_LIMIT_RULES.SIGN_IN_EMAIL.window,
      max: AUTH_RATE_LIMIT_RULES.SIGN_IN_EMAIL.max,
    });
  });

  it("membatasi registrasi email", () => {
    const config = createAuthRateLimitConfig();

    expect(config.customRules[AUTH_RATE_LIMIT_RULES.SIGN_UP_EMAIL.path]).toEqual({
      window: AUTH_RATE_LIMIT_RULES.SIGN_UP_EMAIL.window,
      max: AUTH_RATE_LIMIT_RULES.SIGN_UP_EMAIL.max,
    });
  });
});
