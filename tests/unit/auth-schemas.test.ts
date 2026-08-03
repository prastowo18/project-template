import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/features/auth";

describe("loginSchema", () => {
  it("menerima data login yang valid", () => {
    const result = loginSchema.parse({
      email: "  admin@example.com  ",
      password: "secure-password-123",
      rememberMe: true,
    });

    expect(result).toEqual({
      email: "admin@example.com",
      password: "secure-password-123",
      rememberMe: true,
    });
  });

  it("menolak email dan password yang tidak valid", () => {
    const result = loginSchema.safeParse({
      email: "invalid-email",
      password: "short",
      rememberMe: false,
    });

    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validRegistration = {
    name: "Template Administrator",
    email: "administrator@example.com",
    password: "secure-password-123",
    passwordConfirmation: "secure-password-123",
    acceptTerms: true,
  };

  it("menerima registrasi yang valid", () => {
    const result = registerSchema.parse(validRegistration);

    expect(result.email).toBe("administrator@example.com");

    expect(result.acceptTerms).toBe(true);
  });

  it("menolak konfirmasi password yang berbeda", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      passwordConfirmation: "different-password-123",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues.some(({ path }) => path[0] === "passwordConfirmation")).toBe(true);
    }
  });

  it("menolak registrasi tanpa persetujuan", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      acceptTerms: false,
    });

    expect(result.success).toBe(false);
  });
});
