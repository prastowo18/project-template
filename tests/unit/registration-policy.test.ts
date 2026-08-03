// @vitest-environment node

import { describe, expect, it } from "vitest";

import { createServerEnv } from "@/env/schema";
import { createRegistrationPolicy, PUBLIC_REGISTRATION_DEFAULT } from "@/security";

const validRuntimeEnv = {
  DATABASE_URL: "postgresql://user:password@pooler.example.com/database",
  DIRECT_DATABASE_URL: "postgresql://user:password@direct.example.com/database",
  BETTER_AUTH_SECRET: "12345678901234567890123456789012",
  BETTER_AUTH_URL: "https://example.com",
};

describe("public registration policy", () => {
  it("uses a secure disabled default", () => {
    expect(PUBLIC_REGISTRATION_DEFAULT).toBe(false);

    expect(createRegistrationPolicy()).toEqual({
      disableSignUp: true,
    });
  });

  it("disables sign-up when registration is false", () => {
    expect(createRegistrationPolicy(false)).toEqual({
      disableSignUp: true,
    });
  });

  it("enables sign-up only when explicitly enabled", () => {
    expect(createRegistrationPolicy(true)).toEqual({
      disableSignUp: false,
    });
  });

  it("parses registration environment securely", () => {
    const defaultEnvironment = createServerEnv(validRuntimeEnv);

    const enabledEnvironment = createServerEnv({
      ...validRuntimeEnv,
      PUBLIC_REGISTRATION_ENABLED: "true",
    });

    expect(defaultEnvironment.PUBLIC_REGISTRATION_ENABLED).toBe(false);

    expect(enabledEnvironment.PUBLIC_REGISTRATION_ENABLED).toBe(true);
  });
});
