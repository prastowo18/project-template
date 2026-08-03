// @vitest-environment node

import { describe, expect, it } from "vitest";

import { APPLICATION } from "@/config";
import { createServerEnv } from "@/env/schema";

const validRuntimeEnv = {
  DATABASE_URL: "postgresql://user:password@pooler.example.com/database",
  DIRECT_DATABASE_URL: "postgresql://user:password@direct.example.com/database",
  BETTER_AUTH_SECRET: "12345678901234567890123456789012",
  BETTER_AUTH_URL: "https://example.com",
};

describe("application metadata", () => {
  it("memiliki identitas aplikasi", () => {
    expect(APPLICATION.name).toBeTruthy();
    expect(APPLICATION.shortName).toBeTruthy();
    expect(APPLICATION.description).toBeTruthy();
  });

  it("menggunakan bahasa Indonesia", () => {
    expect(APPLICATION.language).toBe("id");
    expect(APPLICATION.locale).toBe("id_ID");
  });

  it("menggunakan warna hexadecimal valid", () => {
    expect(APPLICATION.themeColor).toMatch(/^#[0-9a-f]{6}$/i);

    expect(APPLICATION.backgroundColor).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("menonaktifkan indexing secara default", () => {
    const result = createServerEnv(validRuntimeEnv);

    expect(result.SITE_INDEXING_ENABLED).toBe(false);
  });

  it("dapat mengaktifkan indexing secara eksplisit", () => {
    const result = createServerEnv({
      ...validRuntimeEnv,
      SITE_INDEXING_ENABLED: "true",
    });

    expect(result.SITE_INDEXING_ENABLED).toBe(true);
  });
});
