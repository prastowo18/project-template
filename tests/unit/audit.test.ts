import { describe, expect, it } from "vitest";

import { AUDIT_ACTIONS, AUDIT_CATEGORIES, AUDIT_OUTCOMES, sanitizeAuditMetadata } from "@/audit";

describe("audit catalog", () => {
  it("memiliki action yang unik", () => {
    const actions = Object.values(AUDIT_ACTIONS);

    expect(new Set(actions).size).toBe(actions.length);
  });

  it("memiliki category dan outcome yang unik", () => {
    const categories = Object.values(AUDIT_CATEGORIES);
    const outcomes = Object.values(AUDIT_OUTCOMES);

    expect(new Set(categories).size).toBe(categories.length);

    expect(new Set(outcomes).size).toBe(outcomes.length);
  });

  it("menggunakan category prefix yang dikenal", () => {
    const knownCategories = new Set(Object.values(AUDIT_CATEGORIES));

    for (const action of Object.values(AUDIT_ACTIONS)) {
      const [category] = action.split(".");

      expect(knownCategories.has(category as never)).toBe(true);
    }
  });
});

describe("sanitizeAuditMetadata", () => {
  it("menyamarkan field sensitif secara rekursif", () => {
    const result = sanitizeAuditMetadata({
      email: "user@example.com",
      password: "plain-password",
      nested: {
        accessToken: "secret-token",
        profile: {
          api_key: "secret-key",
          name: "Test User",
        },
      },
    });

    expect(result).toEqual({
      email: "user@example.com",
      password: "[REDACTED]",
      nested: {
        accessToken: "[REDACTED]",
        profile: {
          api_key: "[REDACTED]",
          name: "Test User",
        },
      },
    });
  });

  it("mengubah Date dan bigint menjadi JSON-safe", () => {
    const date = new Date("2026-08-03T03:00:00.000Z");

    const result = sanitizeAuditMetadata({
      date,
      amount: BigInt(100),
    });

    expect(result).toEqual({
      date: "2026-08-03T03:00:00.000Z",
      amount: "100",
    });
  });

  it("tidak mengubah object sumber", () => {
    const source = {
      password: "secret",
      nested: {
        name: "Original",
      },
    };

    sanitizeAuditMetadata(source);

    expect(source).toEqual({
      password: "secret",
      nested: {
        name: "Original",
      },
    });
  });
});
